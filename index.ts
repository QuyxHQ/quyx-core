import mongoose from 'mongoose';
import http from 'http';
import createServer from './api';
import env from './shared/env';
import { Logger } from './shared/logger';

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
    } catch (e: any) {
        Logger.red(e);
    }
})();
