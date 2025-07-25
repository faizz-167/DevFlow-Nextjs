const ROUTES = {
    HOME: "/",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    COLLECTION: "/collections",
    COMMUNITY: "/community",
    TAGS:"/tags",
    TAG: (id: string) => `/tags/${id}`,
    PROFILE: (id: string) => `/profile/${id}`,
    QUESTION: (id: string) => `/questions/${id}`,
    ASK_QUESTION: "/ask-question",
};

export default ROUTES;
