import mongoose from 'mongoose';

interface BaseRepoInterface<I, D> {
    insert(input: I): Promise<
        mongoose.Document<unknown, {}, D> &
            D &
            Required<{
                _id: unknown;
            }>
    >;

    countRows(filter?: mongoose.FilterQuery<D>): Promise<number>;

    select(
        filter: mongoose.FilterQuery<D>,
        projection?: mongoose.ProjectionType<D>,
        options?: mongoose.QueryOptions<D>
    ): Promise<
        (mongoose.Document<unknown, {}, D> &
            D &
            Required<{
                _id: unknown;
            }>)[]
    >;

    selectOne(
        filter: mongoose.FilterQuery<D>,
        projection?: mongoose.ProjectionType<D>,
        options?: mongoose.QueryOptions<D>
    ): Promise<
        | (mongoose.Document<unknown, {}, D> &
              D &
              Required<{
                  _id: unknown;
              }>)
        | null
    >;

    update(
        filter?: mongoose.FilterQuery<D>,
        update?: mongoose.UpdateQuery<D> | mongoose.UpdateWithAggregationPipeline,
        options?: mongoose.mongo.UpdateOptions
    ): Promise<mongoose.UpdateWriteOpResult>;

    updateMany(
        filter?: mongoose.FilterQuery<D>,
        update?: mongoose.UpdateQuery<D> | mongoose.UpdateWithAggregationPipeline,
        options?: mongoose.mongo.UpdateOptions
    ): Promise<mongoose.UpdateWriteOpResult>;

    aggregate(
        pipeline?: mongoose.PipelineStage[],
        options?: mongoose.AggregateOptions
    ): Promise<any[]>;
}

// I = insert options
// D = model document
export default class BaseRepo<I = {}, D = {}> implements BaseRepoInterface<I, D> {
    constructor(
        public model: mongoose.Model<
            D,
            {},
            {},
            {},
            mongoose.Document<unknown, {}, D> & D & Required<{ _id: unknown }>,
            any
        >
    ) {}

    async insert(input: I) {
        try {
            const entry = new this.model({ ...input });
            const result = await entry.save();

            return result;
        } catch (e: any) {
            if (e && e instanceof mongoose.Error.ValidationError) {
                for (let field in e.errors) {
                    const errorMsg = e.errors[field].message;

                    throw new Error(errorMsg);
                }
            }

            throw new Error(e);
        }
    }

    async update(
        filter?: mongoose.FilterQuery<D>,
        update?: mongoose.UpdateQuery<D> | mongoose.UpdateWithAggregationPipeline,
        options?: mongoose.mongo.UpdateOptions
    ) {
        try {
            const result = await this.model.updateOne(filter, update, options);
            return result;
        } catch (e: any) {
            if (e && e instanceof mongoose.Error.ValidationError) {
                for (let field in e.errors) {
                    const errorMsg = e.errors[field].message;

                    throw new Error(errorMsg);
                }
            }

            throw new Error(e);
        }
    }

    async updateMany(
        filter?: mongoose.FilterQuery<D>,
        update?: mongoose.UpdateQuery<D> | mongoose.UpdateWithAggregationPipeline,
        options?: mongoose.mongo.UpdateOptions
    ) {
        try {
            const result = await this.model.updateMany(filter, update, options);
            return result;
        } catch (e: any) {
            if (e && e instanceof mongoose.Error.ValidationError) {
                for (let field in e.errors) {
                    const errorMsg = e.errors[field].message;

                    throw new Error(errorMsg);
                }
            }

            throw new Error(e);
        }
    }

    async countRows(filter?: mongoose.FilterQuery<D>) {
        const result = await this.model.countDocuments(filter);
        return result;
    }

    async select(
        filter: mongoose.FilterQuery<D>,
        projection?: mongoose.ProjectionType<D>,
        options?: mongoose.QueryOptions<D>
    ) {
        const result = await this.model.find(filter, projection, options);
        return result;
    }

    async selectOne(
        filter: mongoose.FilterQuery<D>,
        projection?: mongoose.ProjectionType<D>,
        options?: mongoose.QueryOptions<D>
    ) {
        const result = await this.model.findOne(filter, projection, options);
        return result;
    }

    async aggregate(pipeline?: mongoose.PipelineStage[], options?: mongoose.AggregateOptions) {
        try {
            const result = await this.model.aggregate(pipeline, options);
            return result;
        } catch (e: any) {
            if (e && e instanceof mongoose.Error.ValidationError) {
                for (let field in e.errors) {
                    const errorMsg = e.errors[field].message;

                    throw new Error(errorMsg);
                }
            }

            throw new Error(e);
        }
    }
}
