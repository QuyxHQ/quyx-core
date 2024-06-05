import crypto from 'crypto';
import mongoose from 'mongoose';
import http from 'http';
import WebSocket from 'ws';
import createServer from './api';
import env from './shared/env';
import { Logger } from './shared/logger';
import UserRepo from './modules/user/user.repo';
import axios from 'axios';
import { Address } from 'ton-core';

const userRepo = new UserRepo();

const waitForOpenConnection = (socket: WebSocket) => {
    return new Promise((resolve, reject) => {
        const maxNumberOfAttempts = 10;
        const intervalTime = 1000; // 1 second

        let currentAttempt = 0;

        const interval = setInterval(() => {
            Logger.yellow(`Establishing ws connection: [${currentAttempt}/${maxNumberOfAttempts}]`);

            if (currentAttempt > maxNumberOfAttempts - 1) {
                clearInterval(interval);
                reject(new Error('Could not establish a connection to web socket'));
            } else if (socket.readyState === socket.OPEN) {
                clearInterval(interval);
                resolve(undefined);
            }

            currentAttempt++;
        }, intervalTime);
    });
};

(async function () {
    try {
        const app = createServer();
        const httpServer = http.createServer(app);

        if (!env.MONGODB_URI) throw new Error('MONGODB_URI not set');
        const PORT = 3000;

        Logger.green('Connecting to MongoDB >>>>>>>>>>>>');

        await mongoose.connect(env.MONGODB_URI);
        Logger.green('Connected to MongoDB ✅');

        httpServer.listen(
            {
                port: PORT,
            },
            () => Logger.green(`Server is running on port ${PORT}`)
        );

        const subscribe = (ws: WebSocket, params: string[]) => {
            const message = {
                id: 1,
                jsonrpc: '2.0',
                method: 'subscribe_account',
                params,
            };

            Logger.yellow(JSON.stringify(message, null, 2));
            ws.send(JSON.stringify(message));
        };

        Logger.green('Connecting to TON Websocket >>>>>>>>>>>');

        const ws = new WebSocket(env.TON_API_WEBSOCKET);

        ws.on('open', () => {
            // if (env.) {
            //     const ca = Address.parse(settings.TON_FRENS_CONTRACT_ADDR).toRawString();
            //     params.push(`${ca};operations=0x256097df,0x3a5689e`);
            // }
            // if (params.length > 0) subscribe(ws, params);
        });

        ws.on('message', async (data) => {
            const body = JSON.parse(data.toString()) as TransactionStream;
            Logger.yellow(JSON.stringify(body, null, 2));

            if (body.method == 'subscribe_account') return;

            const signature = crypto
                .createHmac('sha256', env.STREAM_KEY)
                .update(JSON.stringify(body))
                .digest('hex');

            await axios.post('/misc/stream', data, {
                headers: {
                    'x-inbound-signature': signature,
                },
            });
        });

        if (ws.readyState !== ws.OPEN) await waitForOpenConnection(ws);
        Logger.green('Connected to TON Websocket ✅');
    } catch (e: any) {
        Logger.red(e);
    }
})();
