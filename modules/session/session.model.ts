import mongoose from 'mongoose';

export interface sessionDoc extends Session, mongoose.Document {}

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        device: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const sessionModel = mongoose.model<sessionDoc>('Session', sessionSchema);

export default sessionModel;
