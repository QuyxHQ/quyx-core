import crypto from 'crypto';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import nacl from 'tweetnacl';
import { Wallet, TonProofItemReplySuccess } from '@tonconnect/sdk';
import { get } from 'lodash';
import { Address, Cell } from 'ton-core';
import env from './env';

type PayloadType = {
    issued_at: number;
    expires_at: number;
    data: any;
};

type Domain = {
    LengthBytes: number;
    Value: string;
};

type ParsedMessage = {
    Workchain: number;
    Address: Buffer;
    Timstamp: number;
    Domain: Domain;
    Signature: Buffer;
    Payload: string;
    StateInit: string;
};

export function getLogAction(path: string) {
    if (path.substring(0, 17) == '/identity/permit/') return 'Accessed credential';
    if (path.substring(0, 15) == '/identity/user/') return 'Get space user';

    switch (path) {
        case '/auth/token':
            return 'Generate Proof Payload';

        case '/identity/issue-vc':
            return 'Issue VC';

        case '/identity/verify-vc':
            return 'Verify VC';

        case '/misc/upload':
            return 'Image upload';

        case '/identity':
            return 'Get users';

        default:
            return undefined;
    }
}

export function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function isValidAddress(address: string) {
    try {
        Address.parse(address);

        return true;
    } catch (e: any) {
        return false;
    }
}

const ALPHABETS = 'QWERTYUIOPASDFGHJKLZXCVBNM0123456789';
export function randomStr(len: number, arr: string = ALPHABETS) {
    var ans = '';
    for (var i = len; i > 0; i--) {
        ans += arr[Math.floor(Math.random() * arr.length)];
    }

    return ans;
}

export function getHashKey(hash: string) {
    return `__HASH:/${hash}`;
}

export function encrypt(input: Object | string) {
    if (!env.ENCRYPTION_PUBLIC_KEY) throw new Error('RSA_PUBLIC_KEY not set');
    const data = typeof input === 'object' ? JSON.stringify(input) : input;

    if (typeof input === 'object') input = JSON.stringify(input);

    const key = crypto.randomBytes(32);

    const encryptedKey = crypto.publicEncrypt(
        {
            key: crypto.createPublicKey(env.ENCRYPTION_PUBLIC_KEY),
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        key
    );

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${encryptedData}.${encryptedKey.toString('hex')}.${iv.toString(
        'hex'
    )}.${authTag.toString('hex')}`;
}

export function decrypt(input: string) {
    if (!env.ENCRYPTION_PRIVATE_KEY) throw new Error('RSA_PRIVATE_KEY not set');

    const [encryptedData, encryptedKey, iv, authTag] = input.split('.');
    if (!encryptedData || !encryptedKey || !iv || !authTag) {
        throw new Error('Invalid encrypted input');
    }

    const key = crypto.privateDecrypt(
        {
            key: env.ENCRYPTION_PRIVATE_KEY,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(encryptedKey, 'hex')
    );

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    if (!decryptedData) return null;

    try {
        return JSON.parse(decryptedData) as Record<string, any>;
    } catch {
        return decryptedData as any;
    }
}

export async function generatePayloadToken(input?: string) {
    if (!env.ENCRYPTION_PUBLIC_KEY) throw new Error('RSA_PUBLIC_KEY not set');

    const payload: PayloadType = {
        issued_at: Date.now(),
        expires_at: Date.now() + 3_600_000, // expires 60 mins after issuing
        data: input || String(Date.now()),
    };

    const buffer = crypto.publicEncrypt(
        {
            key: crypto.createPublicKey(env.ENCRYPTION_PUBLIC_KEY),
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(JSON.stringify(payload))
    );

    const token = buffer.toString('hex');

    return token;
}

export function decryptPayloadToken(token: string) {
    if (!env.ENCRYPTION_PRIVATE_KEY) throw new Error('RSA_PRIVATE_KEY not set');

    const buffer = crypto.privateDecrypt(
        {
            key: crypto.createPrivateKey(env.ENCRYPTION_PRIVATE_KEY),
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(token, 'hex')
    );

    const result = buffer.toString('utf-8');
    if (!result || result.length == 0) return null;

    return JSON.parse(result) as PayloadType;
}

export async function verifyPayloadToken(token: string) {
    const result = decryptPayloadToken(token);
    if (!result) return { status: false, error: 'Error: Bad request' };

    if (Date.now() < result.issued_at) {
        return { status: false, error: 'Error: Invalid date format' };
    }

    if (Date.now() > result.expires_at) {
        return { status: false, error: 'Error: Token has expired' };
    }

    return { status: true, data: result };
}

const tonProofPrefix = 'ton-proof-item-v2/';
const tonConnectPrefix = 'ton-connect';

export function signatureVerify(pubkey: Buffer, message: Buffer, signature: Buffer): boolean {
    return nacl.sign.detached.verify(message, signature, pubkey);
}

export async function createMessage(message: ParsedMessage): Promise<Buffer> {
    const wc = Buffer.alloc(4);
    wc.writeUint32BE(message.Workchain);

    const ts = Buffer.alloc(8);
    ts.writeBigUint64LE(BigInt(message.Timstamp));

    const dl = Buffer.alloc(4);
    dl.writeUint32LE(message.Domain.LengthBytes);

    const m = Buffer.concat([
        Buffer.from(tonProofPrefix),
        wc,
        message.Address,
        dl,
        Buffer.from(message.Domain.Value),
        ts,
        Buffer.from(message.Payload),
    ]);

    const messageHash = crypto.createHash('sha256').update(m).digest();

    const fullMes = Buffer.concat([
        Buffer.from([0xff, 0xff]),
        Buffer.from(tonConnectPrefix),
        Buffer.from(messageHash),
    ]);

    const res = crypto.createHash('sha256').update(fullMes).digest();
    return Buffer.from(res);
}

export function convertTonProofMessage(walletInfo: Wallet, tp: TonProofItemReplySuccess) {
    const address = Address.parse(walletInfo.account.address);

    const res: ParsedMessage = {
        Workchain: address.workChain,
        Address: address.hash,
        Domain: {
            LengthBytes: tp.proof.domain.lengthBytes,
            Value: tp.proof.domain.value,
        },
        Signature: Buffer.from(tp.proof.signature, 'base64'),
        Payload: tp.proof.payload,
        StateInit: walletInfo.account.walletStateInit,
        Timstamp: tp.proof.timestamp,
    };

    return res;
}

export function signJWT(object: Object, options?: jwt.SignOptions) {
    return jwt.sign(object, env.JWT_SECRET, {
        ...(options || {}),
        algorithm: 'HS256',
    });
}

export function verifyJWT(token: string): {
    valid: boolean;
    expired?: boolean;
    decoded?: jwt.JwtPayload;
} {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
        if (!decoded) return { valid: false }; // an invalid token passed

        const currentTime = Math.floor(new Date().getTime() / 1000);

        if (get(decoded, 'exp')! <= currentTime) {
            return { valid: false, expired: true };
        }

        return { valid: true, expired: false, decoded };
    } catch (e: any) {
        // Logger.red(e);

        if (e instanceof TokenExpiredError) {
            return { valid: false, expired: true };
        }

        return { valid: false, expired: false };
    }
}

export function toSlice(hex?: string) {
    if (!hex) return;
    return Cell.fromBoc(Buffer.from(hex, 'hex'))[0].beginParse();
}
