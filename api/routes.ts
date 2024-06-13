import { Request, Response, Router } from 'express';
import AuthRoute from '../modules/auth/auth.route';
import AuthRepo from '../modules/auth/auth.repo';
import SessionRoute from '../modules/session/session.route';
import SessionRepo from '../modules/session/session.repo';
import UserRoute from '../modules/user/user.route';
import UserRepo from '../modules/user/user.repo';
import DevRoute from '../modules/dev/dev.route';
import DevRepo from '../modules/dev/dev.repo';
import IdentityRoute from '../modules/identity/identity.route';
import IdentityManagement from '../shared/adapters/identity';
import FileBase from '../shared/adapters/filebase';
import SpaceRoute from '../modules/space/space.route';
import SpaceRepo from '../modules/space/space.repo';
import BookmarkRoute from '../modules/bookmarks/bookmark.route';
import BookmarkRepo from '../modules/bookmarks/bookmark.repo';
import MiscRoute from '../modules/misc/misc.route';
import { getCollectionMetadata, getNftItemMetadata } from '../modules/misc/misc.controllers';

function initRoutes(router: Router) {
    new AuthRoute(new AuthRepo(), router);
    new SessionRoute(new SessionRepo(), router);
    new UserRoute(new UserRepo(), router);
    new DevRoute(new DevRepo(), router);
    new IdentityRoute(new IdentityManagement(), new FileBase(), router);
    new SpaceRoute(new SpaceRepo(), router);
    new BookmarkRoute(new BookmarkRepo(), router);
    new MiscRoute(router);
}

const routes = Router();
initRoutes(routes);

routes.get('/healthz', (_: Request, res: Response) => res.sendStatus(200));

routes.get('/collection/metadata', getCollectionMetadata);
routes.get('/nft/metadata/:username', getNftItemMetadata);

export = routes;
