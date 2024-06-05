import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import AuthRepo from './auth.repo';
import UserRepo from '../user/user.repo';
import { get } from 'lodash';
import SessionRepo from '../session/session.repo';
import { signJWT } from '../../shared/global';
import env from '../../shared/env';
import isAuthorized from '../../shared/middleware/isAuthorized';

const userRepo = new UserRepo();
const sessionRepo = new SessionRepo();

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
            isAuthorized,
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
    }
}
