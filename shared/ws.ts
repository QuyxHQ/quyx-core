import { TonClient } from 'ton';
import { Address, Cell } from 'ton-core';
import WebSocket from 'ws';
import { AuctionContract } from '../contracts/tact_AuctionContract';
import { NftCollection } from '../contracts/tact_NftCollection';
import { NftItem } from '../contracts/tact_NftItem';
import UserRepo from '../modules/user/user.repo';
import { tonSdk } from './adapters/tonapi/service';
import agenda from './agenda';
import env from './env';
import { sleep } from './global';
import { Logger } from './logger';

const userRepo = new UserRepo();

export const waitForOpenSocketConnection = (socket: WebSocket) => {
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

async function connectToWebSocket(url: string, client: TonClient, io: any) {
    return new Promise(async (_, reject) => {
        const ws = new WebSocket(url);

        ws.on('open', () => {
            Logger.green('Connected to TON Websocket ✅');

            const collection_addr = Address.parse(env.COLLECTION_ADDR).toRawString();
            const mp_addr = Address.parse(env.MARKETPLACE_ADDR).toRawString();

            const message = {
                id: 1,
                jsonrpc: '2.0',
                method: 'subscribe_account',
                params: [
                    `${collection_addr};operations=0x57e52197,0x370fec51`,
                    `${mp_addr};operations=0x05138d91`,
                ],
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

                if (
                    message.params.account_id == Address.parse(env.MARKETPLACE_ADDR).toRawString()
                ) {
                    if (!tx.out_msgs || tx.out_msgs.length == 0) return;

                    const log = tx.out_msgs.find((msg) => msg.op_code == '0x71e6098a');
                    if (!log) return;

                    const { raw_body: log_raw_body } = log;
                    if (!log_raw_body) return;

                    const log_cell = Cell.fromBoc(Buffer.from(log_raw_body, 'hex'));
                    const log_cs = log_cell[0].beginParse();

                    log_cs.loadUint(32); // opcode
                    log_cs.loadUint(64); // query_id

                    const action = log_cs.loadUint(8);
                    const sale_address = log_cs.loadAddress();

                    const user = await userRepo.upsertUser(cs.loadAddress().toRawString());

                    if (action == 1) {
                        // auction
                        const contract = client.open(AuctionContract.fromAddress(sale_address));
                        let auction;

                        while (!auction) {
                            try {
                                auction = await contract.getGetAuctionData();
                            } catch (e: any) {
                                Logger.red(`Fetching mp nft auction info failed.....${e.message}`);
                            }

                            await sleep(2);
                        }

                        const runAt = Number(auction.end_time.toString()) * 1000;

                        // set a cron job to stop it at the end time
                        await agenda.schedule(new Date(runAt), 'mp-auction', {
                            address: sale_address.toRawString(),
                        });

                        // emit an event that an auction was just placed
                        io.sockets.emit('message', {
                            type: 'auction',
                            address: sale_address.toRawString(),
                            nft: source?.address,
                            user: user.data,
                            timestamp: Date.now(),
                        });
                    }

                    if (action == 2) {
                        // fixed sale
                        // emit an event that a fixed sale was just created or somn
                        io.sockets.emit('message', {
                            type: 'fixed_sale',
                            address: sale_address.toRawString(),
                            nft: source?.address,
                            user: user.data,
                            timestamp: Date.now(),
                        });
                    }

                    return;
                }

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

                    const user = await userRepo.upsertUser(source?.address!);

                    const runAt = Number(auctionInfo.auction_end_time.toString()) * 1000;
                    await agenda.schedule(new Date(runAt), 'auction', {
                        username,
                        index: index.toString(),
                        address: nft_addr.toRawString(),
                        user: user.data?._id,
                    });

                    if (user.data) {
                        await userRepo.addPendingUsername(user.data._id as string, [
                            {
                                address: nft_addr.toRawString(),
                            },
                        ]);
                    }

                    io.sockets.emit('message', {
                        type: 'started_auction',
                        username,
                        address: nft_addr.toRawString(),
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

        ws.on('error', (error) => {
            Logger.red(`WebSocket error: ${error.message}`);
            reject(error);
        });

        ws.on('close', (code, reason) => {
            Logger.red(`WebSocket closed: ${code} - ${reason || 'nil'}`);

            if (code === 401) {
                Logger.red('WebSocket connection closed with 401 Unauthorized. Retrying...');
                reject(new Error('401 Unauthorized'));
            }
        });
    });
}

export async function connectWithRetry(
    url: string,
    client: TonClient,
    io: any,
    maxRetries = 5,
    delay = 4000
) {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            await connectToWebSocket(url, client, io);
        } catch (error) {
            attempts++;

            if (attempts >= maxRetries) {
                Logger.red('Max retries reached. Could not connect to WebSocket');
                throw error;
            }

            Logger.yellow(
                `Retrying WebSocket connection in ${delay}ms... (Attempt ${attempts}/${maxRetries})`
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}
