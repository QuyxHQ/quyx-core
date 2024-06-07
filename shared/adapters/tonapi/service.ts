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

    async getUserUsernames(address: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const collection = '';

        const { error, data } = await this.client.get(
            `/accounts/${address}/nfts?collection=${collection}&limit=${limit}&offset=${offset}&indirect_ownership=false`
        );

        if (error || 'error' in data) {
            throw new Error(data.error || 'Unable to complete request');
        }

        return data as { nft_items: NftItem[] };
    }

    async getUsernames(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const collection = '';

        const { error, data } = await this.client.get(
            `/nfts/collections/${collection}/items?limit=${limit}&offset=${offset}`
        );

        if (error || 'error' in data) {
            throw new Error(data.error || 'Unable to complete request');
        }

        return data as { nft_items: NftItem[] };
    }

    async getUsername(nft_address: string) {
        const { error, data } = await this.client.get(`/nfts/${nft_address}`);

        if (error || 'error' in data) {
            throw new Error(data.error || 'Unable to complete request');
        }

        return data as NftItem;
    }

    async getBulkNfts(account_ids: string[]) {
        const { error, data } = await this.client.post('/nfts/_bulk', { account_ids });

        if (error || 'error' in data) {
            throw new Error(data.error || 'Unable to complete request');
        }

        return data as { nft_items: NftItem[] };
    }
}

export const tonSdk = new TonApiService(new TonApiHttpClient());
