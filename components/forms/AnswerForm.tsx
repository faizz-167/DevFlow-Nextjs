"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { AnswerSchema } from "@/lib/validation";
import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

const Editor = dynamic(() => import("@/components/editor"), {
    // Make sure we turn SSR off
    ssr: false,
});

const AnswerForm = ({
    questionId,
    questionTitle,
    questionContent,
}: {
    questionId: string;
    questionTitle: string;
    questionContent: string;
}) => {
    const [isAnswer, startAnsweringTransition] = useTransition();
    const [isAiSubmitting, setIsAiSubmitting] = useState(false);
    const session = useSession();
    const editorRef = useRef<MDXEditorMethods>(null);
    const form = useForm<z.infer<typeof AnswerSchema>>({
        resolver: zodResolver(AnswerSchema),
        defaultValues: {
            content: "",
        },
    });

    const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
        startAnsweringTransition(async () => {
            const result = await createAnswer({
                content: values.content,
                questionId,
            });
            if (result.success) {
                form.reset();
                toast.success("Success", {
                    description: "Your answer has been posted successfully.",
                });
                if (editorRef.current) {
                    editorRef.current.setMarkdown("");
                }
            } else {
                toast.error("Error", {
                    description:
                        result.error?.message || "Failed to post your answer.",
                });
            }
        });
    };

    const generateAIAnswer = async () => {
        if (session.status !== "authenticated") {
            return toast("Please Log in", {
                description: "You must be logged in to use AI features.",
            });
        }
        setIsAiSubmitting(true);
        const userAnswer = editorRef.current?.getMarkdown();
        try {
            const { success, data, error } = await api.ai.getAnswer(questionTitle, questionContent, userAnswer);
            if (!success){
                return toast.error("Error", {
                    description: error?.message || "Failed to generate AI answer.",
                });
            }

            const formattedAnswer = data.replace(/<br>/g," ").toString().trim();
            if (editorRef.current) {
                editorRef.current.setMarkdown(formattedAnswer);
                form.setValue("content", formattedAnswer);
                form.trigger("content");
            }
            toast.success("Success", {
                description: "AI answer generated successfully.",
            });
        } catch (error) {
            toast.error("Error", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate AI answer.",
            });
        } finally {
            setIsAiSubmitting(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <h4 className="paragraph-semibold text-dark400_light800">
                    Write Your Answer Here
                </h4>
                <Button
                    className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
                    disabled={isAiSubmitting}
                    onClick={generateAIAnswer}
                >
                    {isAiSubmitting ? (
                        <>
                            {" "}
                            <Loader2 className="mr-2 animate-spin" />{" "}
                            Generating...
                        </>
                    ) : (
                        <>
                            <Image
                                src="/icons/stars.svg"
                                alt="AI Icon"
                                width={16}
                                height={16}
                                className="object-contain"
                            />
                            Generate with AI
                        </>
                    )}
                </Button>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="mt-6 flex w-full flex-col gap-10"
                >
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col gap-3">
                                <FormControl>
                                    <Editor
                                        value={field.value}
                                        fieldChange={field.onChange}
                                        editorRef={editorRef}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="w-fit primary-gradient"
                        >
                            {isAnswer ? (
                                <>
                                    {" "}
                                    <Loader2 className="mr-2 animate-spin" />{" "}
                                    Posting...
                                </>
                            ) : (
                                "Post Answer"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default AnswerForm;
