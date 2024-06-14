import mongoose from 'mongoose';

export interface userDoc extends User, mongoose.Document {}

const userSchema = new mongoose.Schema(
    {
        tg: {
            id: {
                type: Number,
                default: null,
            },
            username: {
                type: String,
                default: null,
            },
            firstName: {
                type: String,
                default: null,
            },
            lastName: {
                type: String,
                default: null,
            },
            languageCode: {
                type: String,
                default: null,
            },
            photoUrl: {
                type: String,
                default: null,
            },
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        hasBlueTick: {
            type: Boolean,
            default: false,
        },
        pfp: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            default: null,
        },
        address: {
            type: String,
            required: true,
            unique: true,
        },
        did: {
            type: String,
            required: true,
            unique: true,
        },
        socials: {
            x: {
                type: String,
                default: null,
            },
            yt: {
                type: String,
                default: null,
            },
            tg: {
                type: String,
                default: null,
            },
            other: {
                type: String,
                default: null,
            },
        },
        pending_usernames: [
            {
                username: {
                    type: String,
                    required: true,
                    unique: true,
                },
                address: {
                    type: String,
                    required: true,
                    unique: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const userModel = mongoose.model<userDoc>('User', userSchema);

export default userModel;
