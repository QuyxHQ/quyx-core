import { Request, Response, NextFunction } from 'express';
import { get } from 'lodash';
import SpaceRepo from '../../modules/space/space.repo';
import DevRepo from '../../modules/dev/dev.repo';
import { verifyJWT } from '../global';

const spaceRepo = new SpaceRepo();
const devRepo = new DevRepo();

export default function (actor: ACTORS | ACTORS[] = 'user') {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (Array.isArray(actor)) {
            const pk = get(req.headers, 'quyx-pk', undefined);
            const sk = get(req.headers, 'quyx-sk', undefined);
            if (!pk && !sk) return res.sendStatus(401);

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

            if (!space) return res.sendStatus(401);

            res.locals.space = space;
            return next();
        }

        switch (actor) {
            case 'user':
                if (!res.locals.user || !res.locals.session) return res.sendStatus(401);
                return next();

            case 'dev':
                const token = get(req.headers, 'x-dev-token', undefined);
                if (!token) return res.sendStatus(401);
                if (typeof token != 'string') return res.sendStatus(401);

                const { decoded, expired } = verifyJWT(token);
                if (expired || !decoded) return res.sendStatus(401);

                const dev = await devRepo.findDev(decoded.data);
                if (!dev) return res.sendStatus(401);

                res.locals.dev = dev as any;
                return next();

            case 'space:pk':
                const pk = get(req.headers, 'quyx-pk', undefined);
                if (!pk) return res.sendStatus(401);

                const pk_space = await spaceRepo.selectOne(
                    {
                        'keys.pk': pk,
                        isActive: true,
                    },
                    {},
                    {
                        lean: true,
                    }
                );

                if (!pk_space) return res.sendStatus(401);

                res.locals.space = pk_space;
                return next();

            case 'space:sk':
                const sk = get(req.headers, 'quyx-sk', undefined);
                if (!sk) return res.sendStatus(401);

                const space_sk = await spaceRepo.selectOne(
                    {
                        'keys.sk': sk,
                        isActive: true,
                    },
                    {},
                    {
                        lean: true,
                    }
                );

                if (!space_sk) return res.sendStatus(401);

                res.locals.space = space_sk;
                return next();

            default:
                return res.sendStatus(422);
        }
    };
}
