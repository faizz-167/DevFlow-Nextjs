import ROUTES from "./routes";

export const sidebarLinks = [
    {
        imgURL: "/icons/home.svg",
        route: ROUTES.HOME as string,
        label: "Home",
    },
    {
        imgURL: "/icons/users.svg",
        route: ROUTES.COMMUNITY as string,
        label: "Community",
    },
    {
        imgURL: "/icons/star.svg",
        route: ROUTES.COLLECTION as string,
        label: "Collections",
    },
    {
        imgURL: "/icons/tag.svg",
        route: ROUTES.TAGS as string,
        label: "Tags",
    },
    {
        imgURL: "/icons/user.svg",
        route: "/profile",
        label: "Profile",
    },
    {
        imgURL: "/icons/question.svg",
        route: ROUTES.ASK_QUESTION as string,
        label: "Ask a question",
    },
];

export const BADGE_CRITERIA = {
    QUESTION_COUNT: {
        BRONZE: 10,
        SILVER: 50,
        GOLD: 100,
    },
    ANSWER_COUNT: {
        BRONZE: 10,
        SILVER: 50,
        GOLD: 100,
    },
    QUESTION_UPVOTES: {
        BRONZE: 10,
        SILVER: 50,
        GOLD: 100,
    },
    ANSWER_UPVOTES: {
        BRONZE: 10,
        SILVER: 50,
        GOLD: 100,
    },
    TOTAL_VIEWS: {
        BRONZE: 1000,
        SILVER: 10000,
        GOLD: 100000,
    },
};
