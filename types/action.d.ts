interface SignInWithOAuthParams {
    provider: "github" | "google";
    providerAccountId: string;
    user: {
        email: string;
        name: string;
        image?: string;
        username: string;
    };
}

interface SignUpWithCredentialsParams {
    name: string;
    username: string;
    email: string;
    password: string;
}

interface CreateQuestionParams {
    title: string;
    content: string;
    tags: string[];
}

interface EditQuestionParams extends CreateQuestionParams {
    questionId: string;
}

interface GetQuestionParams {
    questionId: string;
}

interface GetTagQuestionParams extends Omit<PaginatedSearchParams, "filter"> {
    tagId: string;
}

interface IncrementViewsParams {
    questionId: string;
}

interface CreateAnswerParams {
    questionId: string;
    content: string;
}

interface GetAnswerParams extends PaginatedSearchParams {
    questionId: string;
}