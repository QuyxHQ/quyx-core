import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import BookmarkRepo from './bookmark.repo';
import isAuthorized from '../../shared/middleware/isAuthorized';
import { get } from 'lodash';
import { Address } from 'ton-core';

export default class BookmarkRoute extends AbstractRoutes {
    constructor(private repo: BookmarkRepo, router: Router) {
        super(router, '/bookmark');
        this.handle();
    }

    public handle(): void {
        const repo = this.repo;

        //# gets bookmarks of the logged in user
        this.router.get(
            `${this.path}`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                const { user } = res.locals;

                const page = parseInt(get(req.query, 'page', '1') as string);
                const limit = parseInt(get(req.query, 'limit', '20') as string);
                if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                const result = await repo.getBookmarks(user?._id!, page, limit);
                return res.status(result.status ? 200 : 409).json(result);
            }
        );

        //# gets bookmark count of an nft
        this.router.get(
            `${this.path}/count/:address`,
            async function (req: Request, res: Response) {
                const { address } = req.params;

                const count = await repo.countRows({
                    address: Address.parse(address).toRawString(),
                });

                return res.status(200).json({ status: true, data: { count } });
            }
        );

        //# returns if the logged in user bookmarked the nft or not
        this.router.get(
            `${this.path}/:address`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                const { user } = res.locals;
                const { address } = req.params;

                const isBookmarked = await repo.isInBookmark(user?._id!, address);
                return res.status(200).json({ status: isBookmarked });
            }
        );

        //# bookmarks an nft
        this.router.put(
            `${this.path}/:address`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                const { user } = res.locals;
                const { address } = req.params;

                const result = await repo.addToBookmark(user?._id!, address);
                return res.status(result.status ? 200 : 409).json(result);
            }
        );

        //# removes an nft from bookmark
        this.router.delete(
            `${this.path}/:address`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                const { user } = res.locals;
                const { address } = req.params;

                const result = await repo.removeFromBookmark(user?._id!, address);
                return res.status(result.status ? 200 : 409).json(result);
            }
        );

        //# empties bookmark
        this.router.delete(
            `${this.path}`,
            isAuthorized(),
            async function (_: Request, res: Response) {
                const { user } = res.locals;

                const result = await repo.clearBookmarks(user?._id!);
                return res.status(result.status ? 200 : 409).json(result);
            }
        );
    }
}
