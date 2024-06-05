import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.strictObject({
        username: z
            .string()
            .min(4)
            .refine(
                (val) => /_{2,}/.test(val),
                'Error: Username cannot have consecutive underscores'
            )
            .refine((val) => /^_/.test(val), 'Error: Username cannot have a leading underscore')
            .refine((val) => /_$/.test(val), 'Error: Username cannot have a trailing underscore')
            .refine((val) => /\s/.test(val), 'Error: Username cannot have whitespace characters')
            .refine(
                (val) => /[^a-zA-Z0-9_]/.test(val),
                'Error: Username can only contain alphanumeric characters and underscores'
            ),
        socials: z
            .object({
                x: z.string().url().optional().nullable(),
                yt: z.string().url().optional().nullable(),
                tg: z.string().url().optional().nullable(),
                other: z.string().url().optional().nullable(),
            })
            .optional(),
    }),
});

export type updateUserType = z.TypeOf<typeof updateUserSchema>;
