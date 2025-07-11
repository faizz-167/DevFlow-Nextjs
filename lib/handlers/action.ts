"use server";

import { ZodError, ZodSchema } from "zod";
import { UnauthorizedError, ValidationError } from "../http-errors";
import { Session } from "next-auth";
import { auth } from "@/auth";
import dbConnect from "../mongoose";

type ActionOptions<T> = {
    params?: T;
    schema?: ZodSchema<T>;
    authorize?: boolean;
};

async function action<T>({
    params,
    schema,
    authorize = false,
}: ActionOptions<T>) {
    if (schema && params) {
        try {
            schema.parse(params);
        } catch (error) {
            if (error instanceof ZodError) {
                return new ValidationError(
                    error.flatten().fieldErrors as Record<string, string[]>
                );
            } else {
                return new Error("schema validation failed");
            }
        }
    }

    let session: Session | null = null;
    if (authorize) {
        session = await auth();
        if (!session) {
            return new UnauthorizedError();
        }
    }

    await dbConnect();

    return { params, session };
}

// 1. checking if the schema and params are provided and are validated
// 2. checking whether the user is authorized
// 3. connecting to the database
// 4. returning the validated params and session
export default action;
