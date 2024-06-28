import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import env from '../../env';
import { Logger } from '../../logger';
import axios from 'axios';

type URLResponseObject = { gateway: string; ipfs: string };

export default class FileBase {
    private s3: S3Client;

    constructor(private bucket = env.FILEBASE_BUCKET) {
        if (env.IS_TESTNET) {
            this.s3 = new S3Client({ endpoint: 'https://s3.filebase.com', region: 'us-east-1' });
        } else {
            if (!env.FILEBASE_ACCESS_KEY || !env.FILEBASE_SECRET_KEY) {
                throw new Error('FILEBASE_ACCESS_KEY or FILEBASE_SECRET_KEY not set');
            }

            this.s3 = new S3Client({
                endpoint: 'https://s3.filebase.com',
                region: 'us-east-1',
                credentials: {
                    accessKeyId: env.FILEBASE_ACCESS_KEY,
                    secretAccessKey: env.FILEBASE_SECRET_KEY,
                },
            });
        }
    }

    /**
     * Creates an accessible link from a given cid
     * @param  {string} cid - content identifier returned
     * @returns {URLResponseObject} the urls pointing to the file
     **/
    private getUrls(cid: string): URLResponseObject {
        return {
            gateway: `https://ipfs.filebase.io/ipfs/${cid}`,
            ipfs: `ipfs://${cid}`,
        };
    }

    /**
     * Adds a file to storage
     * @param  {string} key - file name
     * @param  {Object} content - JSON
     * @returns {URLResponseObject} the urls pointing to the file
     **/
    async addFile(key: string, content: Record<string, any>): Promise<URLResponseObject> {
        const buffer = Buffer.from(JSON.stringify(content));
        const Key = `${key}.json`;

        try {
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key,
                    Body: buffer,
                    ContentType: 'application/json',
                })
            );

            const resp = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key }));
            const cid = resp.Metadata?.cid;
            if (!cid) throw new Error('Error: Could not get file CID');

            return this.getUrls(cid);
        } catch (e: any) {
            Logger.red(e);

            throw new Error(e.message);
        }
    }

    /**
     * Gets the url from the file name
     * @param  {string} key - file name
     * @returns {URLResponseObject} the urls pointing to the file
     **/
    async getFile(key: string): Promise<URLResponseObject> {
        const Key = `${key}.json`;

        const resp = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key }));
        const cid = resp.Metadata?.cid;

        if (!cid) throw new Error('Error: Could not get file CID');

        return this.getUrls(cid);
    }

    /**
     * Fetches the JSON content from the given url
     * @param  {string} url - the gateway url
     * @returns {vary} data from url (JSON)
     **/
    async readContentFromFile(url: string): Promise<Record<string, any>> {
        try {
            const { data } = await axios.get(url);
            return data as Record<string, any>;
        } catch (e: any) {
            Logger.red(e);

            throw new Error(e.message);
        }
    }
}
