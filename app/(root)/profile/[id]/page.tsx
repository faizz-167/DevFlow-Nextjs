import { auth } from "@/auth";
import ProfileLink from "@/components/user/ProfileLink";
import UserAvatar from "@/components/UserAvatar";
import {
    getUser,
    getUserAnswers,
    getUserQuestions,
    getUserStats,
    getUserTopTags,
} from "@/lib/actions/user.action";
import { notFound } from "next/navigation";
import React from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Stats from "@/components/user/Stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_ANSWERS, EMPTY_QUESTION, EMPTY_TAGS } from "@/constants/states";
import QuestionCard from "@/components/cards/QuestioCard";
import Pagination from "@/components/Pagination";
import AnswerCard from "@/components/cards/AnswerCard";
import TagCard from "@/components/cards/TagCard";
import { Metadata } from "next";
import ROUTES from "@/constants/routes";

export async function generateMetadata({
    params,
}: RouteParams): Promise<Metadata> {
    const { id } = await params;

    const { success, data } = await getUser({ userId: id });
    const { user } = data!;

    if (!success || !user)
        return {
            title: "User not found",
            description: "User not found",
        };

    return {
        title: user.name,
        description: user.bio?.slice(0, 50) || "No bio available",
    };
}

const Profile = async ({ params, searchParams }: RouteParams) => {
    const { id } = await params;
    const { page, pageSize } = await searchParams;
    if (!id) notFound();

    const loggedInUser = await auth();
    const { success, data, error } = await getUser({
        userId: id,
    });

    if (!success)
        return (
            <div className="h1-bold text-dark100_light900">
                {error?.message}
            </div>
        );

    const { user } = data!;
    const {
        success: userQuestionsSuccess,
        data: userQuestionsData,
        error: userQuestionsError,
    } = await getUserQuestions({
        userId: id,
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
    });

    const {
        success: userAnswersSuccess,
        data: userAnswersData,
        error: userAnswersError,
    } = await getUserAnswers({
        userId: id,
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
    });

    const {
        success: userTagsSuccess,
        data: userTagsData,
        error: userTagsError,
    } = await getUserTopTags({
        userId: id,
    });

    const { questions, isNext: hasMoreQuestions } = userQuestionsData!;
    const { answers, isNext: hasMoreAnswers } = userAnswersData!;
    const { tags: userTags } = userTagsData!;

    const {
        _id,
        name,
        image,
        username,
        email,
        bio,
        location,
        portfolio,
        reputation,
        createdAt,
    } = user;
    const { data: userStats } = await getUserStats({ userId: id });
    return (
        <>
            <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
                <div className="flex flex-col items-start gap-4">
                    <UserAvatar
                        id={_id}
                        name={name}
                        imageUrl={image}
                        className="size-[140px] rounded-full object-cover"
                        fallbackClassName="text-6xl font-bolder  tracking-widest"
                    />
                    <div className="mt-3">
                        <h2 className="h2-bold text-dark100_light900">
                            {name}
                        </h2>
                        <p className="paragraph-regular text-dark200_light800">
                            @{username}
                        </p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
                        {portfolio && (
                            <ProfileLink
                                imgUrl="/icons/link.svg"
                                href={portfolio}
                                title="Portfolio"
                            />
                        )}
                        {location && (
                            <ProfileLink
                                imgUrl="/icons/location.svg"
                                title="location"
                            />
                        )}
                        <ProfileLink
                            imgUrl="/icons/calendar.svg"
                            title={dayjs(createdAt).format("MMMM YYYY")}
                        />
                        {bio && (
                            <p className="paragraph-regular text-dark400_light800 mt-8">
                                {bio}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
                    {loggedInUser?.user?.id === id && (
                        <Link href={ROUTES.EDIT_PROFILE(id)}>
                            <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3">
                                Edit Profile
                            </Button>
                        </Link>
                    )}
                </div>
            </section>
            <Stats
                totalQuestions={userStats?.totalQuestions || 0}
                totalAnswers={userStats?.totalAnswers || 0}
                badges={userStats?.badges || { GOLD: 0, SILVER: 0, BRONZE: 0 }}
                reputationPoints={user.reputation || 0}
            />

            <section className="mt-10 flex gap-10">
                <Tabs defaultValue="top-posts" className="flex-[2]">
                    <TabsList className="background-light800_dark400 min-h-[42px] p-1">
                        <TabsTrigger value="top-posts" className="tab">
                            Top-Posts
                        </TabsTrigger>
                        <TabsTrigger value="answers" className="tab">
                            Answers
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="top-posts"
                        className="mt-5 flex w-full flex-col gap-6"
                    >
                        <DataRenderer
                            success={userQuestionsSuccess}
                            error={userQuestionsError}
                            data={questions}
                            empty={EMPTY_QUESTION}
                            render={(questions) => (
                                <div className="flex w-full flex-col gap-6">
                                    {questions.map((question) => (
                                        <QuestionCard
                                            key={question._id}
                                            question={question}
                                            showActionBtns={
                                                loggedInUser?.user?.id ===
                                                question.author._id
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        />
                        <Pagination
                            page={Number(page) || 1}
                            isNext={hasMoreQuestions}
                        />
                    </TabsContent>
                    <TabsContent
                        value="answers"
                        className="mt-5 flex w-full flex-col gap-6"
                    >
                        <DataRenderer
                            success={userAnswersSuccess}
                            error={userAnswersError}
                            data={answers}
                            empty={EMPTY_ANSWERS}
                            render={(answers) => (
                                <div className="flex w-full flex-col gap-10">
                                    {answers.map((answer) => (
                                        <AnswerCard
                                            key={answer._id}
                                            {...answer}
                                            content={answer.content.slice(
                                                0,
                                                27
                                            )}
                                            showReadMore
                                            containerClasses="card-wrapper rounded-[10px] px-7 py-9 sm:px-11"
                                            showActionBtns={
                                                loggedInUser?.user?.id ===
                                                answer.author._id
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        />
                        <Pagination
                            page={Number(page) || 1}
                            isNext={hasMoreAnswers || false}
                        />
                    </TabsContent>
                </Tabs>
                <div className="flex w-full min-w-[250px] flex-col flex-1 max-lg:hidden">
                    <h3 className="h3-bold text-dark200_light900">Top Tech</h3>
                    <div className="mt-7 flex flex-col gap-4">
                        <DataRenderer
                            success={userTagsSuccess}
                            error={userTagsError}
                            data={userTags}
                            empty={EMPTY_TAGS}
                            render={(tags) => (
                                <div className="flex w-full flex-col gap-6">
                                    {tags.map((tag) => (
                                        <TagCard
                                            key={tag._id}
                                            name={tag.name}
                                            _id={tag._id}
                                            questions={tag.count}
                                            showcount
                                        />
                                    ))}
                                </div>
                            )}
                        />
                    </div>
                </div>
            </section>
        </>
    );
};

export default Profile;
