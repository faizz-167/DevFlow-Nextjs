"use client";

import { toggleSaveQuestion } from "@/lib/actions/collections.action";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useState } from "react";
import { toast } from "sonner";

const SavedQuestions = ({
    questionId,
    hasSavedQuestionPromise,
}: {
    questionId: string;
    hasSavedQuestionPromise: Promise<ActionResponse<{ saved: boolean }>>;
}) => {
    const session = useSession();
    const userId = session.data?.user?.id;
    const { data } = use(hasSavedQuestionPromise);
    const { saved: hasSaved } = data || {};
    const handleSave = async () => {
        if (isLoading) return;
        if (!userId)
            return toast.error("You must be logged in to save questions.");
        setIsLoading(true);

        try {
            const { success, data, error } = await toggleSaveQuestion({
                questionId,
            });

            if (!success) {
                throw new Error(
                    error?.message ||
                        "An error occurred while saving the question."
                );
            }

            toast(
                !hasSaved
                    ? "Question saved successfully."
                    : "Question removed from saved questions."
            );
        } catch (error) {
            return toast.error("Error", {
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred while saving the question.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    return (
        <Image
            src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
            alt="star"
            width={18}
            height={18}
            className={`cursor-pointer ${isLoading && "opacity-50"}`}
            aria-label="Save Question"
            onClick={handleSave}
        />
    );
};

export default SavedQuestions;
