import { Request, Response, NextFunction } from 'express';
import { get } from 'lodash';
import SpaceRepo from '../../modules/space/space.repo';

const spaceRepo = new SpaceRepo();

export default function (actor: ACTORS = 'user') {
    return async function (req: Request, res: Response, next: NextFunction) {
        switch (actor) {
            case 'user':
                if (!res.locals.user || !res.locals.session) return res.sendStatus(401);
                return next();

            case 'dev':
                const dev = get(req.session, 'dev', undefined);
                if (!dev) return res.sendStatus(401);

                res.locals.dev = dev;
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
