import QuestionForm from "@/components/forms/QuestionForm";
import React from "react";

const AskAQuestion = () => {
    return (
        <>
            <h1 className="h1-bold text-dark100_light900">Ask A Question</h1>
            <div className="mt-9">
                <QuestionForm />
            </div>
        </>
    );
};

export default AskAQuestion;
