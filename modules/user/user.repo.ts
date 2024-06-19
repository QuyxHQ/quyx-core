import BaseRepo from '../../shared/base.repo';
import userModel, { userDoc } from './user.model';
import { Logger } from '../../shared/logger';
import mongoose from 'mongoose';
import { generateUsername } from 'unique-username-generator';
import FileBase from '../../shared/adapters/filebase';
import IdentityManagement from '../../shared/adapters/identity';
import { Address } from 'ton-core';
import { omit } from 'lodash';
import { tonSdk } from '../../shared/adapters/tonapi/service';
import env from '../../shared/env';

export default class UserRepo extends BaseRepo<User, userDoc> {
    constructor(private storage = new FileBase(), private identity = new IdentityManagement()) {
        super(userModel);
    }

    private async getUsername() {
        let username = generateUsername('', 3);
        let usernameExist = true;

        while (usernameExist) {
            const count = await this.countRows({ username });

            if (count > 0) username = generateUsername('', 3);
            else usernameExist = false;
        }

        username = username.replace('-', '_');
        return username;
    }

    async upsertUser(address: string | null) {
        if (!address) return { status: true, data: null };

        try {
            const rawAddr = Address.parse(address).toRawString();

            const user = await this.getUser(rawAddr);
            if (user) return { status: true, data: user };

            const [username, { did }] = await Promise.all([
                this.getUsername(),
                this.identity.createDID(),
            ]);

            const hash = await this.identity.hash(did);

            const [result] = await Promise.all([
                this.insert({
                    address: rawAddr,
                    hasBlueTick: false,
                    username,
                    did,
                    pending_usernames: [],
                }),
                env.IS_TESTNET ? () => {} : this.storage.addFile(hash, []), // this will store the hash of all the user credentials
            ]);
            return { status: true, data: omit(result, 'tg') };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async populateTGFields(user: string, data: User['tg']) {
        try {
            const tg_isRegistered = await this.countRows({
                $or: [
                    {
                        'tg.id': data?.id,
                        'tg.username': data?.username,
                    },
                ],
            });

            if (tg_isRegistered > 0) {
                return {
                    status: false,
                    error: 'Error: TG account already linked to an account',
                };
            }

            const result = await this.update({ _id: user }, { tg: data });
            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async unlinkTGAccount(user: string) {
        try {
            // maybe send a last message to them that they are unlinking it
            const result = await this.update(
                { _id: user },
                {
                    tg: {
                        id: null,
                        username: null,
                        firstName: null,
                        lastName: null,
                        languageCode: null,
                        photoUrl: null,
                    },
                }
            );

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async updateUserInfo(user: string, input: Pick<User, 'username' | 'bio' | 'pfp' | 'socials'>) {
        try {
            const result = await this.update(
                { _id: user },
                {
                    socials: input.socials,
                    username: input.username,
                    bio: input.bio,
                    pfp: input.pfp,
                }
            );

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    // param = _id | username | address
    async getUser(param: string, omit_tg = true) {
        const filter: Record<string, string>[] = [
            {
                username: param,
            },
            {
                address: param,
            },
        ];

        if (mongoose.isValidObjectId(param)) {
            filter.push({ _id: param });
        }

        const result = await this.selectOne({ $or: filter }, {}, { lean: true });
        if (result && omit_tg) return omit(result, 'tg');

        return result;
    }

    async searchForUser(q: string, limit?: number, skip?: number) {
        const result = await this.select(
            {
                username: {
                    $regex: q,
                    $options: 'i',
                },
            },
            {},
            {
                lean: true,
                skip,
                limit,
            }
        );

        return result.map((item) => omit(item, 'tg'));
    }

    async getPendingUsernames(username: string) {
        const dbuser = await this.selectOne(
            {
                username,
            },
            {
                pending_usernames: 1,
            },
            {
                lean: true,
            }
        );

        if (!dbuser) return null;

        const addresses = dbuser.pending_usernames.map((item) => item.address);

        const { nft_items: nfts } =
            addresses.length > 0 ? await tonSdk.getBulkNfts(addresses) : { nft_items: [] };

        const result = dbuser.pending_usernames.map(function (item) {
            const nft = nfts.find(function (nft) {
                return nft.address == Address.parse(item.address).toRawString();
            })!;

            return { ...item, nft };
        });

        return result;
    }

    async addPendingUsername(user: string, data: User['pending_usernames']) {
        const dbuser = await this.selectOne({ _id: user });
        if (!dbuser) return;

        dbuser.pending_usernames = [...dbuser.pending_usernames, ...data];
        await dbuser.save();

        return true;
    }

    async removePendingUsername(user: string, address: string) {
        const dbuser = await this.selectOne({ _id: user });
        if (!dbuser) return;

        dbuser.pending_usernames = dbuser.pending_usernames.filter(
            (item) => item.address != address
        );

        await dbuser.save();
        return true;
    }
}
