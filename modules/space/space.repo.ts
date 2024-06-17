import mongoose from 'mongoose';
import BaseRepo from '../../shared/base.repo';
import { Logger } from '../../shared/logger';
import spaceModel, { spaceDoc } from './space.model';
import FileBase from '../../shared/adapters/filebase';
import IdentityManagement from '../../shared/adapters/identity';
import { randomStr } from '../../shared/global';

const nanoid = (length: number) => randomStr(length);
const MAX_NUMBER_OF_SPACE = 3;

export default class SpaceRepo extends BaseRepo<Space, spaceDoc> {
    constructor(private storage = new FileBase(), private identity = new IdentityManagement()) {
        super(spaceModel);
    }

    private async generateKeys() {
        const generate = (prefix: 'sk' | 'pk') => {
            return `${prefix}_${nanoid(25)}`;
        };

        let pk = generate('pk');
        let sk = generate('sk');
        let exist = true;

        while (exist) {
            const count = await this.countRows({
                $or: [
                    {
                        'keys.pk': pk,
                    },
                    {
                        'keys.sk': sk,
                    },
                ],
            });

            if (count == 0) exist = false;
            else {
                pk = generate('pk');
                sk = generate('sk');
            }
        }

        return { pk, sk };
    }

    async newSpace(input: Pick<Space, 'owner' | 'name' | 'url'>) {
        try {
            const total_spaces = await this.countRows({ owner: input.owner, isActive: true });
            if (total_spaces >= MAX_NUMBER_OF_SPACE) {
                return {
                    status: false,
                    error: 'Error: Max space limit reached',
                };
            }

            const { did } = await this.identity.createDID();
            const keys = await this.generateKeys();

            const hash = await this.identity.hash(did);

            const [result] = await Promise.all([
                this.insert({
                    ...input,
                    isActive: true,
                    did,
                    keys,
                }),
                this.storage.addFile(hash, {
                    maps: {},
                    hashes: [],
                }),
            ]);

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async updateSpace(owner: string, did: string, input: Partial<Space>) {
        try {
            const result = await this.update(
                {
                    did,
                    owner,
                    isActive: true,
                },
                input
            );

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async rotateKeys(owner: string, space: string) {
        try {
            const keys = await this.generateKeys();

            const result = await this.update(
                {
                    owner,
                    did: space,
                    isActive: true,
                },
                { keys }
            );

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async getMySpaces(owner: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        return await this.select(
            {
                owner,
                isActive: true,
            },
            {},
            {
                lean: true,
                skip,
                limit,
            }
        );
    }

    // param = _id | did
    async getSpace(param: string) {
        const filter: Record<string, string | string>[] = [{ did: param }];
        if (mongoose.isValidObjectId(param)) filter.push({ _id: param });

        return await this.selectOne(
            {
                $or: filter,
                isActive: true,
            },
            {},
            {
                lean: true,
            }
        );
    }

    async searchSpace(owner: string, q: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        return await this.select(
            {
                owner,
                name: {
                    $regex: q,
                    $options: 'i',
                },
                isActive: true,
            },
            {},
            {
                lean: true,
                skip,
                limit,
            }
        );
    }

    async deleteSpace(owner: string, space: string) {
        try {
            const result = await this.update(
                {
                    owner,
                    did: space,
                },
                {
                    isActive: false,
                }
            );

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: 500, error: e.message };
        }
    }
}
