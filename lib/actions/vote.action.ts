"use server";

import { Answer, Question, Vote } from "@/database";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import {
    CreateVoteSchema,
    hasVotedSchema,
    UpdateVoteCountSchema,
} from "../validation";
import mongoose, { ClientSession } from "mongoose";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function updateVoteCount(
    params: UpdateVoteCountParams,
    session?: ClientSession
): Promise<ActionResponse> {
    const validationResult = await action({
        params,
        schema: UpdateVoteCountSchema,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { targetId, targetType, voteType, change } = validationResult.params!;
    const Model = targetType === "question" ? Question : Answer;
    const voteField = voteType === "upvote" ? "upvotes" : "downvotes";
    try {
        const result = await Model.findOneAndUpdate(
            { _id: targetId },
            { $inc: { [voteField]: change } },
            { new: true, session }
        );
        if (!result) {
            return handleError(new NotFoundError("Target")) as ErrorResponse;
        }
        return {
            success: true,
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}

export async function createVote(
    params: CreateVoteParams
): Promise<ActionResponse> {
    const validationResult = await action({
        params,
        schema: CreateVoteSchema,
        authorize: true,
    });

    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }
    const { voteType, targetId, targetType } = validationResult.params!;
    const userId = validationResult?.session?.user?.id;
    if (!userId) {
        return handleError(new UnauthorizedError()) as ErrorResponse;
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const exsistingVote = await Vote.findOne({
            author: userId,
            actionId: targetId,
            actionType: targetType,
        }).session(session);
        if (exsistingVote) {
            if (exsistingVote.voteType === voteType) {
                // Remove the vote
                await Vote.deleteOne({
                    _id: exsistingVote._id,
                }).session(session);
                await updateVoteCount(
                    {
                        targetId,
                        targetType,
                        voteType,
                        change: -1,
                    },
                    session
                );
            } else {
                await Vote.findByIdAndUpdate(
                    exsistingVote._id,
                    { voteType },
                    { new: true, session }
                );
                await updateVoteCount(
                    {
                        targetId,
                        targetType,
                        voteType: exsistingVote.voteType, // This should decrement the old vote
                        change: -1, // Change this to -1
                    },
                    session
                );
                await updateVoteCount(
                    {
                        targetId,
                        targetType,
                        voteType, // This should increment the new vote
                        change: 1,
                    },
                    session
                );
            }
        } else {
            await Vote.create(
                [
                    {
                        author: userId,
                        actionId: targetId,
                        actionType: targetType,
                        voteType,
                    },
                ],
                {
                    session,
                }
            );
            await updateVoteCount(
                { targetId, targetType, voteType, change: 1 },
                session
            );
        }
        await session.commitTransaction();
        revalidatePath(ROUTES.QUESTION(targetId));
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        return handleError(error) as ErrorResponse;
    } finally {
        await session.endSession();
    }
}

export async function hasVoted(
    params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
    const validationResult = await action({
        params,
        schema: hasVotedSchema,
        authorize: true,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }
    const { targetId, targetType } = validationResult.params!;
    const userId = validationResult?.session?.user?.id;
    try {
        const vote = await Vote.findOne({
            author: userId,
            actionId: targetId,
            actionType: targetType,
        });
        if (!vote) {
            return {
                success: true,
                data: { hasUpVoted: false, hasDownVoted: false },
            };
        }
        return {
            success: true,
            data: {
                hasUpVoted: vote.voteType === "upvote",
                hasDownVoted: vote.voteType === "downvote",
            },
        };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}
