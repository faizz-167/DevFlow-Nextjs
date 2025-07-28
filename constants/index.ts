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
        imgURL: "/icons/suitcase.svg",
        route: ROUTES.JOBS as string,
        label: "Find Jobs",
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
