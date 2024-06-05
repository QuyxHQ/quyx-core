import { TonProofItemReplySuccess, Wallet } from '@tonconnect/sdk';
import { AuthDataValidator } from '@telegram-auth/server';
import { urlStrToAuthDataMap } from '@telegram-auth/server/utils';
import {
    convertTonProofMessage,
    createMessage,
    generatePayloadToken,
    signatureVerify,
    verifyPayloadToken,
} from '../../shared/global';
import { tonSdk } from '../../shared/adapters/tonapi/service';
import { Logger } from '../../shared/logger';
import env from '../../shared/env';
import BaseRepo from '../../shared/base.repo';
import authModel, { authDoc } from './auth.model';

export default class AuthRepo extends BaseRepo<Auth, authDoc> {
    constructor() {
        super(authModel);
    }

    async authenticationWithTG(str: string) {
        try {
            if (!env.TG_BOT_TOKEN) throw new Error('TG_BOT_TOKEN not set');

            const validator = new AuthDataValidator({ botToken: env.TG_BOT_TOKEN });
            const data = urlStrToAuthDataMap(`https://validate.quyx.xyz?${str}`);

            const user = await validator.validate(data);
            if (user.id) {
                if (user.is_bot) {
                    return {
                        status: false,
                        error: 'Error: Cannot connect a bot account',
                    };
                }

                if (!user.username) {
                    return {
                        status: false,
                        error: 'Error: Setup your username on telegram first',
                    };
                }

                if (user.first_name) return { status: true, data: user };
            }

            return { status: false, error: 'Error: Action could not be completed' };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async generateToken() {
        try {
            const token = await generatePayloadToken();

            return {
                status: true,
                data: {
                    token,
                },
            };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async tonProof(walletInfo?: Wallet) {
        if (!walletInfo) return { status: false, error: 'Error: Bad request' };

        try {
            if (!walletInfo?.connectItems?.tonProof) {
                return { status: false, error: 'Error: Bad request' };
            }

            const proof = walletInfo.connectItems.tonProof as TonProofItemReplySuccess;
            if (!proof) return { status: false, error: 'Error: Bad request' };

            const { status, error } = await verifyPayloadToken(proof.proof.payload);
            if (!status) return { status, error };

            let public_key, address;

            if (env.IS_TESTNET && walletInfo.account.publicKey) {
                public_key = walletInfo.account.publicKey;
                address = walletInfo.account.address;
            } else {
                const result = await tonSdk.getAccountInfoByStateInit(
                    walletInfo.account.walletStateInit
                );

                public_key = result.public_key;
                address = result.address;
            }

            const pubKey = Buffer.from(public_key, 'hex');

            const parsedMessage = convertTonProofMessage(walletInfo, proof);
            const checkMessage = await createMessage(parsedMessage);

            const verifyRes = signatureVerify(pubKey, checkMessage, parsedMessage.Signature);
            if (!verifyRes) return { status: false, error: 'Error: Bad request' };

            return {
                status: true,
                data: {
                    address,
                },
            };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }
}
