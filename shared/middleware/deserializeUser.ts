import { NextFunction, Response, Request } from 'express';
import { get } from 'lodash';
import { verifyJWT } from '../global';
import SessionRepo from '../../modules/session/session.repo';
import UserRepo from '../../modules/user/user.repo';

const sessionRepo = new SessionRepo();
const userRepo = new UserRepo();

export default async function (req: Request, res: Response, next: NextFunction) {
    const accessToken = get(req, 'headers.authorization', '').replace(/^Bearer\s/, '');
    const refreshToken = get(req, 'headers.x-refresh');

    if (!accessToken) return next();

    const { decoded, expired } = verifyJWT(accessToken);

    if (decoded) {
        const user = await userRepo.getUser(decoded.data?.user._id);
        res.locals.user = user as any;
        res.locals.session = decoded.data?.session;

        return next();
    }

    if (expired && refreshToken) {
        const newAccessToken = await sessionRepo.reissueAccessToken(refreshToken as string);

        if (typeof newAccessToken == 'string') {
            res.setHeader('x-access-token', newAccessToken);

            const result = verifyJWT(newAccessToken as string);
            res.locals.user = result.decoded?.data?.user;
            res.locals.session = result.decoded?.data?.session;
        }

        return next();
    }

    return next();
}
