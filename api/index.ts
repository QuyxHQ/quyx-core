import express, { Response, NextFunction, Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import routes from './routes';
import env from '../shared/env';
import deserializeUser from '../shared/middleware/deserializeUser';
import { Logger } from '../shared/logger';
import { get } from 'lodash';
import SpaceRepo from '../modules/space/space.repo';
import LogRepo from '../modules/log/log.repo';
import { getLogAction } from '../shared/global';

const spaceRepo = new SpaceRepo();
const logRepo = new LogRepo();

export default function createServer() {
    const app = express();

    if (env.SENTRY_DSN) {
        Sentry.init({
            dsn: env.SENTRY_DSN,
            integrations: [
                new Sentry.Integrations.Http({ tracing: true }),
                new Sentry.Integrations.Express({ app }),
                nodeProfilingIntegration(),
            ],
            tracesSampleRate: 1.0,
            profilesSampleRate: 1.0,
        });

        app.use(Sentry.Handlers.requestHandler());
        app.use(Sentry.Handlers.tracingHandler());
    }

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use(helmet());

    app.use(
        morgan('combined', {
            stream: fs.createWriteStream(path.join(__dirname, '../logs/access.log'), {
                flags: 'a',
            }),
        })
    );

    app.use(
        cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'Authorization',
                'X-Refresh',
                'X-Dev-Token',
                'Quyx-SK',
                'Quyx-PK',
                'cache',
            ],
            exposedHeaders: ['X-Access-Token'],
        })
    );

    app.use((_, res: Response, next: NextFunction) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

        next();
    });

    app.use(async function (req: Request, res: Response, next: NextFunction) {
        const pk = get(req.headers, 'quyx-pk', undefined);
        const sk = get(req.headers, 'quyx-sk', undefined);
        if (!pk && !sk) return next();

        const space = await spaceRepo.selectOne(
            {
                ...(pk ? { 'keys.pk': pk } : { 'keys.sk': sk }),
                isActive: true,
            },
            {},
            {
                lean: true,
            }
        );

        if (!space) return next();
        const start = Date.now();

        res.on('finish', async () => {
            const response_time = Date.now() - start;
            const action = getLogAction(req.path);

            if (action) {
                await logRepo.addLog({
                    dev: space.owner,
                    response_time,
                    space: space._id as string,
                    status: res.statusCode < 400 ? 'successful' : 'failed',
                    action,
                    log: JSON.stringify({ body: req.body, query: req.query, params: req.params }),
                });
            }
        });

        next();
    });

    app.use(deserializeUser);
    app.use(routes);

    if (env.SENTRY_DSN) {
        app.use(Sentry.Handlers.errorHandler());
        app.use(function onError(err: any, _: any, res: any, __: any) {
            Logger.red(err);

            res.statusCode = 500;
            res.json({
                status: false,
                error_id: res.sentry,
                message: 'unexpected error occured',
            });
        });
    }

    return app;
}
