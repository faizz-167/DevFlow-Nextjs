"use client";
import { incrementViews } from "@/lib/actions/question.action";
import { useEffect } from "react";
import { toast } from "sonner";

const View = ({ questionId }: { questionId: string }) => {
    const handleIncrementViews = async () => {
        const result = await incrementViews({ questionId });
        if (result.success) {
            toast.success("Views incremented successfully.");
        } else {
            toast.error("Failed to increment views.", {
                description: result.error?.message,
            });
        }
    };
    useEffect(() => {
        handleIncrementViews();
    }, []);
    return null;
};

export default View;
