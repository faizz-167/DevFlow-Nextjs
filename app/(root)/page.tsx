import { auth, signOut } from "@/auth";
import QuestioCard from "@/components/cards/QuestioCard";
import HomeFilter from "@/components/filter/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";

const questions = [
    {
        _id: "1",
        title: "What is Next.js?",
        description:
            "Next.js is a React framework for building server-side rendered applications.",
        tags: [
            { _id: "1", name: "react" },
            { _id: "2", name: "nextjs" },
        ],
        author: { _id: "1", name: "John Doe", image: "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg" },
        upvotes: 10,
        answers: 5,
        views: 100,
        createdAt: new Date(),
    },
    {
        _id: "2",
        title: "How to use React Hooks?",
        description:
            "React Hooks are functions that let you use state and other React features without writing a class.",
        tags: [
            { _id: "3", name: "react" },
            { _id: "4", name: "hooks" },
        ],
        author: { _id: "2", name: "Jane Doe", image: "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg" },
        upvotes: 5,
        answers: 3,
        views: 50,
        createdAt: new Date("2023-11-01"),
    },
    {
        _id: "3",
        title: "What is TypeScript?",
        description:
            "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
        tags: [
            { _id: "5", name: "typescript" },
            { _id: "6", name: "javascript" },
        ],
        author: { _id: "3", name: "Bob Smith", image: "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg" },
        upvotes: 8,
        answers: 2,
        views: 75,
        createdAt: new Date(),
    },
];

interface SearchParams {
    searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
    const { query = "", filter } = await searchParams;
    const filteredQuestions = questions.filter((question) => {
        const matchesQuery = question.title
            .toLowerCase()
            .includes(query?.toLowerCase());

        const matchesFilter = filter
            ? question.tags.some(
                  (tag) => tag.name.toLowerCase() === filter.toLowerCase()
              )
            : true;
        return matchesQuery && matchesFilter;
    });

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
            <div className="mt-10 flex w-full flex-col gap-6">
                {filteredQuestions.map((q) => (
                    <QuestioCard key={q._id} question={q} />
                ))}
            </div>
        </>
    );
};

export default Home;
