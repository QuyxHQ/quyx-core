import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import UserRepo from './user.repo';
import { get } from 'lodash';
import isAuthorized from '../../shared/middleware/isAuthorized';
import { updateUserSchema, updateUserType } from './user.schema';
import validateSchema from '../../shared/middleware/validateSchema';

export default class UserRoute extends AbstractRoutes {
    constructor(private repo: UserRepo, router: Router) {
        super(router, '/user');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;

        //# update information
        this.router.put(
            `${this.path}`,
            isAuthorized,
            validateSchema(updateUserSchema),
            async function (req: Request<{}, {}, updateUserType['body']>, res: Response) {
                const { user } = res.locals;
                const { username, socials } = req.body;

                if (username != user?.username) {
                    const doesUsernameExist = await repo.countRows({ username });
                    if (doesUsernameExist > 0) {
                        return res
                            .status(409)
                            .json({ status: false, error: 'Error: Username already exist' });
                    }
                }

                const result = await repo.updateUserInfo(user?._id!, { username, socials });
                return res.status(result.status ? 201 : 422).json(result);
            }
        );

        //# gets current logged in user
        this.router.get(
            `${this.path}/whoami`,
            isAuthorized,
            async function (_: Request, res: Response) {
                const { user } = res.locals;

                const result = await repo.getUser(user?._id!);
                return res.status(200).json({
                    status: true,
                    data: result,
                });
            }
        );

        //# search for a user
        this.router.get(
            `${this.path}/search`,
            isAuthorized,
            async function (req: Request, res: Response) {
                const q = get(req.query, 'q', undefined) as string | undefined;
                if (!q) return res.sendStatus(400);

                const limit = parseInt(get(req.query, 'limit', '10') as string);
                const page = parseInt(get(req.query, 'page', '1') as string);
                if (isNaN(limit) || isNaN(page)) return res.sendStatus(400);

                const skip = (page - 1) * limit;

                const totalResult = await repo.countRows({
                    username: {
                        $regex: q,
                        $options: 'i',
                    },
                });

                const result = await repo.searchForUser(q, limit, skip);

                return res.status(200).json({
                    status: true,
                    total: totalResult,
                    data: result,
                });
            }
        );

        //# gets a user from _id | username | address
        this.router.get(`${this.path}/:user`, async function (req: Request, res: Response) {
            const { user } = req.params;

            const result = await repo.getUser(user);
            if (!result) return res.sendStatus(404);

            return res.status(200).json({
                status: true,
                data: result,
            });
        });
    }
}
