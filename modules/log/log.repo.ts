import BaseRepo from '../../shared/base.repo';
import { Logger } from '../../shared/logger';
import SpaceRepo from '../space/space.repo';
import logModel, { logDoc } from './log.model';

const spaceRepo = new SpaceRepo();

export default class LogRepo extends BaseRepo<Log, logDoc> {
    constructor() {
        super(logModel);
    }

    async addLog(input: Log) {
        try {
            const result = await this.insert(input);

            return { status: true, data: result };
        } catch (e: any) {
            Logger.red(e);

            return { status: false, error: e.message };
        }
    }

    async getSpaceLogs(space: string, page = 1, limit = 30) {
        const skip = (page - 1) * limit;

        return await this.select(
            { space },
            {},
            {
                lean: true,
                skip,
                limit,
                populate: 'space',
            }
        );
    }

    async getDevLogs(dev: string, page = 1, limit = 30) {
        const skip = (page - 1) * limit;

        return await this.select(
            { dev },
            {},
            {
                lean: true,
                skip,
                limit,
                populate: 'space',
            }
        );
    }

    async getSpaceMetrics(space: string) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const [
            totalRequestsLast1Hr,
            successfulRequestsLast1Hr,
            failedRequestsLast1Hr,
            totalRequestsLast24Hrs,
            successfulRequestsLast24Hrs,
            failedRequestsLast24Hrs,
            totalRequestsAllTime,
            avgResponseTimeLast5Mins,
        ] = await Promise.all([
            this.countRows({ space, createdAt: { $gte: oneHourAgo } }),
            this.countRows({ space, createdAt: { $gte: oneHourAgo }, status: 'successful' }),
            this.countRows({ space, createdAt: { $gte: oneHourAgo }, status: 'failed' }),
            this.countRows({ space, createdAt: { $gte: oneDayAgo } }),
            this.countRows({ space, createdAt: { $gte: oneDayAgo }, status: 'successful' }),
            this.countRows({ space, createdAt: { $gte: oneDayAgo }, status: 'failed' }),
            this.countRows({ space }),
            this.select(
                { space, createdAt: { $gte: fiveMinutesAgo } },
                { response_time: 1 },
                { lean: true }
            ),
        ]);

        const percentageSuccessfulLast1Hr =
            (successfulRequestsLast1Hr / totalRequestsLast1Hr) * 100 || 0;

        const percentageSuccessfulLast24Hrs =
            (successfulRequestsLast24Hrs / totalRequestsLast24Hrs) * 100 || 0;

        const avg =
            avgResponseTimeLast5Mins.reduce((sum, item) => sum + item.response_time, 0) /
            avgResponseTimeLast5Mins.length;

        return {
            percentageSuccessfulLast1Hr,
            percentageSuccessfulLast24Hrs,
            avgResponseTimeLast5Mins: avg,
            totalRequestsLast1Hr,
            successfulRequestsLast1Hr,
            failedRequestsLast1Hr,
            totalRequestsLast24Hrs,
            successfulRequestsLast24Hrs,
            failedRequestsLast24Hrs,
            totalRequestsAllTime,
        };
    }

    async getDevMetrics(dev: string) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const now = new Date();
        const startOfWeek = (date: Date) => {
            const start = new Date(date);
            start.setDate(date.getDate() - date.getDay()); // set to Sunday
            start.setHours(0, 0, 0, 0);
            return start;
        };

        const startOfCurrentWeek = startOfWeek(now);
        const startOfPreviousWeek = startOfWeek(
            new Date(startOfCurrentWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
        );

        const [total_spaces, total_logs, failedRequestsLast24Hr, successfulRequestsLast24Hr, logs] =
            await Promise.all([
                spaceRepo.countRows({ owner: dev, isActive: true }),
                this.countRows({ dev }),
                this.countRows({ dev, createdAt: { $gte: oneDayAgo }, status: 'failed' }),
                this.countRows({ dev, createdAt: { $gte: oneDayAgo }, status: 'successful' }),
                this.aggregate([
                    {
                        $match: {
                            dev,
                            createdAt: { $gte: startOfPreviousWeek },
                        },
                    },
                    {
                        $project: {
                            dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1 (Sunday) - 7 (Saturday)
                            week: {
                                $cond: [
                                    { $gte: ['$createdAt', startOfCurrentWeek] },
                                    2, // Current week
                                    1, // Previous week
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: { week: '$week', dayOfWeek: '$dayOfWeek' },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { '_id.week': 1, '_id.dayOfWeek': 1 },
                    },
                ]),
            ]);

        const formatWeekData = (week: any, days: any) => {
            const result = {};
            let total = 0;
            for (let i = 1; i <= 7; i++) {
                const dayCount = days.find((d: any) => d._id.dayOfWeek === i)?.count || 0;
                //@ts-ignore
                result[`day${i}`] = dayCount;
                total += dayCount;
            }

            return { ...result, total_week: total };
        };

        const week1Data = logs.filter((log) => log._id.week === 1);
        const week2Data = logs.filter((log) => log._id.week === 2);

        const week1 = formatWeekData(1, week1Data);
        const week2 = formatWeekData(2, week2Data);

        return {
            total_logs,
            total_spaces,
            failedRequestsLast24Hr,
            successfulRequestsLast24Hr,
            logs: {
                week1,
                week2,
            },
        };
    }
}
