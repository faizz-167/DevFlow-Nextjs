import { ActionResponse } from "@/types/global";
import logger from "../logger";
import handleError from "./error";
import { RequestError } from "../http-errors";

interface FetchOptions extends RequestInit {
    timeout?: number;
}

function isError(error: unknown): error is Error {
    return error instanceof Error;
}

export async function fetchHandler<T>(
    url: string,
    options: FetchOptions = {}
): Promise<ActionResponse<T>> {
    const {
        timeout = 5000,
        headers: customHeaders = {},
        ...restOptions
    } = options;

    //AbortController allow us to cancel the fetch request if it takes too long
    const controller = new AbortController();
    const id = setTimeout(() => {
        controller.abort();
    }, timeout);

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    const headers: HeadersInit = {
        ...defaultHeaders,
        ...customHeaders,
    };

    const config: RequestInit = {
        ...restOptions,
        headers,
        signal: controller.signal,
    };

    try {
        const response = await fetch(url, config);
        clearTimeout(id);
        if (!response.ok) {
            throw new RequestError(
                response.status,
                `HTTP error: ${response.status}`
            );
        }
        return await response.json();
    } catch (error) {
        const newError = isError(error)
            ? error
            : new Error("An unknown error occurred");
        if (newError.name === "AbortError") {
            logger.warn(`Request to ${url} timed out`);
        } else {
            logger.error(`Error fetching ${url}: ${newError.message}`);
        }

        return handleError(newError) as ActionResponse<T>;
    }
}
