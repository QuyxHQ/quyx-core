import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import createServer from './api';
import env from './shared/env';
import { Logger } from './shared/logger';
import { Address, toNano } from 'ton-core';
import agenda from './shared/agenda';
import Client from './shared/Client';
import { NftItem } from './contracts/tact_NftItem';
import UserRepo from './modules/user/user.repo';
import { sleep } from './shared/global';
import wallet from './shared/wallet';
import { AuctionContract } from './contracts/tact_AuctionContract';
import { connectWithRetry } from './shared/ws';
import bot from './shared/adapters/telegram/bot';

const userRepo = new UserRepo();

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

        // auction for username
        agenda.define('auction', async (job: any) => {
            const { user, username, address } = job.attrs.data;

            try {
                const itemContract = client.open(NftItem.fromAddress(Address.parse(address)));
                const data = await itemContract.getGetAuctionInfo();
                const { max_bid_address, auction_end_time } = data;

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

                        if (user) await userRepo.removePendingUsername(user, address);
                    }
                }

                await job.remove();
            } catch (e: any) {
                Logger.red(`Error throw when ending auction: ${e.message}`);
            }
        });

        // auction in marketplace
        agenda.define('mp-auction', async (job: any) => {
            const { address } = job.attrs.data;

            try {
                const auction = client.open(AuctionContract.fromAddress(Address.parse(address)));
                const { end_time: auction_end_time } = await auction.getGetAuctionData();

                const now = Date.now();
                const end_time = Number(auction_end_time.toString()) * 1000;
                if (end_time > now) {
                    // auction end time has been extended
                    // schedule a new job
                    await agenda.schedule(new Date(end_time), 'mp-auction', { address });
                } else {
                    // end the auction here
                    await auction.sendExternal('end');
                }

                await job.remove();
            } catch (e: any) {
                Logger.red(`Error throw when ending mp auction: ${e.message}`);
            }
        });

        await agenda.start();

        if (bot) {
            bot.onText(/\/start/, (msg) => {
                const chatId = msg.chat.id;

                const name = msg.from
                    ? msg.from.username
                        ? msg.from.username
                        : msg.from.first_name
                    : 'User';

                const message = `Hi 👋, @${name}.\n\n🎉 Welcome to Quyx, TON's first social identity protocol.\n\nLFG!! 🔥`;

                const opts = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Launch App',
                                    web_app: { url: 'https://tma.quyx.xyz' },
                                },
                                {
                                    text: 'My Profile',
                                    web_app: { url: 'https://tma.quyx.xyz/profile' },
                                },
                            ],
                        ],
                    },
                };

                if (bot) bot.sendMessage(chatId, message, opts as any);
            });
        }

        httpServer.listen(
            {
                port: PORT,
            },
            () => Logger.green(`Server is running on port ${PORT}`)
        );

        Logger.green('Connecting to TON Websocket >>>>>>>>>>>');

        await connectWithRetry(env.TON_WEBSOCKET_URL, client, io);
    } catch (e: any) {
        Logger.red(`Error in main process: ${e.message}`);
    }
})();
