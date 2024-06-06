import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import isAuthorized from '../../shared/middleware/isAuthorized';
import DevRepo from './dev.repo';

export default class DevRoute extends AbstractRoutes {
    constructor(private repo: DevRepo, router: Router) {
        super(router, '/dev');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;

        //# gets the current dev
        this.router.get(
            `${this.path}/whoami`,
            isAuthorized('dev'),
            async function (_: Request, res: Response) {
                const { dev } = res.locals;

                return res.status(200).json({
                    status: true,
                    data: dev,
                });
            }
        );
    }
}
