import * as express from 'express';

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
