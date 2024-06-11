import { Request, Response } from 'express';
import { get } from 'lodash';

export function getCollectionMetadata(_: Request, res: Response) {
    const obj = {
        image: 'https://iili.io/JGZ15Yb.jpg',
        name: 'Quyx usernames',
        description:
            "Quyx usernames - your #1 step to make good use of Quyx's decentralized solution",
        social_links: ['https://twitter.com/@quyxHQ'],
    };

    return res.status(200).json(obj);
}

export function getNftItemMetadata(req: Request, res: Response) {
    const username = get(req.query, 'username', undefined);
    if (!username) return res.sendStatus(404);

    if (typeof username != 'string') return res.sendStatus(400);

    const obj = {
        name: `@${username}`,
        description:
            'A part of Quyx username - the starting point of your decentralized identity management',
        image: `https://nfts.quyx.xyz?name=${username}`,
        buttons: [
            {
                label: 'Open in Quyx',
                uri: 'https://quyx.xyz',
            },
        ],
        attributes: [
            {
                trait_type: 'Length',
                value: username.length,
            },
        ],
    };

    return res.status(200).json(obj);
}
