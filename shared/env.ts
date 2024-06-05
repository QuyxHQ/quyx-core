import { Network } from '@orbs-network/ton-access';
import dotenv from 'dotenv';
dotenv.config();

let {
    NETWORK,
    ENCRYPTION_PRIVATE_KEY,
    ENCRYPTION_PUBLIC_KEY,
    TON_API,
    TON_API_TOKEN,
    TON_API_WEBSOCKET,
    MONGODB_URI,
    SENTRY_DSN,
    JWT_SECRET,
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL,
    TG_BOT_TOKEN,
    STREAM_KEY,
} = process.env;

NETWORK = NETWORK == 'mainnet' ? NETWORK : 'testnet';
TON_API = TON_API || 'https://testnet.tonapi.io/v2'; // defaults to testnet
TON_API_WEBSOCKET = TON_API_WEBSOCKET || 'wss://testnet.tonapi.io/v2/websocket'; // defaults to testnet
MONGODB_URI = MONGODB_URI || 'mongodb://localhost:27017/quyx';
JWT_SECRET = JWT_SECRET || 'super_secret_stuff_hahaha';
ACCESS_TOKEN_TTL = ACCESS_TOKEN_TTL || '5m';
REFRESH_TOKEN_TTL = REFRESH_TOKEN_TTL || '1y';
STREAM_KEY = STREAM_KEY || 'you_cant_guess_this';

const IS_TESTNET = NETWORK === 'mainnet' ? false : true;

export default {
    NETWORK: NETWORK as Network,
    ENCRYPTION_PRIVATE_KEY,
    ENCRYPTION_PUBLIC_KEY,
    TON_API,
    TON_API_TOKEN,
    TON_API_WEBSOCKET,
    IS_TESTNET,
    MONGODB_URI,
    SENTRY_DSN,
    JWT_SECRET,
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL,
    TG_BOT_TOKEN,
    STREAM_KEY,
};
