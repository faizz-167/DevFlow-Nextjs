"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ROUTES from "@/constants/routes";
import { editUserProfile } from "@/lib/actions/user.action";
import { ProfileSchema } from "@/lib/validation";

type EditProfileFormProps = {
    user: User;
};

const EditProfileForm = ({ user }: EditProfileFormProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ProfileSchema>>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: user.name || "",
            username: user.username || "",
            portfolio: user.portfolio || "",
            location: user.location || "",
            bio: user.bio || "",
        },
    });

    const handleEditProfile = async (data: z.infer<typeof ProfileSchema>) => {
        startTransition(async () => {
            const result = await editUserProfile({
                ...data,
            });

            if (result.success) {
                toast.success("Profile updated successfully!");
                if (result.data) router.push(ROUTES.PROFILE(user._id));
            } else {
                toast.error(`Error: ${result.status}`, {
                    description:
                        result.error?.message || "Failed to update profile.",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form
                className="flex w-full flex-col gap-10"
                onSubmit={form.handleSubmit(handleEditProfile)}
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Full Name{" "}
                                <span className="text-primary-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    required
                                    {...field}
                                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Username{" "}
                                <span className="text-primary-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    required
                                    {...field}
                                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Portfolio{" "}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Location{" "}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="text-dark400_light700 paragraph-semibold">
                                Bio{" "}
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    rows={5}
                                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] rounded-1.5 border"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="mt-16 flex justify-end">
                    <Button
                        type="submit"
                        className="primary-gradient w-fit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>Submit</>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default EditProfileForm;
