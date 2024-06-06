import qs from 'qs';
import env from '../../../shared/env';
import OAuthClient from './helpers/client';

class GithubSdk implements OAuth {
    constructor() {}

    authURL() {
        const { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URL } = env;

        if (!GITHUB_CLIENT_ID) throw new Error('GITHUB_CLIENT_ID not set');
        if (!GITHUB_REDIRECT_URL) throw new Error('GITHUB_REDIRECT_URL not set');

        const rootURL = `https://github.com/login/oauth/authorize`;

        const options = {
            client_id: GITHUB_CLIENT_ID,
            redirect_uri: GITHUB_REDIRECT_URL,
            scope: 'user:email',
        };

        const qs = new URLSearchParams(options);
        return `${rootURL}?${qs.toString()}`;
    }

    async getToken(code: string) {
        const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env;

        if (!GITHUB_CLIENT_ID) throw new Error('GITHUB_CLIENT_ID not set');
        if (!GITHUB_CLIENT_SECRET) throw new Error('GITHUB_CLIENT_SECRET not set');

        const client = new OAuthClient({ baseURL: 'https://github.com/login/oauth/access_token' });

        const endpoint = `?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`;
        const { error, data } = await client.getInstance().post(endpoint);

        if (error) throw new Error('Error: Unable to retrieve githb access code');

        const decoded = qs.parse(data);
        return decoded.access_token as string;
    }

    async getUser(token: string): Promise<GitHubUser> {
        const client = new OAuthClient({
            baseURL: 'https://api.github.com/user',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { data: user, error } = await client.getInstance().get('/');
        if (error) throw new Error('Error: Unable to retrieve user github info');

        if (!user.email) {
            const { error, data } = await client.getInstance().get('/emails');
            if (error) throw new Error('Error: Unable to complete onboarding with github');

            user.email = data.find((item: any) => {
                item.verified == true && item.primary == true;
            })?.email;
        }

        return user as GitHubUser;
    }
}

export const githubSdk = new GithubSdk();
