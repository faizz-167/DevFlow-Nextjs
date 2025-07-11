import { NextResponse } from "next/server";

declare global {
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
        content: string;
        tags: Tags[];
        author: Author;
        createdAt: Date;
        upvotes: number;
        answers: number;
        views: number;
    }

    type ActionResponse<T = null> = {
        success: boolean;
        data?: T;
        error?: {
            message: string;
            errors?: Record<string, string[]>;
        };
        status?: number;
    };

    type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
    type ErrorResponse = ActionResponse<undefined> & { success: false };

    interface RouteParams {
        params: Promise<Record<string, string>>;
        searchParams: Promise<Record<string, string>>;
    }

    interface PaginatedSearchParams {
        page?: number;
        pageSize?: number;
        query?: string;
        filter?: string;
        sort?: string;
    }
}

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;
