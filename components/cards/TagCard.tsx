import ROUTES from "@/constants/routes";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import { getDeviconClassName } from "@/lib/utils";

interface Props {
    _id: string;
    name: string;
    questions: number;
    showcount?: boolean;
    compact?: boolean;
}

const TagCard = ({ _id, name, questions, showcount, compact }: Props) => {
    const iconClass = getDeviconClassName(name);
    return (
        <Link href={ROUTES.TAGS(_id)} className="flex justify-between gap-2">
            <Badge className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
                <div className="flex items-center space-x-2">
                    <i className={`${iconClass} text-sm`} />
                    <span>{name}</span>
                </div>
            </Badge>
            {showcount && (
                <p className="smalll-medium text-dark500_light700">
                    {questions}
                </p>
            )}
        </Link>
    );
};

export default TagCard;
