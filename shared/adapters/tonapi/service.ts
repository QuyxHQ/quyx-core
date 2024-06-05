import { AxiosInstance } from 'axios';
import TonApiHttpClient from './client';

class TonApiService {
    private client: AxiosInstance;

    constructor(client: TonApiHttpClient) {
        this.client = client.getInstance();
    }

    async getAccountInfoByStateInit(state_init: string) {
        const { error, data } = await this.client.post('/tonconnect/stateinit', { state_init });
        if (error || 'error' in data) {
            throw new Error(data.error || 'Unable to complete request');
        }

        return data as { public_key: string; address: string };
    }

    async getTransactionData(transaction_id: string) {
        const { error, data } = await this.client.get(`/blockchain/transactions/${transaction_id}`);
        if (error || 'error' in data) {
            throw new Error(data.error || 'Unable to complete request');
        }

        return data as TxData;
    }
}

export const tonSdk = new TonApiService(new TonApiHttpClient());
