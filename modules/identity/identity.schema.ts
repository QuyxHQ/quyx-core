import { z } from 'zod';

export const issueCredentialSchema = z.object({
    body: z.strictObject({
        payload: z.object({}),
        expires: z.number().gt(Date.now()).optional(),
    }),
});

export const verifyCredentialSchema = z.object({
    body: z.strictObject({
        jwt: z.string(),
    }),
});

export type issueCredentialType = z.TypeOf<typeof issueCredentialSchema>;
export type verifyCredentialType = z.TypeOf<typeof verifyCredentialSchema>;
