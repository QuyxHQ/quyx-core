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

type FileObject = {
    jwt: string;
    revoked: boolean;
    sites: string[];
};

export default class IdentityManagement {
    constructor(private storage: FileBase = new FileBase()) {}

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
            secureRandom: key.hex,
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
            secureRandom: this.generateRandomKey().hex,
        });

        const pk = (issuer.keys[0] as any).privateKeyJwk;
        const signer = EdDSASigner(Buffer.from(pk.d, 'base64'));

        const vc: JwtCredentialPayload = {
            sub: subject,
            nbf: Math.floor(Date.now() / 1000),
            exp: expires,
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
        const hash = await this.hash(jwt);
        const subjectHash = await this.hash(subject);

        const { gateway } = await this.storage.getFile(hash);
        const data = (await this.storage.readContentFromFile(gateway)) as string[];
        data.push(hash);

        const [_, urls] = await Promise.all([
            this.storage.addFile(subjectHash, data),
            this.storage.addFile(hash, {
                jwt,
                revoked: false,
                sites: [],
            }),
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
            const data = (await this.storage.readContentFromFile(gateway)) as FileObject;
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

    /**
     * Verifies a credential
     * @param  {string} jwt - credential JWT
     * @returns {Object} the credential content
     **/
    async verifyCredential(jwt: string): Promise<Record<string, any>> {
        const hash = await this.hash(jwt);

        const isRevoked = await this.isVCRevoked(hash);
        if (isRevoked) throw new Error('Credential has been revoked');

        const resolver = {
            resolve: async (id: string) => {
                const { didDocument } = await did.key.resolve(id);
                return didDocument;
            },
        };

        const vc = await verifyCredential(jwt, resolver as any);
        if (!vc.verified) throw new Error('Credential could not be verified');

        return vc.payload.credentialSubject;
    }

    /**
     * Gives site permission to access a particular credential
     * @param  {string} hash - JWT hash
     * @param  {string} subject - DID of site
     **/
    async permitSite(hash: string, subject: string) {
        const subjectHash = await this.hash(subject);

        const [{ gateway: vc_gateway }, { gateway: site_gateway }] = await Promise.all([
            this.storage.getFile(hash),
            this.storage.getFile(subjectHash),
        ]);

        const [_vc, _site] = await Promise.all([
            this.storage.readContentFromFile(vc_gateway),
            this.storage.readContentFromFile(site_gateway),
        ]);

        let vc = _vc as FileObject;
        if (vc.revoked) throw new Error('Error: This credential has been revoked');
        if (vc.sites.includes(subject)) throw new Error('Error: Access already exist');

        vc.sites.push(subject);

        let site = _site as string[]; // array of hash the site has access to
        site.push(hash);

        await Promise.all([
            this.storage.addFile(hash, vc),
            this.storage.addFile(subjectHash, site),
        ]);
    }

    /**
     * Revokes site access to a credential
     * @param  {string} hash - JWT hash
     * @param  {string} subject - DID of site
     **/
    async revokeSiteAccess(hash: string, subject: string) {
        const subjectHash = await this.hash(subject);

        const [{ gateway: vc_gateway }, { gateway: site_gateway }] = await Promise.all([
            this.storage.getFile(hash),
            this.storage.getFile(subjectHash),
        ]);

        const [_vc, _site] = await Promise.all([
            this.storage.readContentFromFile(vc_gateway),
            this.storage.readContentFromFile(site_gateway),
        ]);

        let vc = _vc as FileObject;
        if (vc.revoked) throw new Error('Error: This credential has been revoked');
        if (!vc.sites.includes(subject)) throw new Error('Error: Previous access not found');

        vc.sites.splice(vc.sites.indexOf(subject), 1);

        let site = _site as string[]; // array of hash the site has access to
        site.splice(site.indexOf(hash), 1);

        await Promise.all([
            this.storage.addFile(hash, vc),
            this.storage.addFile(subjectHash, site),
        ]);
    }
}
