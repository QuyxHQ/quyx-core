import { Request, Response, Router } from 'express';
import AuthRoute from '../modules/auth/auth.route';
import AuthRepo from '../modules/auth/auth.repo';
import SessionRoute from '../modules/session/session.route';
import SessionRepo from '../modules/session/session.repo';
import UserRoute from '../modules/user/user.route';
import UserRepo from '../modules/user/user.repo';

function initRoutes(router: Router) {
    new AuthRoute(new AuthRepo(), router);
    new SessionRoute(new SessionRepo(), router);
    new UserRoute(new UserRepo(), router);
}

const routes = Router();
initRoutes(routes);

routes.get('/healthz', (_req: Request, res: Response) => res.sendStatus(200));

export = routes;
