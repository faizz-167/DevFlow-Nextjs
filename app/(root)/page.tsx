import QuestioCard from "@/components/cards/QuestioCard";
import DataRenderer from "@/components/DataRenderer";
import HomeFilter from "@/components/filter/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getQuestions } from "@/lib/actions/question.action";
import Link from "next/link";

// const test = async () => {
//     try {
//         return await api.users.getAll();
//     } catch (error) {
//         return handleError(error);
//     }
// };

interface SearchParams {
    searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
    // const users = await test();
    // console.log(users);
    const { page, pageSize, query, filter } = await searchParams;
    const { success, data, error } = await getQuestions({
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        query: query || "",
        filter: filter || "",
    });
    const { questions } = data || {};
    // const filteredQuestions = questions.filter((question) => {
    //     const matchesQuery = question.title
    //         .toLowerCase()
    //         .includes(query?.toLowerCase());

    //     const matchesFilter = filter
    //         ? question.tags.some(
    //               (tag) => tag.name.toLowerCase() === filter.toLowerCase()
    //           )
    //         : true;
    //     return matchesQuery && matchesFilter;
    // });

    //const {data} = await axios.get("/api/questions", {query: {search: query}});  -- fetch from data base

    return (
        <>
            <section className="flex flex-col-reverse w-full sm:flex-row justify-between gap-4 sm:items-center">
                <h1 className="h1-bold text-dark100_light900">All Questions</h1>
                <Button
                    className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
                    asChild
                >
                    <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
                </Button>
            </section>
            <section className="mt-11">
                <LocalSearch
                    route="/"
                    imgSrc="/icons/search.svg"
                    placeholder="Search..."
                    otherClasses="flex-1"
                />
            </section>
            <HomeFilter />
            <DataRenderer
                success={success}
                error={error}
                data={questions}
                empty={EMPTY_QUESTION}
                render={(questions) => (
                    <div className="mt-10 flex w-full flex-col gap-6">
                        {questions.map((q) => (
                            <QuestioCard key={q._id} question={q} />
                        ))}
                    </div>
                )}
            />
            {/* {success ? (
                <div className="mt-10 flex w-full flex-col gap-6">
                    {questions.length > 0 ? (
                        questions.map((q) => <QuestioCard key={q._id} question={q} />)
                    )
                     : (
                        <div className="mt-10 flex w-full items-center justify-center">
                            <p className="body-medium text-dark400_light700">
                                No questions found
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-10 flex w-full items-center justify-center">
                    <p className="body-medium text-dark400_light700">
                        {error?.message ||
                            "An error occurred while fetching questions."}
                    </p>
                </div>
            )} */}
        </>
    );
};

export default Home;
