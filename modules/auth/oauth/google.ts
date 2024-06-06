import jwt from 'jsonwebtoken';
import env from '../../../shared/env';
import OAuthClient from './helpers/client';

class GoogleSdk implements OAuth {
    constructor() {}

    authURL() {
        const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URL } = env;
        if (!GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID not set');
        if (!GOOGLE_REDIRECT_URL) throw new Error('GOOGLE_REDIRECT_URL not set');

        const rootURL = `https://accounts.google.com/o/oauth2/auth`;

        const options = {
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: GOOGLE_REDIRECT_URL,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
        };

        const qs = new URLSearchParams(options);
        return `${rootURL}?${qs.toString()}`;
    }

    async getToken(code: string) {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } = env;

        if (!GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID not set');
        if (!GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_SECRET not set');
        if (!GOOGLE_REDIRECT_URL) throw new Error('GOOGLE_REDIRECT_URL not set');

        const values = {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URL,
            grant_type: 'authorization_code',
        };

        const client = new OAuthClient({ baseURL: 'https://oauth2.googleapis.com' });

        const { error, data } = await client
            .getInstance()
            .post('/token', new URLSearchParams(values));

        if (error) throw new Error('Error: Unable to retrieve githb access code');
        return data.id_token as string;
    }

    async getUser(token: string): Promise<GoogleUser> {
        return new Promise((resolve) => {
            const payload = jwt.decode(token) as GoogleUser;
            resolve(payload);
        });
    }
}

export const googleSdk = new GoogleSdk();
