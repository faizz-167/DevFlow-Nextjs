import Image from "next/image";
import Link from "next/link";
import React from "react";
import TagCard from "../cards/TagCard";
import { getHotQuestions } from "@/lib/actions/question.action";
import DataRenderer from "../DataRenderer";
import { EMPTY_HOT_QUESTION } from "@/constants/states";
import { title } from "process";
import ROUTES from "@/constants/routes";
import { getTopTags } from "@/lib/actions/tag.action";

const RightSideBar = async () => {
    const [
        { success, data: hotQuestions, error },
        { success: tagSuccess, data: popularTags, error: tagError },
    ] = await Promise.all([getHotQuestions(), getTopTags()]);

    return (
        <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 max-xl:hidden shadow-light-300 dark:shadow-none">
            <div>
                <h3 className="h3-bold text-dark200_light800">Hot Questions</h3>
                <div className="mt-7 w-full flex flex-col gap-[30px]">
                    <DataRenderer
                        success={success}
                        error={error}
                        data={hotQuestions}
                        empty={EMPTY_HOT_QUESTION}
                        render={(hotQuestions) => (
                            <div className="mt-7 flex flex-col gap-[30px]">
                                {hotQuestions.map((question) => (
                                    <Link
                                        href={ROUTES.QUESTION(question._id)}
                                        key={question._id}
                                        className="flex cursor-pointer items-center justify-between gap-7"
                                    >
                                        <Image
                                            src="/icons/hot-question-blue.svg"
                                            alt="chevron-right"
                                            width={20}
                                            height={20}
                                            className="invert-colors"
                                        />
                                        <p className="body-medium flex-1 text-dark500_light700 line-clamp-2">
                                            {question.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </div>
            <div className="mt-16">
                <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
                <div className="mt-7 flex flex-col gap-4">
                    <DataRenderer
                        success={tagSuccess}
                        error={tagError}
                        data={popularTags}
                        empty={EMPTY_HOT_QUESTION}
                        render={(popularTags) => (
                            <div className="flex flex-col gap-4">
                                {popularTags.map(({ _id, name, questions }) => (
                                    <TagCard
                                        key={_id}
                                        _id={_id}
                                        name={name}
                                        questions={questions}
                                        showcount
                                    />
                                ))}
                            </div>
                        )}
                    />
                </div>
            </div>
        </section>
    );
};

export default RightSideBar;
