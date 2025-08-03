"use server";

import mongoose, { FilterQuery, PipelineStage, Types } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";

import {
    EditUserProfileSchema,
    GetUserAnswersSchema,
    GetUserQuestionsSchema,
    GetUserSchema,
    GetUserTagsSchema,
    PaginatedSearchParamsSchema,
} from "../validation";
import { Answer, Question, User } from "@/database";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import { assignBadges } from "../utils";
import { IUserDoc } from "@/database/user.model";
import { cache } from "react";

export async function getUsers(
    params: PaginatedSearchParams
): Promise<ActionResponse<{ users: User[]; isNext: boolean }>> {
    const validationResult = await action({
        params,
        schema: PaginatedSearchParamsSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { page = 1, pageSize = 10, query, filter } = params;
    const skip = (Number(page) - 1) * pageSize;
    const limit = pageSize;
    const filterQuery: FilterQuery<typeof User> = {};

    if (query) {
        filterQuery.$or = [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
        ];
    }

    let sortCriteria = {};

    switch (filter) {
        case "newest":
            sortCriteria = { createdAt: -1 };
            break;
        case "oldest":
            sortCriteria = { createdAt: 1 };
            break;
        case "popular":
            sortCriteria = { reputation: -1 };
            break;
        default:
            sortCriteria = { createdAt: -1 };
            break;
    }

    try {
        const totalUsers = await User.countDocuments(filterQuery);
        const users = await User.find(filterQuery)
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit);

        const isNext = totalUsers > skip + users.length;
        return {
            success: true,
            data: {
                users: JSON.parse(JSON.stringify(users)),
                isNext,
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export const getUser = cache(async function getUser(
    params: GetUserParams
): Promise<
    ActionResponse<{ user: User; totalQuestions: number; totalAnswers: number }>
> {
    const validationResult = await action({
        params,
        schema: GetUserSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { userId } = params;

    try {
        const user = await User.findById(userId);

        if (!user) throw new NotFoundError("User");
        const totalQuestions = await Question.countDocuments({
            author: userId,
        });
        const totalAnswers = await Answer.countDocuments({ author: userId });

        return {
            success: true,
            data: {
                user: JSON.parse(JSON.stringify(user)),
                totalQuestions,
                totalAnswers,
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
});

export async function getUserAnswers(
    params: GetUserAnswersParams
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean }>> {
    const validationResult = await action({
        params,
        schema: GetUserAnswersSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { userId, page = 1, pageSize = 10 } = params;
    const skip = (Number(page) - 1) * pageSize;
    const limit = pageSize;

    try {
        const totalAnswers = await Answer.countDocuments({
            author: userId,
        });
        const answers = await Answer.find({ author: userId })
            .populate("author", "name image")
            .skip(skip)
            .limit(limit);
        const isNext = totalAnswers > skip + answers.length;
        return {
            success: true,
            data: {
                answers: JSON.parse(JSON.stringify(answers)),
                isNext,
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function getUserTopTags(
    params: GetUserTagsParams
): Promise<
    ActionResponse<{ tags: { _id: string; name: string; count: number }[] }>
> {
    const validationResult = await action({
        params,
        schema: GetUserTagsSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { userId } = params;

    try {
        const pipeline: PipelineStage[] = [
            { $match: { author: new Types.ObjectId(userId) } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: "tags",
                    localField: "_id",
                    foreignField: "_id",
                    as: "tagInfo",
                },
            },
            { $unwind: "$tagInfo" },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: "$tagInfo._id",
                    name: "$tagInfo.name",
                    count: 1,
                },
            },
        ];
        const tags = await Question.aggregate(pipeline);
        return {
            success: true,
            data: {
                tags: JSON.parse(JSON.stringify(tags)),
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}
export async function getUserQuestions(
    params: GetUserQuestionsParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
    const validationResult = await action({
        params,
        schema: GetUserQuestionsSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { userId, page = 1, pageSize = 10 } = params;
    const skip = (Number(page) - 1) * pageSize;
    const limit = pageSize;

    try {
        const totalQuestions = await Question.countDocuments({
            author: userId,
        });
        const questions = await Question.find({ author: userId })
            .populate("author", "name image")
            .populate("tags", "name")
            .skip(skip)
            .limit(limit);
        const isNext = totalQuestions > skip + questions.length;
        return {
            success: true,
            data: {
                questions: JSON.parse(JSON.stringify(questions)),
                isNext,
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function getUserStats(params: GetUserParams): Promise<
    ActionResponse<{
        totalQuestions: number;
        totalAnswers: number;
        badges: Badges;
    }>
> {
    const validationResult = await action({
        params,
        schema: GetUserSchema,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { userId } = params;

    try {
        const [questionStats] = await Question.aggregate([
            { $match: { author: new Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    upvotes: { $sum: "$upvotes" },
                    views: { $sum: "$views" },
                },
            },
        ]);

        const [answerStats] = await Answer.aggregate([
            { $match: { author: new Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    upvotes: { $sum: "$upvotes" },
                },
            },
        ]);

        // Provide default values when stats are undefined
        const defaultQuestionStats = { count: 0, upvotes: 0, views: 0 };
        const defaultAnswerStats = { count: 0, upvotes: 0 };

        const finalQuestionStats = questionStats || defaultQuestionStats;
        const finalAnswerStats = answerStats || defaultAnswerStats;

        const badges = assignBadges({
            criteria: [
                { type: "ANSWER_COUNT", count: finalAnswerStats.count },
                { type: "QUESTION_COUNT", count: finalQuestionStats.count },
                {
                    type: "QUESTION_UPVOTES",
                    count:
                        finalQuestionStats.upvotes + finalAnswerStats.upvotes,
                },
                { type: "TOTAL_VIEWS", count: finalQuestionStats.views },
            ],
        });

        return {
            success: true,
            data: {
                totalQuestions: finalQuestionStats.count,
                totalAnswers: finalAnswerStats.count,
                badges,
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function editUserProfile(
    params: EditUserProfileParams
): Promise<ActionResponse<{ user: User }>> {
    const validationResult = await action({
        params,
        schema: EditUserProfileSchema,
        authorize: true,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { user } = validationResult.session!;

    try {
        const updatedUser = await User.findByIdAndUpdate(user?.id, params, {
            new: true,
        });

        return {
            success: true,
            data: { user: JSON.parse(JSON.stringify(updatedUser)) },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}
