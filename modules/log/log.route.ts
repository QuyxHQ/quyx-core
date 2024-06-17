import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import isAuthorized from '../../shared/middleware/isAuthorized';
import env from '../../shared/env';
import LogRepo from './log.repo';
import { get } from 'lodash';

export default class LogRoute extends AbstractRoutes {
    constructor(private repo: LogRepo, router: Router) {
        super(router, '/log');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;

        if (env.IS_TESTNET) return;

        //# gets logs for a space
        this.router.get(
            `${this.path}/space/:id`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { id: space } = req.params;

                const page = parseInt(get(req.query, 'page', '1') as string);
                const limit = parseInt(get(req.query, 'limit', '30') as string);
                if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                const [response, total] = await Promise.all([
                    repo.getSpaceLogs(space, page, limit),
                    repo.countRows({ space }),
                ]);

                return res.status(200).json({
                    status: true,
                    data: { total, response },
                });
            }
        );

        //# gets logs for logged in dev
        this.router.get(
            `${this.path}/dev`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { dev } = res.locals;

                const page = parseInt(get(req.query, 'page', '1') as string);
                const limit = parseInt(get(req.query, 'limit', '30') as string);
                if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                const [response, total] = await Promise.all([
                    repo.getDevLogs(dev?._id! as string, page, limit),
                    repo.countRows({ dev: dev?._id }),
                ]);

                return res.status(200).json({
                    status: true,
                    data: { total, response },
                });
            }
        );

        //# gets metrics for a space
        this.router.get(
            `${this.path}/space/metrics/:id`,
            isAuthorized('dev'),
            async function (req: Request, res: Response) {
                const { id: space } = req.params;

                const result = await repo.getSpaceMetrics(space);
                return res.status(200).json({ status: true, data: result });
            }
        );

        //# gets metrics for the logged in dev
        this.router.get(
            `${this.path}/dev/metrics`,
            isAuthorized('dev'),
            async function (_: Request, res: Response) {
                const { dev } = res.locals;

                const result = await repo.getDevMetrics(dev?._id as string);
                return res.status(200).json({ status: true, data: result });
            }
        );
    }
}
