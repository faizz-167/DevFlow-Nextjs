interface Tags {
    _id: string;
    name: string;
}

interface Author {
    _id: string;
    name: string;
    image: string;
}

interface Question {
    _id: string;
    title: string;
    tags: Tags[];
    author: Author;
    createdAt: Date;
    upvotes: number;
    answers: number;
    views: number;
}
