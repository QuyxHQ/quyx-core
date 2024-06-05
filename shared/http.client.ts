import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
    interface AxiosResponse<T = any> extends Promise<T> {}
}

export abstract class HttpClient {
    protected readonly instance: AxiosInstance;
    protected readonly instanceWithoutAuth: AxiosInstance;

    constructor(option: AxiosRequestConfig) {
        this.instance = axios.create(option);
        this.instanceWithoutAuth = axios.create({ baseURL: option.baseURL });
        this._initializeResponseInterceptor();
    }

    private _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(this._handleResponse, this._handleError);
        this.instanceWithoutAuth.interceptors.response.use(this._handleResponse, this._handleError);
    };

    abstract _handleResponse({ data }: AxiosResponse): any;
    abstract _handleError(error: AxiosError): any;
}
