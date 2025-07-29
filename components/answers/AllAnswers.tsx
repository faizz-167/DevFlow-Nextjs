import React from "react";
import DataRenderer from "../DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import AnswerCard from "../cards/AnswerCard";
import CommonFilter from "../filter/CommonFilter";
import { AnswerFilters } from "@/constants/filters";
import Pagination from "../Pagination";

interface Props extends ActionResponse<Answer[]> {
    totalAnswers: number;
    page: number;
    isNext: boolean;
}

const AllAnswers = ({
    data,
    success,
    error,
    totalAnswers,
    page,
    isNext,
}: Props) => {
    return (
        <div className="mt-11">
            <div className="flex items-center justify-between">
                <h3 className="primary-text-gradient">
                    {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
                </h3>
                <CommonFilter
                    filters={AnswerFilters}
                    otherClasses="sm:min-w-32"
                    containerClasses="max-xs:w-full"
                />
            </div>
            <DataRenderer
                success={success}
                error={error}
                data={data}
                empty={EMPTY_ANSWERS}
                render={(answers) =>
                    answers.map((ans) => <AnswerCard key={ans._id} {...ans} />)
                }
            />
            <Pagination page={page} isNext={isNext || false} />
        </div>
    );
};

export default AllAnswers;
