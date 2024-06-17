import mongoose from 'mongoose';
import BaseRepo from '../../shared/base.repo';
import { Logger } from '../../shared/logger';
import devModel, { devDoc } from './dev.model';

export default class DevRepo extends BaseRepo<Dev, devDoc> {
    constructor() {
        super(devModel);
    }

    async upsertDev(input: Dev) {
        try {
            const dev = await this.findDev(input.email);
            if (dev) return { status: true, data: dev };

            const result = await this.insert(input);
            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    // param = _id | email
    async findDev(param: string) {
        const filter: Record<string, string | string>[] = [{ email: param }];
        if (mongoose.isValidObjectId(param)) filter.push({ _id: param });

        return await this.selectOne({ $or: filter }, {}, { lean: true });
    }
}
