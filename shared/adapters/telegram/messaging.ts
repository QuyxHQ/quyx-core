import bot from './bot';

export default class TelegramMessaging {
    constructor(private tg = bot) {}

    async sendWelcomMessage(chatId: number) {
        const text = `Yay! 🎉\n\nYou've successfully been able to link this telegram account to your Quyx account.\n\nWhat next?\nTry giving our mini app a try :-)`;

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Launch App',
                            web_app: { url: 'https://tma.quyx.xyz' },
                        },
                    ],
                ],
            },
        };

        return await this.tg?.sendMessage(chatId, text, opts);
    }

    async sendPermittedSpaceMessage(chatId: number, hash: string, space: Space) {
        const text = `❗️❗️ Heads up! You just gave a space access to your credential, more details on this can be found below\n\nSpace: ${space.name}\nURL: ${space.url}\nIdentifier: ${space.did}`;

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Manage Credential',
                            web_app: { url: `https://tma.quyx.xyz/credential/${hash}` },
                        },
                    ],
                ],
            },
        };

        await this.tg?.sendMessage(chatId, text, opts);
    }

    async sendRevokedSpaceMessage(chatId: number, hash: string, space: Space) {
        const text = `❗️❗️ Heads up! You just revoked a space access to your credential, more details on this can be found below\n\nSpace: ${space.name}\nURL: ${space.url}\nIdentifier: ${space.did}`;

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Manage Credential',
                            web_app: { url: `https://tma.quyx.xyz/credential/${hash}` },
                        },
                    ],
                ],
            },
        };

        await this.tg?.sendMessage(chatId, text, opts);
    }

    async sendRevokedCredentialMessage(chatId: number, hash: string) {
        const text = `❗️❗️ Heads up! You just revoked a credential\n\nCheck to dashboard to view affected credential`;

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Go to Dashboard',
                            web_app: { url: `https://tma.quyx.xyz?hash=${hash}` },
                        },
                    ],
                ],
            },
        };

        await this.tg?.sendMessage(chatId, text, opts);
    }
}
