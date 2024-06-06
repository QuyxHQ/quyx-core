import mongoose from 'mongoose';

export interface spaceDoc extends Space, mongoose.Document {}

const spaceSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dev',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        did: {
            type: String,
            required: true,
            unique: true,
        },
        url: {
            type: String,
            default: null,
        },
        keys: {
            pk: {
                type: String,
                required: true,
                unique: true,
                select: false,
            },
            sk: {
                type: String,
                required: true,
                unique: true,
                select: false,
            },
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

const spaceModel = mongoose.model<spaceDoc>('Space', spaceSchema);

export default spaceModel;
