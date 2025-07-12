"use server";

import action from "../handlers/action";
import {
    AskQuestionSchema,
    EditQuestionSchema,
    GetQuestionSchema,
} from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { ITagDoc, Tag } from "@/database/tag.model";
import { ITagQuestion, TagQuestion } from "@/database/tag-question.model";
import { Question } from "@/database/question.model";
import { NotFoundError } from "../http-errors";

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
): Promise<ActionResponse<Question>> {
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
            (tag) => !question.tags.includes(tag.toLowerCase())
        );
        const TagsToRemove = question.tags.filter(
            (tag: ITagDoc) => !tags.includes(tag.name.toLowerCase())
        );

        const newTagDocuments: ITagQuestion[] = [];
        if (TagsToAdd.length > 0) {
            for (const tag of TagsToAdd) {
                const existingTag = await Tag.findOneAndUpdate(
                    { name: { $regex: new RegExp(`^${tag}$`, "i") } },
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
                (tag: mongoose.Types.ObjectId) => !tagIdsToRemove.includes(tag)
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
        authorize: true,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { questionId } = validationResult.params!;

    try {
        const question = await Question.findById(questionId).populate("tags");
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
