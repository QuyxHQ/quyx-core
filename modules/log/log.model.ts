import mongoose from 'mongoose';

export interface logDoc extends Log, mongoose.Document {}

const logSchema = new mongoose.Schema(
    {
        space: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Space',
            required: true,
        },
        dev: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dev',
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['failed', 'successful'],
        },
        log: {
            type: String,
            default: null,
        },
        action: {
            type: String,
            required: true,
        },
        response_time: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const logModel = mongoose.model<logDoc>('Log', logSchema);

export default logModel;
