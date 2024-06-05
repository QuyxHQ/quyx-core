import { AxiosResponse, AxiosError } from 'axios';
import { HttpClient } from '../../http.client';
import env from '../../env';

export default class TonApiHttpClient extends HttpClient {
    constructor() {
        super({
            baseURL: env.TON_API,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                ...(env.TON_API_TOKEN ? { Authorization: `Bearer ${env.TON_API_TOKEN}` } : {}),
            },
        });
    }

    _handleResponse({ data, status: statusCode }: AxiosResponse<any>) {
        return {
            error: false,
            data,
            statusCode,
        };
    }

    _handleError(error: AxiosError<any>) {
        const { data, status } = error.response!;

        return {
            error: true,
            data,
            statusCode: status,
        };
    }

    getInstance() {
        return this.instance;
    }
}
