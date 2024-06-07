import mongoose from 'mongoose';

export interface bookmarkDoc extends Bookmark, mongoose.Document {}

const bookmarkSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const bookmarkModel = mongoose.model<bookmarkDoc>('Bookmark', bookmarkSchema);

export default bookmarkModel;
