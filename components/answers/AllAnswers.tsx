import React from "react";
import DataRenderer from "../DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import AnswerCard from "../cards/AnswerCard";

interface Props extends ActionResponse<Answer[]> {
    totalAnswers: number;
}

const AllAnswers = ({ data, success, error, totalAnswers }: Props) => {
    return (
        <div className="mt-11">
            <div className="flex items-center justify-between">
                <h3 className="primary-text-gradient">
                    {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
                </h3>
                <p>Filter</p>
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
        </div>
    );
};

export default AllAnswers;
