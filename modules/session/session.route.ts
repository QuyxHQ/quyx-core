import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import SessionRepo from './session.repo';
import isAuthorized from '../../shared/middleware/isAuthorized';

export default class SessionRoute extends AbstractRoutes {
    constructor(private repo: SessionRepo, router: Router) {
        super(router, '/session');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;

        //# gets all users sessions
        this.router.get(`${this.path}`, isAuthorized(), async function (_: Request, res: Response) {
            const { user } = res.locals;

            const result = await repo.getSessions(user?._id!);
            return res.status(200).json({
                status: true,
                data: result,
            });
        });

        //# gets current session
        this.router.get(
            `${this.path}/current`,
            isAuthorized(),
            async function (_: Request, res: Response) {
                const { user, session } = res.locals;

                const result = await repo.getSession(user?._id!, session?._id!);
                if (!result) return res.sendStatus(404);

                return res.status(200).json({
                    status: true,
                    data: result,
                });
            }
        );

        //# deletes a session
        this.router.delete(
            `${this.path}/:session`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                const { user } = res.locals;
                const { session } = req.params;

                const result = await repo.deleteSession(user?._id!, session);
                return res.status(result.status ? 201 : 409).json({
                    status: true,
                    data: result,
                });
            }
        );

        //# deletes all session
        this.router.delete(
            `${this.path}`,
            isAuthorized(),
            async function (_: Request, res: Response) {
                const { user } = res.locals;

                const result = await repo.deleteAllSessions(user?._id!);
                return res.status(result.status ? 201 : 409).json({
                    status: true,
                    data: result,
                });
            }
        );
    }
}
