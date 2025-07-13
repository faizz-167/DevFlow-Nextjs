import ROUTES from "@/constants/routes";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import { cn, getDeviconClassName, getTechDescription } from "@/lib/utils";
import Image from "next/image";

interface Props {
    _id: string;
    name: string;
    questions?: number;
    showcount?: boolean;
    compact?: boolean;
    remove?: boolean;
    isButton?: boolean;
    handleRemove?: () => void;
    breif?: boolean;
}

const TagCard = ({
    _id,
    name,
    questions,
    showcount,
    compact,
    remove,
    isButton,
    handleRemove,
    breif,
}: Props) => {
    const iconClass = getDeviconClassName(name);
    const iconDesc = getTechDescription(name);
    const content = (
        <>
            <Badge className="subtle-medium background-light800_dark300 flex flex-row gap-2 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
                <div className="flex items-center space-x-2">
                    {!compact ? <i className={`${iconClass} text-sm`} /> : ""}
                    <span>{name}</span>
                </div>
                {remove && (
                    <Image
                        src="/icons/close.svg"
                        alt="remove tag"
                        width={12}
                        height={12}
                        className="cursor-pointer object-contain invert-0 dark:invert"
                        onClick={handleRemove}
                    />
                )}
            </Badge>
            {showcount && (
                <p className="smalll-medium text-dark500_light700">
                    {questions}
                </p>
            )}
        </>
    );

    if (!breif) {
        return isButton ? (
            <button type="button" className="justify-between flex gap-2">
                {content}
            </button>
        ) : (
            <Link href={ROUTES.TAG(_id)} className="flex justify-between gap-2">
                {content}
            </Link>
        );
    }
    return (
        <Link href={ROUTES.TAG(_id)} className="shadow-light100_darknone ">
            <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[260px]">
                <div className="flex items-center justify-between gap-3">
                    <div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
                        <p className="paragraph-semibold text-dark300_light900">
                            {name}
                        </p>
                    </div>
                    <i
                        className={cn(iconClass, "text-2xl")}
                        aria-hidden="true"
                    />
                </div>

                <p className="small-medium text-dark500_light700 mt-5 line-clamp-3 w-full">
                    {iconDesc}
                </p>

                <p className="small-medium text-dark400_light500 mt-3.5">
                    <span className="body-semibold primary-text-gradient mr-2.5">
                        {questions}+
                    </span>
                    Questions
                </p>
            </article>
        </Link>
    );
};

export default TagCard;
