import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from 'ton';
import env from './env';

export default async function () {
    return new TonClient({
        endpoint: await getHttpEndpoint({
            network: env.IS_TESTNET ? 'testnet' : 'mainnet',
        }),
    });
}
