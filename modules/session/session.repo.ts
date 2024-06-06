import { get } from 'lodash';
import BaseRepo from '../../shared/base.repo';
import { signJWT, verifyJWT } from '../../shared/global';
import { Logger } from '../../shared/logger';
import sessionModel, { sessionDoc } from './session.model';
import env from '../../shared/env';

export default class SessionRepo extends BaseRepo<Session, sessionDoc> {
    constructor() {
        super(sessionModel);
    }

    async createSession(input: Omit<Session, 'isActive'>) {
        try {
            const result = await this.insert({ ...input, isActive: true });
            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async deleteSession(user: string, session: string) {
        try {
            const result = await this.update({ _id: session, user }, { isActive: false });
            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async deleteAllSessions(user: string) {
        try {
            const result = await this.updateMany({ user }, { isActive: false });
            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async getSessions(user: string) {
        return this.select(
            { user },
            {},
            {
                lean: true,
            }
        );
    }

    async getSession(user: string, session: string) {
        return this.selectOne(
            {
                _id: session,
                user,
            },
            {},
            { lean: true }
        );
    }

    async reissueAccessToken(token: string) {
        const { decoded } = verifyJWT(token);

        if (!decoded || !get(decoded.data, 'session') || !get(decoded.data, 'user')) {
            return false;
        }

        const { user, session } = decoded.data;

        const _session = await this.getSession(user._id, session._id);
        if (!_session) return false;

        if (user._id !== session.user) return false;

        const accessToken = signJWT(
            {
                data: {
                    user,
                    session,
                },
            },
            {
                expiresIn: env.ACCESS_TOKEN_TTL,
            }
        );

        return accessToken;
    }
}
