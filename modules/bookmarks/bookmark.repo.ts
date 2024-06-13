import { Address } from 'ton-core';
import { tonSdk } from '../../shared/adapters/tonapi/service';
import BaseRepo from '../../shared/base.repo';
import bookmarkModel, { bookmarkDoc } from './bookmark.model';
import { Logger } from '../../shared/logger';

export default class BookmarkRepo extends BaseRepo<Bookmark, bookmarkDoc> {
    constructor() {
        super(bookmarkModel);
    }

    async getBookmarks(user: string, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;

            const bookmarks = await this.select(
                {
                    user,
                },
                {},
                {
                    lean: true,
                    skip,
                    limit,
                }
            );

            const addresses = bookmarks.map(function (bookmark) {
                return Address.parse(bookmark.address).toRawString();
            });

            const { nft_items: nfts } = await tonSdk.getBulkNfts(addresses);

            const result = bookmarks.map(function (bookmark) {
                const nft = nfts.find(function (nft) {
                    return nft.address == Address.parse(bookmark.address).toRawString();
                })!;

                return { ...bookmark, nft };
            });

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async addToBookmark(
        user: string,
        nft: string
    ): Promise<{
        status: boolean;
        data?: any;
        error?: string;
    }> {
        const isBookmarked = await this.isInBookmark(user, nft);
        if (isBookmarked) {
            return await this.removeFromBookmark(user, nft);
        }

        try {
            const result = await this.insert({
                user,
                address: Address.parse(nft).toRawString(),
            });

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async isInBookmark(user: string | null, nft: string) {
        if (user == null) return false;

        const count = await this.countRows({
            user,
            address: Address.parse(nft).toRawString(),
        });

        return count > 0;
    }

    async removeFromBookmark(
        user: string,
        nft: string
    ): Promise<{
        status: boolean;
        data?: any;
        error?: string;
    }> {
        const isBookmarked = await this.isInBookmark(user, nft);
        if (!isBookmarked) {
            return await this.addToBookmark(user, nft);
        }

        try {
            const result = await this.delete({
                user,
                address: Address.parse(nft).toRawString(),
            });

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async clearBookmarks(user: string) {
        try {
            const result = await this.deleteMany({
                user,
            });

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }
}
