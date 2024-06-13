import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import UserRepo from './user.repo';
import { get } from 'lodash';
import isAuthorized from '../../shared/middleware/isAuthorized';
import { updateUserSchema, updateUserType } from './user.schema';
import validateSchema from '../../shared/middleware/validateSchema';
import { tonSdk } from '../../shared/adapters/tonapi/service';
import { Address } from 'ton-core';
import { Logger } from '../../shared/logger';
import { isValidAddress } from '../../shared/global';
import BookmarkRepo from '../bookmarks/bookmark.repo';

const bookmarkRepo = new BookmarkRepo();

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
            isAuthorized(),
            validateSchema(updateUserSchema),
            async function (req: Request<{}, {}, updateUserType['body']>, res: Response) {
                const { user } = res.locals;
                const { username, bio, pfp, socials } = req.body;

                if (username != user?.username) {
                    const doesUsernameExist = await repo.countRows({ username });
                    if (doesUsernameExist > 0) {
                        return res
                            .status(409)
                            .json({ status: false, error: 'Error: Username already exist' });
                    }
                }

                const result = await repo.updateUserInfo(user?._id!, {
                    username,
                    socials,
                    bio,
                    pfp,
                });

                return res.status(result.status ? 201 : 422).json(result);
            }
        );

        //# gets current logged in user
        this.router.get(
            `${this.path}/whoami`,
            isAuthorized(),
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
            isAuthorized(),
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

        //# gets user NFTs
        this.router.get(`${this.path}/nfts/:address`, async function (req: Request, res: Response) {
            const { user } = res.locals;
            const { address } = req.params;

            const page = parseInt(get(req.query, 'page', '1') as string);
            const limit = parseInt(get(req.query, 'limit', '10') as string);

            if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

            try {
                const { nft_items } = await tonSdk.getUserUsernames(
                    Address.parse(address).toRawString(),
                    page,
                    limit
                );

                const fns = nft_items.map(async (item) => {
                    const isBookmarked = await bookmarkRepo.isInBookmark(
                        user?._id || null,
                        item.address
                    );

                    return { nft: item, user: null, isBookmarked };
                });

                const result = await Promise.all(fns);

                return res.status(200).json({ status: true, data: result });
            } catch (e: any) {
                Logger.red(e);

                return res.status(500).json({ status: false, error: e.message });
            }
        });

        //# gets a user from _id | username | address
        this.router.get(`${this.path}/:param`, async function (req: Request, res: Response) {
            const { param } = req.params;

            let result;

            if (isValidAddress(param)) result = (await repo.upsertUser(param)).data;
            else result = await repo.getUser(param);

            if (!result) return res.sendStatus(404);

            return res.status(200).json({
                status: true,
                data: result,
            });
        });
    }
}
