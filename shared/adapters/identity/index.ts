import crypto from 'crypto';
import * as did from '@transmute/did-key.js';
import {
    Issuer,
    JwtCredentialPayload,
    createVerifiableCredentialJwt,
    verifyCredential,
} from 'did-jwt-vc';
import { EdDSASigner } from 'did-jwt';
import { sha256 } from 'ton-crypto';
import FileBase from '../filebase';
import { NoSuchKey } from '@aws-sdk/client-s3';
import { Logger } from '../../logger';
import redis from '../redis';
import { getHashKey } from '../../global';

export type VCFileObject = {
    subject: string;
    jwt: string;
    revoked: boolean;
    spaces: string[];
};

export type SpaceFileObject = {
    maps: Record<string, string>;
    hashes: string[];
};

export default class IdentityManagement {
    constructor(private storage: FileBase = new FileBase(), private cache: typeof redis = redis) {}

    private generateRandomKey() {
        const buffer = crypto.randomBytes(32);
        const hex = buffer.toString('hex');

        return { buffer, hex };
    }

    /**
     * Returns the SHA256 of the given JWT
     * @param  {string} jwt - credential JWT
     * @returns {string} sha256 hash of the provided string
     **/
    async hash(jwt: string): Promise<string> {
        return (await sha256(jwt)).toString('hex');
    }

    /**
     * Creates a new DID document
     * @returns {Object} DID document
     **/
    async createDID() {
        const key = this.generateRandomKey();

        const { didDocument } = await did.key.generate({
            type: 'Ed25519',
            accept: 'application/did+json',
            secureRandom: () => key.buffer,
        });

        return {
            did: didDocument.id,
            didDocument,
            key,
        };
    }

    /**
     * Resolves a did
     * @param  {vary} value - the DID string; e.g. did:key:#####
     * @returns {Object} DID document
     **/
    async resolveDID(value: string) {
        const { didDocument } = await did.key.resolve(value);
        return didDocument;
    }

    /**
     * Issues a credential to a user
     * @param  {string} subject - DID of the credential subject
     * @param  {Object} payload - payload JSON
     * @param  {number} expires - credential expiry in seconds
     * @returns {vary} escaped value
     **/
    async issueCredential(subject: string, payload: Record<string, any>, expires?: number) {
        const issuer = await did.key.generate({
            type: 'Ed25519',
            accept: 'application/did+json',
            secureRandom: () => this.generateRandomKey().buffer,
        });

        const pk = (issuer.keys[0] as any).privateKeyJwk;
        const signer = EdDSASigner(Buffer.from(pk.d, 'base64'));

        const vc: JwtCredentialPayload = {
            sub: subject,
            nbf: Math.floor(Date.now() / 1000),
            exp: expires ? Math.floor(expires / 1000) : undefined,
            vc: {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential'],
                credentialSubject: {
                    id: subject,
                    ...payload,
                },
            },
        };

        const Issuer: Issuer = {
            did: issuer.didDocument.id,
            signer,
            alg: 'EdDSA',
        };

        const jwt = await createVerifiableCredentialJwt(vc, Issuer);
        const [hash, subjectHash] = await Promise.all([this.hash(jwt), this.hash(subject)]);

        const { gateway } = await this.storage.getFile(subjectHash);
        const data = (await this.storage.readContentFromFile(gateway)) as string[];
        data.push(hash);

        const content = {
            subject,
            jwt,
            revoked: false,
            spaces: []
        };

        const [urls] = await Promise.all([
            this.storage.addFile(hash, content),
            this.storage.addFile(subjectHash, data),
            this.cache.set(getHashKey(subjectHash), data),
            this.cache.set(getHashKey(hash), content)
        ]);

        return { jwt, hash, urls };
    }

    /**
     * Checks if a credential has been revoked or not
     * @param  {string} hash - JWT credential hash
     * @returns {boolean} true/false
     **/
    async isVCRevoked(hash: string): Promise<boolean> {
        try {
            const { gateway } = await this.storage.getFile(hash);
            const data = (await this.storage.readContentFromFile(gateway)) as VCFileObject;
            if (!data) return true;

            return data.revoked;
        } catch (e: any) {
            Logger.red(e.message);

            if (e instanceof NoSuchKey) {
                return true;
            }
        }

        return true;
    }

    async getCredential(jwt: string) {
        const resolver = {
            resolve: async (did: string) => {
                return await this.resolveDID(did);
            },
        };

        return await verifyCredential(jwt, resolver as any);
    }

    /**
     * Verifies a credential
     * @param  {string} jwt - credential JWT
     * @returns {Object} the credential content
     **/
    async verifyCredential(jwt: string): Promise<Record<string, any>> {
        const hash = await this.hash(jwt);

        const isRevoked = await this.isVCRevoked(hash);
        if (isRevoked) throw new Error('Credential has been revoked');

        const vc = await this.getCredential(jwt);
        if (!vc.verified) throw new Error('Credential could not be verified');

        return vc.verifiableCredential;
    }

    /**
     * Gives space permission to access a particular credential
     * @param  {string} hash - JWT hash
     * @param  {string} subject - DID of space
     **/
    async permitSpace(hash: string, subject: string, spaceSubject: string) {
        const spaceHash = await this.hash(spaceSubject);

        const [{ gateway: vc_gateway }, { gateway: space_gateway }] = await Promise.all([
            this.storage.getFile(hash),
            this.storage.getFile(spaceHash),
        ]);

        const [_vc, _space] = await Promise.all([
            this.storage.readContentFromFile(vc_gateway),
            this.storage.readContentFromFile(space_gateway),
        ]);

        let vc = _vc as VCFileObject;
        if (vc.subject != subject) throw new Error('Error: Unauthorized to perform action');
        if (vc.revoked) throw new Error('Error: This credential has been revoked');
        if (vc.spaces.includes(spaceSubject)) return;

        vc.spaces.push(spaceSubject);

        let space = _space as SpaceFileObject; // array of hash the space has access to
        if (space.hashes.includes(hash)) return;

        if (space.maps[vc.subject]) {
            // remove the existing hash
            space.hashes.splice(space.hashes.indexOf(space.maps[vc.subject]), 1);
        }

        space.maps[vc.subject] = hash;
        space.hashes.push(hash);

        await Promise.all([
            this.cache.set(getHashKey(hash), vc),
            this.cache.set(getHashKey(spaceHash), space),
            this.storage.addFile(hash, vc),
            this.storage.addFile(spaceHash, space),
        ]);
    }

    /**
     * Revokes space access to a credential
     * @param  {string} hash - JWT hash
     * @param  {string} subject - DID of user
     * @param  {string} space_did - DID of space
     **/
    async revokeSpaceAccess(hash: string, subject: string, space_did: string) {
        const spaceHash = await this.hash(space_did);

        const [{ gateway: vc_gateway }, { gateway: space_gateway }] = await Promise.all([
            this.storage.getFile(hash),
            this.storage.getFile(spaceHash),
        ]);

        const [_vc, _space] = await Promise.all([
            this.storage.readContentFromFile(vc_gateway),
            this.storage.readContentFromFile(space_gateway),
        ]);

        let vc = _vc as VCFileObject;
        if (vc.subject != subject) throw new Error('Error: Unauthorized to perform action');
        if (vc.revoked) throw new Error('Error: This credential has been revoked');
        if (!vc.spaces.includes(space_did)) return;

        vc.spaces.splice(vc.spaces.indexOf(space_did), 1);

        let space = _space as SpaceFileObject; // array of hash the space has access to
        if (!space.hashes.includes(hash)) return;

        delete space.maps[vc.subject];
        space.hashes.splice(space.hashes.indexOf(hash), 1);

        await Promise.all([
            this.cache.set(getHashKey(hash), vc),
            this.storage.addFile(hash, vc),
            this.cache.set(getHashKey(spaceHash), space),
            this.storage.addFile(spaceHash, space),
        ]);
    }

    /**
     * Revokes a credential
     * @param  {string} hash - JWT hash
     **/
    async revoke(hash: string, subject: string) {
        const { gateway } = await this.storage.getFile(hash);
        const data = (await this.storage.readContentFromFile(gateway)) as VCFileObject;
        if (data.subject != subject) throw new Error('Error: Unauthorized to perform action');
        if (data.revoked) return;

        if (data.spaces.length > 0) {
            // revoking the spaces as well
            const spaces = await Promise.all(data.spaces.map((space) => this.hash(space)));

            const fn = spaces.map(async (space_hash) => {
                const { gateway } = await this.storage.getFile(space_hash);
                const space = (await this.storage.readContentFromFile(gateway)) as SpaceFileObject;

                if (space.hashes.includes(hash)) {
                    delete space.maps[data.subject];
                    space.hashes.splice(space.hashes.indexOf(hash), 1);
                }

                await Promise.all([
                    this.storage.addFile(space_hash, space),
                    this.cache.set(getHashKey(space_hash), space),
                ]);
            });

            await Promise.all(fn);
        }

        data.revoked = true;

        // remove this hash from the user hashes
        const subjectHash = await this.hash(subject);
        const { gateway: subject_gateway } = await this.storage.getFile(subjectHash);
        const subjectData = (await this.storage.readContentFromFile(subject_gateway)) as string[];
        if (subjectData.includes(hash)) subjectData.splice(subjectData.indexOf(hash), 1);

        await Promise.all([
            this.storage.addFile(hash, data),
            this.cache.set(getHashKey(hash), data),
            this.storage.addFile(subjectHash, subjectData),
            this.cache.set(getHashKey(subjectHash), subjectData),
        ]);
    }
}
