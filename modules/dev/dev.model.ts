import mongoose from 'mongoose';

export interface devDoc extends Dev, mongoose.Document {}

const devSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        picture: {
            type: String,
            required: true,
        },
        provider: {
            type: String,
            required: true,
            enum: ['google', 'github'],
        },
    },
    {
        timestamps: true,
    }
);

const devModel = mongoose.model<devDoc>('Dev', devSchema);

export default devModel;
