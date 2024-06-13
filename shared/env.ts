import { Network } from '@orbs-network/ton-access';
import dotenv from 'dotenv';
dotenv.config();

let {
    NETWORK,
    ENCRYPTION_PRIVATE_KEY,
    ENCRYPTION_PUBLIC_KEY,
    TON_API,
    TON_API_TOKEN,
    MONGODB_URI,
    SENTRY_DSN,
    JWT_SECRET,
    SESSION_SECRET,
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL,
    TG_BOT_TOKEN,
    FILEBASE_ACCESS_KEY,
    FILEBASE_SECRET_KEY,
    REDIS_URL,
    REDIS_TOKEN,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URL,
    DEV_BASE_URL,
    CLIENT_BASE_URL,
    COLLECTION_ADDR,
    TON_WEBSOCKET_URL,
    MNEMONIC,
} = process.env;

NETWORK = NETWORK == 'mainnet' ? NETWORK : 'testnet';
TON_API = TON_API || 'https://testnet.tonapi.io/v2'; // defaults to testnet
MONGODB_URI = MONGODB_URI || 'mongodb://localhost:27017/quyx';
JWT_SECRET = JWT_SECRET || 'super_secret_stuff_hahaha';
SESSION_SECRET = SESSION_SECRET || 'super_secret_stuff_hahaha';
ACCESS_TOKEN_TTL = ACCESS_TOKEN_TTL || '5m';
REFRESH_TOKEN_TTL = REFRESH_TOKEN_TTL || '1y';
DEV_BASE_URL = DEV_BASE_URL || 'http://localhost:5174';
CLIENT_BASE_URL = CLIENT_BASE_URL || 'http://localhost:5173';
COLLECTION_ADDR = COLLECTION_ADDR || 'EQBGYC-l0cA_Y-8JjxsLEWdJ1RrBdwzZVcbbkzTEE4pJWcpV';
TON_WEBSOCKET_URL = TON_WEBSOCKET_URL || 'wss://testnet.tonapi.io/v2/websocket';
const IS_TESTNET = NETWORK === 'mainnet' ? false : true;

export default {
    NETWORK: NETWORK as Network,
    ENCRYPTION_PRIVATE_KEY,
    ENCRYPTION_PUBLIC_KEY,
    TON_API,
    TON_API_TOKEN,
    IS_TESTNET,
    MONGODB_URI,
    SENTRY_DSN,
    JWT_SECRET,
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL,
    TG_BOT_TOKEN,
    FILEBASE_ACCESS_KEY,
    FILEBASE_SECRET_KEY,
    REDIS_URL,
    REDIS_TOKEN,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URL,
    SESSION_SECRET,
    DEV_BASE_URL,
    CLIENT_BASE_URL,
    COLLECTION_ADDR,
    TON_WEBSOCKET_URL,
    MNEMONIC,
};
