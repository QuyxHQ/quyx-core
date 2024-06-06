import * as express from 'express';
import * as expressSession from 'express-session';

declare module 'express-session' {
    interface SessionData {
        dev?: Base & Dev;
    }
}

declare module 'express' {
    interface Response {
        locals: {
            user?: Base & User;
            session?: Base & Session;
            dev?: Base & Dev;
            space?: Space;
        };
    }
}

export = express;
