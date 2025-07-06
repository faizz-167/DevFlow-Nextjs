import ROUTES from "@/constants/routes";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import { getDeviconClassName } from "@/lib/utils";
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
}: Props) => {
    const iconClass = getDeviconClassName(name);
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

    return isButton ? (
        <button
            type="button"
            className="justify-between flex gap-2"
        >
            {content}
        </button>
    ) : (
        <Link href={ROUTES.TAGS(_id)} className="flex justify-between gap-2">
            {content}
        </Link>
    );
};

export default TagCard;
