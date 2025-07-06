import Image from "next/image";
import Link from "next/link";
import React from "react";
import TagCard from "../cards/TagCard";

const hotQuestions = [
    { _id: "1", title: "What is the best way to learn React?" },
    { _id: "2", title: "How do I optimize my website for SEO?" },
    { _id: "3", title: "What are the latest trends in web development?" },
    { _id: "4", title: "How can I improve my coding skills?" },
    { _id: "5", title: "What are the best practices for responsive design?" },
];

const popularTags = [
    { _id: "1", name: "react", questions: 120 },
    { _id: "2", name: "javaScript", questions: 95 },
    { _id: "3", name: "CSS", questions: 80 },
    { _id: "4", name: "HTML", questions: 70 },
    { _id: "5", name: "nextjs", questions: 60 },
];

const RightSideBar = () => {
    return (
        <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 max-xl:hidden shadow-light-300 dark:shadow-none">
            <div>
                <h3 className="h3-bold text-dark200_light800">Top Questions</h3>
                <div className="mt-7 w-full flex flex-col gap-[30px]">
                    {hotQuestions.map(({ _id, title }) => (
                        <Link
                            href={`/question/${_id}`}
                            key={_id}
                            className="flex cursor-pointer items-center justify-between gap-7"
                        >
                            <p className="body-medium text-dark500_light700">
                                {title}
                            </p>
                            <Image
                                src="/icons/chevron-right.svg"
                                alt="chevron-right"
                                width={20}
                                height={20}
                                className="invert-colors"
                            />
                        </Link>
                    ))}
                </div>
            </div>
            <div className="mt-16">
                <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
                <div className="mt-7 flex flex-col gap-4">
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
            </div>
        </section>
    );
};

export default RightSideBar;
