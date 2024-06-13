import { AxiosResponse, AxiosError } from 'axios';
import { HttpClient } from '../../http.client';
import env from '../../env';
import { Logger } from '../../logger';

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
        const response = {
            error: false,
            data,
            statusCode,
        };

        return response;
    }

    _handleError(error: AxiosError<any>) {
        const { data, status } = error.response!;

        const response = {
            error: true,
            data,
            statusCode: status,
        };

        Logger.yellow(JSON.stringify(response, null, 4));
        return response;
    }

    getInstance() {
        return this.instance;
    }
}
