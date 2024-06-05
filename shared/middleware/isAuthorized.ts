import { Request, Response, NextFunction } from 'express';

export default function (_: Request, res: Response, next: NextFunction) {
    if (!res.locals.user || !res.locals.session) return res.sendStatus(401);
    return next();
}
