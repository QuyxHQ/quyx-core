import mongoose from 'mongoose';

export interface authDoc extends Auth, mongoose.Document {}

const authSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
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

const authModel = mongoose.model<authDoc>('Auth', authSchema);

export default authModel;
