import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClient } from '../../../../shared/http.client';

export default class OAuthClient extends HttpClient {
    constructor(options: AxiosRequestConfig) {
        super({
            baseURL: options.baseURL,
            headers: options.headers,
        });
    }

    _handleResponse({ data }: AxiosResponse<any>) {
        return { error: false, data };
    }

    _handleError(error: AxiosError<any>) {
        const { data } = error.response!;

        return { error: true, data };
    }

    getInstance() {
        return this.instance;
    }
}
