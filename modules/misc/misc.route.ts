import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import BookmarkRepo from '../bookmarks/bookmark.repo';
import { tonSdk } from '../../shared/adapters/tonapi/service';
import { Address } from 'ton-core';
import { Logger } from '../../shared/logger';
import UserRepo from '../user/user.repo';
import { get } from 'lodash';

const bookmarkRepo = new BookmarkRepo();
const userRepo = new UserRepo();

export default class MiscRoute extends AbstractRoutes {
    constructor(router: Router) {
        super(router, '/misc');
        this.handle();
    }

    public handle(): void {
        //# TODO: manage auctions

        //# gets all nft under the collection
        this.router.get(`${this.path}/nfts`, async function (req: Request, res: Response) {
            try {
                const page = parseInt(get(req.query, 'page', '1') as string);
                const limit = parseInt(get(req.query, 'limit', '30') as string);
                if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                const { nft_items } = await tonSdk.getUsernames(page, limit);
                return res.status(200).json({ status: true, data: nft_items });
            } catch (e: any) {
                Logger.red(e);

                return res.status(500).json({ status: false, error: e.message });
            }
        });

        //# information about an nft
        this.router.get(`${this.path}/nft/:address`, async function (req: Request, res: Response) {
            const { address } = req.params;
            const { user } = res.locals;

            try {
                let isBookmarked = false;
                const rawAddr = Address.parse(address).toRawString();

                const [bookmarks, result] = await Promise.all([
                    bookmarkRepo.countRows({ address: rawAddr }),
                    tonSdk.getUsername(rawAddr),
                ]);

                if (user) isBookmarked = await bookmarkRepo.isInBookmark(user._id, address);
                const { data } = await userRepo.upsertUser(result.address);

                return res.status(200).json({
                    ...result,
                    bookmarks,
                    isBookmarked,
                    nft_owner: data,
                });
            } catch (e: any) {
                Logger.red(e);

                return res.status(500).json({ status: false, error: e.message });
            }
        });
    }
}
