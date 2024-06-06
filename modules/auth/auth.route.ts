import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import AuthRepo from './auth.repo';
import UserRepo from '../user/user.repo';
import { get } from 'lodash';
import SessionRepo from '../session/session.repo';
import { signJWT } from '../../shared/global';
import env from '../../shared/env';
import isAuthorized from '../../shared/middleware/isAuthorized';
import { githubSdk } from './oauth/github';
import { googleSdk } from './oauth/google';
import DevRepo from '../dev/dev.repo';
import { Logger } from '../../shared/logger';

const userRepo = new UserRepo();
const sessionRepo = new SessionRepo();
const devRepo = new DevRepo();

export default class AuthRoute extends AbstractRoutes {
    constructor(private repo: AuthRepo, router: Router) {
        super(router, '/auth');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;

        //# login with telegram
        this.router.put(
            `${this.path}/callback`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                const { user } = res.locals;

                const tg_auth = get(req.body, 'tg_auth', undefined);
                if (!tg_auth) return res.sendStatus(400);

                const { status, error, data } = await repo.authenticationWithTG(tg_auth);

                if (!status) {
                    return res.status(409).json({ status, error });
                }

                const { id, first_name, last_name, username, photo_url, language_code } = data!;

                const result = await userRepo.populateTGFields(user?._id!, {
                    id,
                    firstName: first_name,
                    lastName: last_name,
                    username,
                    languageCode: language_code,
                    photoUrl: photo_url,
                });

                return res.status(result.status ? 200 : 409).json(result);
            }
        );

        //# getting ton proof payload
        this.router.get(`${this.path}/token`, async function (_: Request, res: Response) {
            const result = await repo.generateToken();
            return res.status(result.status ? 200 : 500).json(result);
        });

        //# verify ton proof and sign user in
        this.router.post(`${this.path}`, async function (req: Request, res: Response) {
            const { data, status, error } = await repo.tonProof(
                get(req.body, 'walletInfo', undefined)
            );

            if (!status) {
                return res.status(400).json({ status, error });
            }

            const { address } = data!;

            const result = await userRepo.upsertUser(address);
            if (!result.status) return res.status(409).json(result);

            const user = result.data!;

            const session = await sessionRepo.createSession({
                user: user._id! as string,
                device: req.get('user-agent') || null,
            });

            if (!session.status) return res.status(500).json(session);

            const payload = {
                data: {
                    user,
                    session: session.data,
                },
            };

            const accessToken = signJWT(payload, {
                expiresIn: env.ACCESS_TOKEN_TTL,
            });

            const refreshToken = signJWT(payload, {
                expiresIn: env.REFRESH_TOKEN_TTL,
            });

            return res.status(201).json({
                status: true,
                data: {
                    accessToken,
                    refreshToken,
                },
            });
        });

        //# Github OAuth init
        this.router.get(`${this.path}/github`, async function (req: Request, res: Response) {
            const url = githubSdk.authURL();
            return res.redirect(url);
        });

        //# Github OAuth callback
        this.router.get(
            `${this.path}/github/callback`,
            async function (req: Request, res: Response) {
                const code = get(req.query, 'code', undefined) as string | undefined;
                if (!code) return res.sendStatus(400);

                try {
                    const token = await githubSdk.getToken(code);
                    const user = await githubSdk.getUser(token);

                    if (!user.email) {
                        return res.redirect(
                            `${env.DEV_BASE_URL}/oauth/callback/github?error=No public email available on this github account`
                        );
                    }

                    const dev = await devRepo.findDev(user.email);
                    if (dev && dev.provider !== 'github') {
                        return res.redirect(
                            `${env.DEV_BASE_URL}/oauth/callback/github?error=This email is in use by another account`
                        );
                    }

                    const result = await devRepo.upsertDev({
                        email: user.email,
                        name: user.name.split(' ')[0],
                        picture: user.avatar_url,
                        provider: 'github',
                    });

                    if (!result.status) {
                        return res.redirect(
                            `${env.DEV_BASE_URL}/oauth/callback/github?error${result.error}`
                        );
                    }

                    req.session.dev = result.data as unknown as Base & Dev;

                    return res.redirect(`${env.DEV_BASE_URL}/oauth/callback/github`);
                } catch (e: any) {
                    Logger.red(e);

                    return res.redirect(
                        `${env.DEV_BASE_URL}/oauth/callback/github?error=${e.message}`
                    );
                }
            }
        );

        //# Github OAuth init
        this.router.get(`${this.path}/google`, async function (req: Request, res: Response) {
            const url = githubSdk.authURL();
            return res.redirect(url);
        });

        //# Google OAuth callback
        this.router.get(
            `${this.path}/google/callback`,
            async function (req: Request, res: Response) {
                const code = get(req.query, 'code', undefined) as string | undefined;
                if (!code) return res.sendStatus(400);

                try {
                    const token = await googleSdk.getToken(code);
                    const user = await googleSdk.getUser(token);

                    const dev = await devRepo.findDev(user.email);
                    if (dev && dev.provider !== 'google') {
                        return res.redirect(
                            `${env.DEV_BASE_URL}/oauth/callback/google?error=This email is in use by another account`
                        );
                    }

                    const result = await devRepo.upsertDev({
                        email: user.email,
                        name: user.name.split(' ')[0],
                        picture: user.picture,
                        provider: 'github',
                    });

                    if (!result.status) {
                        return res.redirect(
                            `${env.DEV_BASE_URL}/oauth/callback/google?error${result.error}`
                        );
                    }

                    req.session.dev = result.data as unknown as Base & Dev;

                    return res.redirect(`${env.DEV_BASE_URL}/oauth/callback/google`);
                } catch (e: any) {
                    Logger.red(e);

                    return res.redirect(
                        `${env.DEV_BASE_URL}/oauth/callback/google?error=${e.message}`
                    );
                }
            }
        );
    }
}
