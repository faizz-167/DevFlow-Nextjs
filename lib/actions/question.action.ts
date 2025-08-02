"use server";

import action from "../handlers/action";
import {
    AskQuestionSchema,
    DeleteQuestionSchema,
    EditQuestionSchema,
    GetQuestionSchema,
    IncrementViewsSchema,
    PaginatedSearchParamsSchema,
} from "../validation";
import handleError from "../handlers/error";
import mongoose, { FilterQuery, Types } from "mongoose";
import Tag, { ITagDoc } from "@/database/tag.model";
import TagQuestion, { ITagQuestion } from "@/database/tag-question.model";
import Question, { IQuestionDoc } from "@/database/question.model";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import ROUTES from "@/constants/routes";
import { revalidatePath } from "next/cache";
import dbConnect from "../mongoose";
import { Answer, Collection, Interaction, Vote } from "@/database";
import { after } from "next/server";
import { createInteraction } from "./interaction.action";
import { auth } from "@/auth";

export async function createQuestion(
    params: CreateQuestionParams
): Promise<ActionResponse<Question>> {
    const validationResult = await action({
        params,
        schema: AskQuestionSchema,
        authorize: true,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { title, content, tags } = validationResult.params!;
    const userId = validationResult!.session!.user!.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [question] = await Question.create(
            [
                {
                    title,
                    content,
                    author: userId,
                },
            ],
            { session }
        );
        if (!question) throw new Error("Failed to create question");
        const tagIds: mongoose.Types.ObjectId[] = [];
        const tagQuestionDocuments: ITagQuestion[] = [];

        for (const tag of tags) {
            const exsistingTag = await Tag.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${tag}$`, "i") } },
                { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
                { upsert: true, new: true, session }
            );
            tagIds.push(exsistingTag!._id);
            tagQuestionDocuments.push({
                tag: exsistingTag._id,
                question: question._id,
            });
        }
        await TagQuestion.insertMany(tagQuestionDocuments, { session });
        await Question.findByIdAndUpdate(
            question._id,
            { $push: { tags: { $each: tagIds } } },
            { session }
        );
        after(async () => {
            await createInteraction({
                action: "post",
                actionId: question._id.toString(),
                actionTarget: "question",
                authorId: userId as string,
            });
        });
        await session.commitTransaction();
        return {
            success: true,
            data: JSON.parse(JSON.stringify(question)),
            status: 201,
        };
    } catch (error) {
        await session.abortTransaction();
        return handleError(error) as ErrorResponse;
    } finally {
        session.endSession();
    }
}

export async function editQuestion(
    params: EditQuestionParams
): Promise<ActionResponse<IQuestionDoc>> {
    const validationResult = await action({
        params,
        schema: EditQuestionSchema,
        authorize: true,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { title, content, tags, questionId } = validationResult.params!;
    const userId = validationResult!.session!.user!.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const question = await Question.findById(questionId).populate("tags");
        if (!question) {
            throw new NotFoundError("Question");
        }
        if (question.author.toString() !== userId) {
            throw new Error("unauthorized");
        }

        if (question.title !== title || question.content !== content) {
            question.title = title;
            question.content = content;
            await question.save({ session });
        }

        const TagsToAdd = tags.filter(
            (tag) =>
                !question.tags.some((t: ITagDoc) =>
                    t.name.toLowerCase().includes(tag.toLowerCase())
                )
        );
        const TagsToRemove = question.tags.filter(
            (tag: ITagDoc) =>
                !tags.some(
                    (t: string) => tag.name.toLowerCase() === t.toLowerCase()
                )
        );

        const newTagDocuments: ITagQuestion[] = [];
        if (TagsToAdd.length > 0) {
            for (const tag of TagsToAdd) {
                const existingTag = await Tag.findOneAndUpdate(
                    { name: { $regex: `^${tag}$`, $options: "i" } },
                    { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
                    { upsert: true, new: true, session }
                );
                if (existingTag) {
                    newTagDocuments.push({
                        tag: existingTag._id,
                        question: question._id,
                    });
                    question.tags.push(existingTag._id);
                }
            }
        }
        if (TagsToRemove.length > 0) {
            const tagIdsToRemove = TagsToRemove.map((tag: ITagDoc) => tag._id);
            await Tag.updateMany(
                { _id: { $in: tagIdsToRemove } },
                { $inc: { questions: -1 } },
                { session }
            );
            await TagQuestion.deleteMany(
                {
                    question: questionId,
                    tag: { $in: tagIdsToRemove },
                },
                { session }
            );
            question.tags = question.tags.filter(
                (tag: mongoose.Types.ObjectId) =>
                    !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
                        id.equals(tag._id)
                    )
            );
        }

        if (newTagDocuments.length > 0) {
            await TagQuestion.insertMany(newTagDocuments, { session });
        }
        await question.save({ session });
        await session.commitTransaction();
        return {
            success: true,
            data: JSON.parse(JSON.stringify(question)),
            status: 200,
        };
    } catch (error) {
        await session.abortTransaction();
        return handleError(error) as ErrorResponse;
    } finally {
        await session.endSession();
    }
}

export async function getQuestion(
    params: GetQuestionParams
): Promise<ActionResponse<Question>> {
    const validationResult = await action({
        params,
        schema: GetQuestionSchema,
        authorize: false,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { questionId } = validationResult.params!;

    try {
        const question = await Question.findById(questionId)
            .populate("tags")
            .populate("author", "_id name image");
        if (!question) {
            throw new NotFoundError("Question");
        }
        return {
            success: true,
            data: JSON.parse(JSON.stringify(question)),
            status: 200,
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function getRecommendedQuestions({
    userId,
    query,
    skip,
    limit,
}: RecommendationParams) {
    // Get user's recent interactions
    const interactions = await Interaction.find({
        user: new Types.ObjectId(userId),
        actionType: "question",
        action: { $in: ["view", "upvote", "bookmark", "post"] },
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    const interactedQuestionIds = interactions.map((i) => i.actionId);

    // Get tags from interacted questions
    const interactedQuestions = await Question.find({
        _id: { $in: interactedQuestionIds },
    }).select("tags");

    // Get unique tags
    const allTags = interactedQuestions.flatMap((q) =>
        q.tags.map((tag: Types.ObjectId) => tag.toString())
    );

    // Remove duplicates
    const uniqueTagIds = [...new Set(allTags)];

    const recommendedQuery: FilterQuery<typeof Question> = {
        // exclude interacted questions
        _id: { $nin: interactedQuestionIds },
        // exclude the user's own questions
        author: { $ne: new Types.ObjectId(userId) },
        // include questions with any of the unique tags
        tags: { $in: uniqueTagIds.map((id) => new Types.ObjectId(id)) },
    };

    if (query) {
        recommendedQuery.$or = [
            { title: { $regex: query, $options: "i" } },
            { content: { $regex: query, $options: "i" } },
        ];
    }

    const total = await Question.countDocuments(recommendedQuery);

    const questions = await Question.find(recommendedQuery)
        .populate("tags", "name")
        .populate("author", "name image")
        .sort({ upvotes: -1, views: -1 }) // prioritizing engagement
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        questions: JSON.parse(JSON.stringify(questions)),
        isNextPage: total > skip + questions.length,
    };
}

export async function getQuestions(
    params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNextPage: boolean }>> {
    const validationResult = await action({
        params,
        schema: PaginatedSearchParamsSchema,
        authorize: false,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { page = 1, pageSize = 10, query, filter } = validationResult.params!;
    const skip = (Number(page) - 1) * pageSize;
    const limit = Number(pageSize);

    const filterQuery: FilterQuery<typeof Question> = {};

    if (filter === "recommended") {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return {
                success: true,
                data: { questions: [], isNextPage: false },
            };
        }

        const recommended = await getRecommendedQuestions({
            userId,
            query,
            skip,
            limit,
        });

        return {
            success: true,
            data: recommended,
        };
    }

    if (query) {
        filterQuery.$or = [
            { title: { $regex: new RegExp(query, "i") } },
            { content: { $regex: new RegExp(query, "i") } },
        ];
    }

    let sortCriteria = {};

    switch (filter) {
        case "newest":
            sortCriteria = { createdAt: -1 };
            break;
        case "unanswered":
            filterQuery.answers = 0;
            sortCriteria = { createdAt: -1 };
            break;
        case "popular":
            sortCriteria = { upvotes: -1 };
            break;
        default:
            sortCriteria = { createdAt: -1 };
            break;
    }

    try {
        const totalQuestions = await Question.countDocuments(filterQuery);

        const questions = await Question.find(filterQuery)
            .populate("tags", "name")
            .populate("author", "name image")
            .lean()
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit);

        const isNextPage = totalQuestions > skip + limit;
        return {
            success: true,
            data: {
                questions: JSON.parse(JSON.stringify(questions)),
                isNextPage,
            },
            status: 200,
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function incrementViews(
    params: IncrementViewsParams
): Promise<ActionResponse<{ views: number }>> {
    const validationResult = await action({
        params,
        schema: IncrementViewsSchema,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { questionId } = validationResult.params!;

    try {
        const question = await Question.findById(questionId);

        if (!question) {
            throw new Error("Question not found");
        }

        question.views += 1;

        await question.save();

        revalidatePath(ROUTES.QUESTION(questionId));

        return {
            success: true,
            data: { views: question.views },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function getHotQuestions(): Promise<ActionResponse<Question[]>> {
    try {
        await dbConnect();
        const questions = await Question.find()
            .sort({ views: -1, upvotes: -1 })
            .limit(5);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(questions)),
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function deleteQuestion(
    params: DeleteQuestionParams
): Promise<ActionResponse> {
    const validationResult = await action({
        params,
        schema: DeleteQuestionSchema,
        authorize: true,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { questionId } = validationResult.params!;
    const { user } = validationResult.session!;
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const question = await Question.findById(questionId).session(session);
        if (!question) {
            throw new NotFoundError("Question");
        }
        if (question.author._id.toString() !== user?.id) {
            throw new UnauthorizedError(
                "You are not authorized to delete this question."
            );
        }

        await Collection.deleteMany({ question: questionId }).session(session);
        await TagQuestion.deleteMany({ question: questionId }).session(session);
        if (question.tags.length > 0) {
            await Tag.updateMany(
                { _id: { $in: question.tags } },
                { $inc: { questions: -1 } },
                { session }
            );
        }
        await Vote.deleteMany({
            actionId: questionId,
            actionType: "question",
        }).session(session);

        const answers = await Answer.find({ question: questionId }).session(
            session
        );

        if (answers.length > 0) {
            await Answer.deleteMany({ question: questionId }).session(session);

            await Vote.deleteMany({
                actionId: { $in: answers.map((answer) => answer.id) },
                actionType: "answer",
            }).session(session);
        }

        await Question.findByIdAndDelete(questionId).session(session);
        after(async () => {
            await createInteraction({
                action: "delete",
                actionId: question._id.toString(),
                actionTarget: "question",
                authorId: user?.id as string,
            });
        });
        await session.commitTransaction();
        revalidatePath(ROUTES.PROFILE(user?.id as string));

        return { success: true };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    } finally {
        await session.endSession();
    }
}
