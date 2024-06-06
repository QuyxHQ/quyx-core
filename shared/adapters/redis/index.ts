import { Redis } from '@upstash/redis';
import env from '../../env';

const { REDIS_URL, REDIS_TOKEN } = env;

if (!REDIS_URL) throw new Error('REDIS_URL not set');
if (!REDIS_TOKEN) throw new Error('REDIS_TOKEN not set');

const redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });

export default redis;
