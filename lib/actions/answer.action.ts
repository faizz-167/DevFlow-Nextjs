"use server";

import Answer, { IAnswerDoc } from "@/database/answer.model";
import action from "../handlers/action";
import { CreateAnswerSchema, GetAnswerSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { Question } from "@/database";
import { NotFoundError } from "../http-errors";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function createAnswer(
    params: CreateAnswerParams
): Promise<ActionResponse<IAnswerDoc>> {
    const validationResult = await action({
        params,
        schema: CreateAnswerSchema,
        authorize: true,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { content, questionId } = validationResult.params!;
    const userId = validationResult?.session?.user?.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            throw new NotFoundError("Question");
        }
        const [newAnswer] = await Answer.create(
            [
                {
                    author: userId,
                    question: questionId,
                    content,
                },
            ],
            { session }
        );

        if (!newAnswer) throw new Error("Failed to create answer");

        question.answers += 1;
        await question.save({ session });
        await session.commitTransaction();
        revalidatePath(ROUTES.QUESTION(questionId));

        return {
            success: true,
            data: JSON.parse(JSON.stringify(newAnswer)),
        };
    } catch (error) {
        await session.abortTransaction();
        return handleError(error) as ErrorResponse;
    } finally {
        await session.endSession();
    }
}

export async function getAnswers(params: GetAnswerParams): Promise<
    ActionResponse<{
        answers: Answer[];
        isNext: boolean;
        totalAnswers: number;
    }>
> {
    const validationResult = await action({
        params,
        schema: GetAnswerSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }
    const {
        questionId,
        page = 1,
        pageSize = 10,
        filter,
    } = validationResult.params!;
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    let sortCriteria = {};
    switch (filter) {
        case "latest":
            sortCriteria = { createdAt: -1 };
            break;
        case "oldest":
            sortCriteria = { createdAt: 1 };
            break;
        case "popular":
            sortCriteria = { upvotes: -1 };
            break;
        default:
            sortCriteria = { upvotes: -1, createdAt: -1 };
            break;
    }

    try {
        const totalAnswers = await Answer.countDocuments({
            question: questionId,
        });
        const answers = await Answer.find({ question: questionId })
            .populate("author", "_id name image")
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit);
        const isNext = totalAnswers > page + answers.length;
        return {
            success: true,
            data: {
                answers: JSON.parse(JSON.stringify(answers)),
                isNext,
                totalAnswers,
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}
