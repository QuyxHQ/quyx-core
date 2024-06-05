import { Router } from 'express';

export abstract class AbstractRoutes {
    constructor(public router: Router, public path?: string) {}
    public abstract handle(): void;
}
