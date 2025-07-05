"use client";
import { AskQuestionSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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

const QuestionForm = () => {
    const form = useForm({
        resolver: zodResolver(AskQuestionSchema),
        defaultValues: {
            title: "",
            content: "",
            tags: [],
        },
    });

    const handleCreateQuestion = () => {};
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
                            <FormControl>Editor</FormControl>
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
                                        required
                                        {...field}
                                        className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                        placeholder="Add tags"
                                    />
                                    Tags
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
                        className="w-fit bg-primary-500 !text-light-900"
                    >
                        Ask Question
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default QuestionForm;
