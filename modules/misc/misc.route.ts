import { Request, Response, Router } from 'express';
import { AbstractRoutes } from '../../shared/abstract.routes';
import BookmarkRepo from '../bookmarks/bookmark.repo';
import { tonSdk } from '../../shared/adapters/tonapi/service';
import { Address } from 'ton-core';
import { Logger } from '../../shared/logger';
import UserRepo from '../user/user.repo';
import { get } from 'lodash';
import isAuthorized from '../../shared/middleware/isAuthorized';
import Client from '../../shared/Client';
import { NftItem } from '../../contracts/tact_NftItem';

const bookmarkRepo = new BookmarkRepo();
const userRepo = new UserRepo();

export default class MiscRoute extends AbstractRoutes {
    constructor(router: Router) {
        super(router, '/misc');
        this.handle();
    }

    public handle(): void {
        //# upload image
        this.router.post(
            `${this.path}/upload`,
            isAuthorized(),
            async function (req: Request, res: Response) {
                const image = get(req.body, 'image', null);
                if (!image) return res.sendStatus(400);

                const formdata = new FormData();
                formdata.append('key', '6d207e02198a847aa98d0a2a901485a5');
                formdata.append('action', 'upload');
                formdata.append('source', image);
                formdata.append('format', 'json');

                const response = await fetch('https://freeimage.host/api/1/upload', {
                    method: 'POST',
                    body: formdata,
                });

                const data = await response.json();

                if (!response.ok) return res.sendStatus(response.status);

                if (data?.status_code === 200 && data?.success?.code === 200) {
                    return res.status(200).json({
                        status: true,
                        data: { uri: (data?.image?.url as string) ?? null },
                    });
                }

                return res.sendStatus(400);
            }
        );

        //# gets all nft under the collection
        this.router.get(`${this.path}/nfts`, async function (req: Request, res: Response) {
            try {
                const { user: whoami } = res.locals;

                const page = parseInt(get(req.query, 'page', '1') as string);
                const limit = parseInt(get(req.query, 'limit', '30') as string);
                if (isNaN(page) || isNaN(limit)) return res.sendStatus(400);

                const { nft_items } = await tonSdk.getUsernames(page, limit);

                const fns = nft_items.map(async (item) => {
                    const [user, isBookmarked] = await Promise.all([
                        userRepo.upsertUser(
                            item.owner.is_wallet
                                ? item.owner.address
                                : item.sale?.owner?.is_wallet
                                ? item.sale.owner.address
                                : null
                        ),
                        bookmarkRepo.isInBookmark(whoami?._id || null, item.address),
                    ]);

                    return { nft: item, user: user.data, isBookmarked };
                });

                const result = await Promise.all(fns);
                return res.status(200).json({ status: true, data: result });
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
                const { data } = await userRepo.upsertUser(result.owner?.address);

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

        this.router.put(
            `${this.path}/update/:address`,
            async function (req: Request, res: Response) {
                try {
                    const { address } = req.params;

                    const client = await Client();

                    const itemContract = client.open(NftItem.fromAddress(Address.parse(address)));
                    const { max_bid_address } = await itemContract.getGetAuctionInfo();

                    if (max_bid_address) {
                        const [{ data: user }, existing_owner] = await Promise.all([
                            userRepo.upsertUser(max_bid_address.toRawString()),
                            userRepo.selectOne(
                                {
                                    'pending_usernames.address': address,
                                },
                                {},
                                {
                                    lean: true,
                                }
                            ),
                        ]);

                        if (existing_owner) {
                            await userRepo.removePendingUsername(
                                existing_owner._id as string,
                                address
                            );
                        }

                        if (user)
                            await userRepo.addPendingUsername(user._id as string, [{ address }]);
                    }

                    return res.sendStatus(200);
                } catch (e: any) {
                    return res.sendStatus(500);
                }
            }
        );
    }
}
