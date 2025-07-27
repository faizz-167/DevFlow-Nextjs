"use client";
import { createVote } from "@/lib/actions/vote.action";
import { formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { use, useState } from "react";
import { toast } from "sonner";

interface Props {
    upvotes: number;
    downvotes: number;
    targetId: string;
    targetType: "question" | "answer";
    hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
}

const Votes = ({
    upvotes,
    downvotes,
    targetId,
    targetType,
    hasVotedPromise,
}: Props) => {
    const { success, data } = use(hasVotedPromise);
    const [isLoading, setIsLoading] = useState(false);
    const { hasUpVoted, hasDownVoted } = data || {};
    const session = useSession();
    const userId = session.data?.user?.id;

    const handleVote = async (voteType: "upvote" | "downvote") => {
        if (!userId) return toast.error("You must be logged in to vote.");
        setIsLoading(true);
        try {
            const result = await createVote({ voteType, targetId, targetType });
            if (!result.success) {
                return toast.error("Failed to vote", {
                    description:
                        result.error?.message || "Please try again later.",
                });
            }
            const successMsg =
                voteType === "upvote"
                    ? `Upvote ${!hasUpVoted ? "added" : "removed"} Successfully`
                    : `Downvote ${!hasDownVoted ? "added" : "removed"} Successfully`;

            toast.success(successMsg, {
                description: "Your vote has been recorded.",
            });
        } catch (error) {
            toast.error("Error", {
                description: "Failed to vote. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex-center gap-2.5">
            <div className="flex-center gap-1.5">
                <Image
                    src={
                        success && hasUpVoted
                            ? "/icons/upvoted.svg"
                            : "/icons/upvote.svg"
                    }
                    alt="upvote"
                    width={18}
                    height={18}
                    className={`cursor-pointer ${isLoading && "opacity-50"} `}
                    aria-label="upvote"
                    onClick={() => !isLoading && handleVote("upvote")}
                />
                <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
                    <p className="subtle-medium text-dark400_light900">
                        {formatNumber(upvotes)}
                    </p>
                </div>
            </div>
            <div className="flex-center gap-1.5">
                <Image
                    src={
                        success && hasDownVoted
                            ? "/icons/downvoted.svg"
                            : "/icons/downvote.svg"
                    }
                    alt="downvote"
                    width={18}
                    height={18}
                    className={`cursor-pointer ${isLoading && "opacity-50"} `}
                    aria-label="downvote"
                    onClick={() => !isLoading && handleVote("downvote")}
                />
                <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
                    <p className="subtle-medium text-dark400_light900">
                        {formatNumber(downvotes)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Votes;
