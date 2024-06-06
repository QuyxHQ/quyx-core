import { z } from 'zod';

export const newSpaceSchema = z.object({
    body: z.strictObject({
        name: z.string().min(4),
        url: z.string().url().optional(),
    }),
});

export const updateSpaceSchema = z.object({
    body: z.strictObject({
        url: z.string().url(),
    }),
});

export type newSpaceType = z.TypeOf<typeof newSpaceSchema>;
export type updateSpaceType = z.TypeOf<typeof updateSpaceSchema>;
