import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import SpaceRepo from './space.repo';
import isAuthorized from '../../shared/middleware/isAuthorized';
import validateSchema from '../../shared/middleware/validateSchema';
import {
    getSpacesSchema,
    getSpacesType,
    newSpaceSchema,
    newSpaceType,
    updateSpaceSchema,
    updateSpaceType,
} from './space.schema';
import { get } from 'lodash';
import env from '../../shared/env';

export default class SpaceRoute extends AbstractRoutes {
    constructor(private repo: SpaceRepo, router: Router) {
        super(router, '/space');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;

        if (env.IS_TESTNET) return;

        this.router.post(
            `${this.path}/spaces`,
            isAuthorized(),
            validateSchema(getSpacesSchema),
            async function (req: Request<{}, {}, getSpacesType['body']>, res: Response) {
                const { spaces } = req.body;

                const result = await repo.select(
                    {
                        did: { $in: spaces },
                        isActive: true,
                    },
                    {
                        name: 1,
                        did: 1,
                        url: 1,
                    },
                    {
                        lean: true,
                    }
                );

                return res.status(200).json({ status: true, data: result });
            }
        );

        this.router.post(
            `${this.path}`,
            isAuthorized('dev'),
            validateSchema(newSpaceSchema),
            async function (req: Request<{}, {}, newSpaceType['body']>, res: Response) {
                const { dev } = res.locals;

                const result = await repo.newSpace({ ...req.body, owner: dev?._id! });
                return res.status(result.status ? 201 : 409).json(result);
            }
        );

        this.router.post(
            `${this.path}/rotate/:did`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { dev } = res.locals;
                const { did } = req.params;

                const result = await repo.rotateKeys(dev?._id!, did);
                return res.status(result.status ? 201 : 409).json(result);
            }
        );

        this.router.put(
            `${this.path}/:did`,
            isAuthorized('dev'),
            validateSchema(updateSpaceSchema),
            async function (
                req: Request<{ did: string }, {}, updateSpaceType['body']>,
                res: Response
            ) {
                const { dev } = res.locals;
                const { did } = req.params;

                const result = await repo.updateSpaceURL(dev?._id!, did, req.body.url);
                return res.status(result.status ? 201 : 409).json(result);
            }
        );

        this.router.get(
            `${this.path}`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { dev } = res.locals;

                const page = parseInt(get(req.query, 'page', '1') as string);
                const limit = parseInt(get(req.query, 'limit', '10') as string);
                if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                const result = await repo.getMySpaces(dev?._id!, page, limit);
                return res.status(200).json(result);
            }
        );

        this.router.get(
            `${this.path}/keys/:did`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { dev } = res.locals;
                const { did } = req.params;

                const keys = await repo.selectOne(
                    {
                        owner: dev?._id,
                        did,
                        isActive: true,
                    },
                    {
                        keys: 1,
                    },
                    {
                        lean: true,
                    }
                );

                if (!keys) return res.sendStatus(404);
                return res.status(200).json({ status: true, data: { keys } });
            }
        );

        this.router.get(
            `${this.path}/search`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { dev } = res.locals;

                const q = get(req.query, 'q', undefined);
                if (!q || typeof q != 'string') return res.sendStatus(400);

                const page = parseInt(get(req.query, 'page', '1') as string);
                const limit = parseInt(get(req.query, 'limit', '10') as string);
                if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                const total = await repo.countRows({
                    owner: dev?._id,
                    name: {
                        $regex: q,
                        $options: 'i',
                    },
                });

                const result = await repo.searchSpace(dev?._id!, q, page, limit);
                if (!result) return res.sendStatus(404);

                return res.status(200).json({
                    status: true,
                    data: {
                        page,
                        limit,
                        total,
                        data: result,
                    },
                });
            }
        );

        this.router.get(
            `${this.path}/:did`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { did } = req.params;

                const result = await repo.getSpace(did);
                if (!result) return res.sendStatus(404);

                return res.status(200).json({ status: true, data: result });
            }
        );

        this.router.delete(
            `${this.path}/:did`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { dev } = res.locals;
                const { did } = req.params;

                const result = await repo.deleteSpace(dev?._id!, did);
                return res.status(result.status ? 201 : 409).json(result);
            }
        );
    }
}
