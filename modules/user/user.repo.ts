import BaseRepo from '../../shared/base.repo';
import userModel, { userDoc } from './user.model';
import { Logger } from '../../shared/logger';
import mongoose from 'mongoose';
import { generateUsername } from 'unique-username-generator';
import FileBase from '../../shared/adapters/filebase';
import IdentityManagement from '../../shared/adapters/identity';

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

    async upsertUser(address: string) {
        try {
            const user = await this.getUser(address);
            if (user) return { status: true, data: user };

            const [username, { did }] = await Promise.all([
                this.getUsername(),
                this.identity.createDID(),
            ]);

            const hash = await this.identity.hash(did);

            const [result] = await Promise.all([
                this.insert({
                    address,
                    hasBlueTick: false,
                    username,
                    did,
                }),
                this.storage.addFile(hash, []), // this will store the hash of all the user credentials
            ]);

            return { status: true, data: result };
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

    async updateUserInfo(user: string, input: Pick<User, 'username' | 'socials'>) {
        try {
            const result = await this.update(
                { _id: user },
                {
                    socials: input.socials,
                    username: input.username,
                }
            );

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    // param = _id | username | address
    async getUser(param: string) {
        const filter: Record<string, string | number>[] = [
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

        return await this.selectOne({ $or: filter }, {}, { lean: true });
    }

    async searchForUser(q: string, limit?: number, skip?: number) {
        return await this.select(
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
    }
}
