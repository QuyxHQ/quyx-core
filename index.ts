import mongoose from 'mongoose';
import WebSocket from 'ws';
import http from 'http';
import { Server } from 'socket.io';
import createServer from './api';
import env from './shared/env';
import { Logger } from './shared/logger';
import { Address, Cell, toNano } from 'ton-core';
import { tonSdk } from './shared/adapters/tonapi/service';
import agenda from './shared/agenda';
import Client from './shared/Client';
import { NftCollection } from './contracts/tact_NftCollection';
import { NftItem } from './contracts/tact_NftItem';
import UserRepo from './modules/user/user.repo';
import { sleep } from './shared/global';
import wallet from './shared/wallet';

const userRepo = new UserRepo();

const waitForOpenSocketConnection = (socket: WebSocket) => {
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
        const PORT = 3000;

        const io = new Server(httpServer, {
            cors: {
                origin: env.CLIENT_BASE_URL,
            },
        });

        io.on('connection', function (socket) {
            Logger.yellow(`New socket connection: ${socket.id}`);
        });

        if (!env.MONGODB_URI) throw new Error('MONGODB_URI not set');
        Logger.green('Connecting to MongoDB >>>>>>>>>>>>');

        await mongoose.connect(env.MONGODB_URI);
        Logger.green('Connected to MongoDB ✅');

        const client = await Client();

        //@ts-ignore
        agenda.define('auction', async (job: any) => {
            const { username, address } = job.attrs.data;

            try {
                const itemContract = client.open(NftItem.fromAddress(Address.parse(address)));
                const { max_bid_address, auction_end_time } =
                    await itemContract.getGetAuctionInfo();

                if (max_bid_address != null) {
                    // auction has not ended
                    const now = Date.now();
                    const end_time = Number(auction_end_time.toString()) * 1000;

                    if (end_time > now) {
                        // auction end time has been extended
                        // schedule a new job
                        await agenda.schedule(new Date(end_time), 'auction', {
                            username,
                            address,
                        });
                    } else {
                        // end the auction here
                        const { contract, secretKey } = await wallet();

                        const seqno = await contract.getSeqno();

                        await itemContract.send(
                            contract.sender(secretKey),
                            {
                                value: toNano(0.02),
                            },
                            {
                                $$type: 'CompleteAuction',
                                query_id: BigInt(Date.now()),
                            }
                        );

                        let currentSeqno = seqno;

                        while (currentSeqno == seqno) {
                            await sleep(1.5);
                            currentSeqno = await contract.getSeqno();
                        }
                    }
                }

                await job.remove();
            } catch (e: any) {
                Logger.red(`Error throw when ending auction: ${e.message}`);
            }
        });

        await agenda.start();

        httpServer.listen(
            {
                port: PORT,
            },
            () => Logger.green(`Server is running on port ${PORT}`)
        );

        Logger.green('Connecting to TON Websocket >>>>>>>>>>>');

        const ws = new WebSocket(env.TON_WEBSOCKET_URL);

        ws.on('open', () => {
            const addr = Address.parse(env.COLLECTION_ADDR).toRawString();
            const message = {
                id: 1,
                jsonrpc: '2.0',
                method: 'subscribe_account',
                params: [`${addr};operations=0x57e52197,0x370fec51`],
            };

            Logger.yellow(JSON.stringify(message, null, 2));
            ws.send(JSON.stringify(message));
        });

        ws.on('message', async (data) => {
            const message = JSON.parse(data.toString()) as TransactionStream;
            Logger.yellow(JSON.stringify(message, null, 2));

            if (message.method !== 'account_transaction') return;
            const { tx_hash } = message.params;

            try {
                const tx = await tonSdk.getTransactionData(tx_hash);
                if (!tx.success || !tx.in_msg) return;

                const { op_code, raw_body, source } = tx.in_msg;
                if (!raw_body) return;

                const cell = Cell.fromBoc(Buffer.from(raw_body, 'hex'));
                const cs = cell[0].beginParse();

                cs.loadUint(32); // opcode
                cs.loadUint(64); // query_id

                if (op_code == '0x57e52197') {
                    // claim username
                    const username = cs.loadStringRefTail();

                    const addr = Address.parse(env.COLLECTION_ADDR);
                    const collectionContract = client.open(NftCollection.fromAddress(addr));

                    const index = await collectionContract.getGetIndex(username);
                    const nft_addr = await collectionContract.getGetNftAddressByIndex(index);
                    const itemContract = client.open(NftItem.fromAddress(nft_addr));
                    let auctionInfo;

                    while (!auctionInfo) {
                        try {
                            auctionInfo = await itemContract.getGetAuctionInfo();
                        } catch (e: any) {
                            Logger.red(`Fetching nft auction info failed.....${e.message}`);
                        }

                        await sleep(2);
                    }

                    const runAt = Number(auctionInfo.auction_end_time.toString()) * 100;

                    await agenda.schedule(new Date(runAt), 'auction', {
                        username,
                        index: index.toString(),
                        address: nft_addr.toRawString(),
                    });

                    const user = await userRepo.upsertUser(source?.address!);

                    io.sockets.emit('message', {
                        type: 'started_auction',
                        username,
                        address: nft_addr.toString(),
                        user: user.data,
                        timestamp: Date.now(),
                    });
                }

                if (op_code == '0x370fec51') {
                    // fill up
                    const addr = Address.parse(source?.address!);
                    const itemContract = client.open(NftItem.fromAddress(addr));
                    const [username, { owner }] = await Promise.all([
                        itemContract.getGetDomain(),
                        itemContract.getGetNftData(),
                    ]);

                    const user = await userRepo.upsertUser(owner.toRawString());

                    io.sockets.emit('message', {
                        type: 'username_assigned',
                        username,
                        address: source?.address,
                        user: user.data,
                        timestamp: Date.now(),
                    });
                }
            } catch (e: any) {
                Logger.red(e.message);
            }
        });

        if (ws.readyState !== ws.OPEN) await waitForOpenSocketConnection(ws);
        Logger.green('Connected to TON Websocket ✅');
    } catch (e: any) {
        Logger.red(e);
    }
})();
