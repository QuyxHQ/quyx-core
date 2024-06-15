import { Request, Response } from 'express';

export function getCollectionMetadata(_: Request, res: Response) {
    const obj = {
        image: 'https://media.quyx.xyz/collection.png',
        name: 'Quyx usernames',
        description:
            "Quyx usernames - your #1 step to make good use of Quyx's decentralized solution",
        social_links: ['https://twitter.com/@quyxHQ'],
    };

    return res.status(200).json(obj);
}

export function getNftItemMetadata(req: Request, res: Response) {
    const { username } = req.params;

    const obj = {
        name: username,
        description:
            'A part of Quyx username - the starting point of your decentralized identity management',
        image: `https://media.quyx.xyz/nft/${username}`,
        buttons: [
            {
                label: 'Go to Quyx',
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
