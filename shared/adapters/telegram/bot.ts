import TelegramBot from 'node-telegram-bot-api';
import env from '../../env';

const bot = env.IS_TESTNET ? undefined : new TelegramBot(env.TG_BOT_TOKEN!, { polling: true });
export default bot;
