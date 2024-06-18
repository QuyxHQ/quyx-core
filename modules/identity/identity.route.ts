import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import isAuthorized from '../../shared/middleware/isAuthorized';
import redis from '../../shared/adapters/redis';
import { get } from 'lodash';
import IdentityManagement, { SpaceFileObject, VCFileObject } from '../../shared/adapters/identity';
import FileBase from '../../shared/adapters/filebase';
import validateSchema from '../../shared/middleware/validateSchema';
import {
    issueCredentialSchema,
    issueCredentialType,
    verifyCredentialSchema,
    verifyCredentialType,
} from './identity.schema';
import { Logger } from '../../shared/logger';
import { Address } from 'ton-core';
import { getHashKey } from '../../shared/global';
import env from '../../shared/env';

export default class IdentityRoute extends AbstractRoutes {
    constructor(private repo: IdentityManagement, private storage: FileBase, router: Router) {
        super(router, '/identity');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;
        const storage = this.storage;

        if (env.IS_TESTNET) return;

        //# issue a credential
        this.router.post(
            `${this.path}/issue-vc`,
            isAuthorized(),
            validateSchema(issueCredentialSchema),
            async function (req: Request<{}, {}, issueCredentialType['body']>, res: Response) {
                const { user } = res.locals;
                const { payload, expires } = req.body;

                try {
                    const result = await repo.issueCredential(
                        user?.did!,
                        {
                            ...payload,
                            address: Address.parse(user?.address!).toRawString(),
                        },
                        expires
                    );

                    return res.status(201).json({ status: true, data: result });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# verify a credential
        this.router.post(
            `${this.path}/verify-vc`,
            isAuthorized('space:pk'),
            validateSchema(verifyCredentialSchema),
            async function (req: Request<{}, {}, verifyCredentialType['body']>, res: Response) {
                try {
                    const { jwt } = req.body;

                    const result = await repo.verifyCredential(jwt);
                    return res.status(201).json({ status: true, data: result });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# permit site
        this.router.put(
            `${this.path}/permit/:hash`,
            [isAuthorized(), isAuthorized('space:pk')],
            async function (req: Request, res: Response) {
                try {
                    const { space } = res.locals;
                    const { hash } = req.params;

                    await repo.permitSpace(hash, space?.did!);
                    return res.status(201).json({ status: true });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# revoke space access to a credential
        this.router.delete(
            `${this.path}/revoke/:did/:hash`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                try {
                    const { did, hash } = req.params;

                    await repo.revokeSpaceAccess(hash, did);
                    return res.status(201).json({ status: true });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# revoke a credential (revokes all space access)
        this.router.delete(
            `${this.path}/revoke/:hash`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                try {
                    const { hash } = req.params;

                    await repo.revoke(hash);
                    return res.status(201).json({ status: true });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# get all the user credentials
        this.router.get(
            `${this.path}/user`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                try {
                    const { user } = res.locals;

                    const page = parseInt(get(req.query, 'page', '1') as string);
                    const limit = parseInt(get(req.query, 'limit', '10') as string);
                    if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                    const skip = (page - 1) * limit;

                    const revalidate = get(req.query, 'revalidate', 'no');

                    const userHash = await repo.hash(user?.did!);
                    const key = getHashKey(userHash);

                    const userCache = await redis.get(key);
                    let userFileContent: string[];

                    if (userCache && revalidate === 'no') {
                        userFileContent = userCache as string[];
                    } else {
                        const { gateway } = await storage.getFile(userHash);
                        userFileContent = (await storage.readContentFromFile(gateway)) as string[];

                        await redis.set(key, userFileContent);
                    }

                    const total = userFileContent.length;
                    const HASHES = userFileContent.reverse().splice(skip, skip + limit);

                    const fn = HASHES.map(async (hash) => {
                        try {
                            const key = getHashKey(hash);
                            const hashCache = await redis.get(key);

                            if (hashCache && revalidate === 'no') {
                                const vc = hashCache as VCFileObject;
                                const credential = await repo.verifyCredential(vc.jwt);

                                return { ...vc, credential };
                            }

                            const { gateway } = await storage.getFile(hash);
                            const vc = (await storage.readContentFromFile(gateway)) as VCFileObject;
                            await redis.set(key, vc);

                            const payload = await repo.verifyCredential(vc.jwt);
                            return { ...vc, payload };
                        } catch (e: any) {
                            return;
                        }
                    });

                    const data = await Promise.all(fn);

                    return res.status(200).json({
                        status: true,
                        data: {
                            page,
                            limit,
                            total,
                            data: data.filter((item) => item != undefined),
                        },
                    });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# get all credentials in a space
        this.router.get(
            `${this.path}`,
            isAuthorized('space:sk'),
            async function (req: Request, res: Response) {
                try {
                    const { space } = res.locals;

                    const page = parseInt(get(req.query, 'page', '1') as string);
                    const limit = parseInt(get(req.query, 'limit', '10') as string);
                    if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                    const skip = (page - 1) * limit;

                    const revalidate = get(req.query, 'revalidate', 'no');

                    const spaceHash = await repo.hash(space?.did!);
                    const key = getHashKey(spaceHash);

                    const spaceCache = await redis.get(key);
                    let spaceFileContent: SpaceFileObject;

                    if (spaceCache && revalidate === 'no') {
                        spaceFileContent = spaceCache as SpaceFileObject;
                    } else {
                        const { gateway } = await storage.getFile(spaceHash);
                        spaceFileContent = (await storage.readContentFromFile(gateway)) as any;

                        await redis.set(key, spaceFileContent);
                    }

                    const total = spaceFileContent.hashes.length;
                    const HASHES = spaceFileContent.hashes.splice(skip, skip + limit);

                    const fn = HASHES.map(async (hash) => {
                        try {
                            const key = getHashKey(hash);
                            const hashCache = await redis.get(key);

                            if (hashCache && revalidate === 'no') {
                                const content = hashCache as VCFileObject;
                                if (content.revoked) return;

                                const credential = await repo.getCredential(content.jwt);
                                if (!credential.verified) return;

                                return credential;
                            }

                            const { gateway } = await storage.getFile(hash);
                            const vc = (await storage.readContentFromFile(gateway)) as VCFileObject;
                            if (vc.revoked) return;

                            await redis.set(key, vc);

                            const credential = await repo.getCredential(vc.jwt);
                            if (!credential.verified) return;

                            return credential;
                        } catch (e: any) {
                            return;
                        }
                    });

                    const data = await Promise.all(fn);

                    return res.status(200).json({
                        status: true,
                        data: {
                            page,
                            limit,
                            total,
                            data: data.filter((item) => item != undefined),
                        },
                    });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# get a user credential in a space
        this.router.get(
            `${this.path}/user/:did`,
            isAuthorized('space:sk'),
            async function (req: Request, res: Response) {
                try {
                    const { space } = res.locals;
                    const { did } = req.params;
                    const revalidate = get(req.query, 'revalidate', 'no');

                    const spaceHash = await repo.hash(space?.did!);
                    const key = getHashKey(spaceHash);
                    let spaceFileContent: SpaceFileObject;

                    const spaceCache = await redis.get(key);
                    if (spaceCache && revalidate === 'no') {
                        spaceFileContent = spaceCache as SpaceFileObject;
                    } else {
                        const { gateway } = await storage.getFile(spaceHash);
                        spaceFileContent = (await storage.readContentFromFile(gateway)) as any;

                        await redis.set(key, spaceFileContent);
                    }

                    const hash = spaceFileContent.maps[did];
                    if (!hash || (hash && !spaceFileContent.hashes.includes(hash))) {
                        return res.sendStatus(404); // the user DID is not in this space
                    }

                    const hashCache = await redis.get(getHashKey(hash));
                    let vc: VCFileObject;

                    if (hashCache && revalidate === 'no') {
                        vc = hashCache as VCFileObject;
                    } else {
                        const { gateway } = await storage.getFile(hash);
                        vc = (await storage.readContentFromFile(gateway)) as VCFileObject;
                    }

                    if (vc.revoked) {
                        await repo.revokeSpaceAccess(hash, space?.did!);
                        return res.sendStatus(404);
                    }

                    const credential = await repo.getCredential(vc.jwt);
                    if (!credential.verified) return res.sendStatus(409);

                    return res.status(200).json({ status: true, data: credential });
                } catch (e: any) {
                    Logger.red(e);

                    return res.status(409).json({ status: false, error: e.message });
                }
            }
        );

        //# get a data from hash
        this.router.get(`${this.router}/:hash`, async function (req: Request, res: Response) {
            try {
                const { hash } = req.params;
                const revalidate = get(req.query, 'revalidate', 'no');

                const key = getHashKey(hash);

                const cache = await redis.get(key);
                if (cache && revalidate === 'no') {
                    return res.status(200).json({ status: true, data: cache });
                }

                const { gateway } = await storage.getFile(hash);
                const data = await storage.readContentFromFile(gateway);

                await redis.set(key, data);

                return res.status(200).json({ status: true, data });
            } catch (e: any) {
                Logger.red(e);

                return res.status(409).json({ status: false, error: e.message });
            }
        });
    }
}
