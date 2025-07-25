"use client";
import { AskQuestionSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import TagCard from "../cards/TagCard";
import { z } from "zod";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import { Loader2 } from "lucide-react";

const Editor = dynamic(() => import("@/components/editor"), {
    // Make sure we turn SSR off
    ssr: false,
});

interface Props {
    question?: Question;
    isEdit?: boolean;
}

const QuestionForm = ({ question, isEdit = false }: Props) => {
    const router = useRouter();
    const editorRef = useRef<MDXEditorMethods>(null);
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof AskQuestionSchema>>({
        resolver: zodResolver(AskQuestionSchema),
        defaultValues: {
            title: question?.title || "",
            content: question?.content || "",
            tags: question?.tags?.map((tag) => tag.name) || [],
        },
    });

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        field: { value: string[] }
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const tagInput = e.currentTarget.value.trim();
            if (
                tagInput &&
                tagInput.length < 15 &&
                !field.value.includes(tagInput)
            ) {
                form.setValue("tags", [...field.value, tagInput]);
                e.currentTarget.value = "";
                form.clearErrors("tags");
            } else if (tagInput.length >= 15) {
                form.setError("tags", {
                    type: "manual",
                    message: "Tag must be less than 15 characters.",
                });
            } else if (field.value.includes(tagInput)) {
                form.setError("tags", {
                    type: "manual",
                    message: "Tag already exists.",
                });
            }
        }
    };

    const handleRemoveTag = (tag: string, field: { value: string[] }) => {
        const updatedTags = field.value.filter((t) => t !== tag);
        form.setValue("tags", updatedTags);
        if (updatedTags.length === 0) {
            form.setError("tags", {
                type: "manual",
                message: "At least one tag is required.",
            });
        }
    };

    const handleCreateQuestion = async (
        data: z.infer<typeof AskQuestionSchema>
    ) => {
        startTransition(async () => {
            if (isEdit && question?._id) {
                const result = await editQuestion({
                    questionId: question._id,
                    ...data,
                });

                if (result.success) {
                    toast.success("Question updated successfully!");
                    if (result.data)
                        router.push(ROUTES.QUESTION(result.data._id as string));
                } else {
                    toast.error(`Error: ${result.status}`, {
                        description:
                            result.error?.message ||
                            "Failed to update question.",
                    });
                }
                return;
            }

            const result = await createQuestion(data);

            if (result.success) {
                toast.success("Question created successfully!");
                if (result.data) router.push(ROUTES.QUESTION(result.data._id));
            } else {
                toast.error(`Error: ${result.status}`, {
                    description:
                        result.error?.message || "Failed to create question.",
                });
            }
        });
    };
    return (
        <Form {...form}>
            <form
                className="flex w-full flex-col gap-10"
                onSubmit={form.handleSubmit(handleCreateQuestion)}
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Question Title{" "}
                                <span className="text-primary-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    required
                                    {...field}
                                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                />
                            </FormControl>
                            <FormDescription className="body-regular text-light-500 mt-2.5">
                                Be Specific and imagine You&apos;re asking a
                                question to another person.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Detailed Explaination of Your Problem{" "}
                                <span className="text-primary-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Editor
                                    value={field.value}
                                    editorRef={editorRef}
                                    fieldChange={field.onChange}
                                />
                            </FormControl>
                            <FormDescription className="body-regular text-light-500 mt-2.5">
                                Provide as much detail as possible, including
                                code snippets, error messages, and any other
                                relevant information.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-3">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Tags <span className="text-primary-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <div>
                                    <Input
                                        className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                        placeholder="Add tags"
                                        onKeyDown={(e) =>
                                            handleInputKeyDown(e, field)
                                        }
                                    />
                                    {field.value.length > 0 && (
                                        <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                                            {field?.value?.map(
                                                (tag: string) => (
                                                    <TagCard
                                                        key={tag}
                                                        _id={tag}
                                                        name={tag}
                                                        compact
                                                        isButton
                                                        remove
                                                        handleRemove={() => {
                                                            handleRemoveTag(
                                                                tag,
                                                                field
                                                            );
                                                        }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription className="body-regular text-light-500 mt-2.5">
                                Add up to 3 tags to categorize your question.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="mt-16 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-fit bg-primary-500 !text-light-900"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" />
                                <span>submitting</span>
                            </>
                        ) : (
                            <>{isEdit ? "Update Question" : "Ask a Question"}</>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default QuestionForm;
