import handleError from "@/lib/handlers/error";
import dbConnect from "@/lib/mongoose";
import { NextResponse } from "next/server";
import Account from "@/database/account.model";
import { ForbiddenError } from "@/lib/http-errors";
import { AccountSchema } from "@/lib/validation";

export async function GET() {
    try {
        await dbConnect();
        const accounts = await Account.find();
        return NextResponse.json(
            {
                success: true,
                data: accounts,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return handleError(error, "api") as APIErrorResponse;
    }
}

//create a new user
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const validatedData = AccountSchema.parse(body);
        // Check if the user already exists
        const existingUser = await Account.findOne({
            provider: validatedData.provider,
            providerAccountId: validatedData.providerAccountId,
        });
        if (existingUser) {
            throw new ForbiddenError(
                "Account already exists with this provider."
            );
        }

        // Create a new account
        const newAccount = await Account.create(validatedData);
        return NextResponse.json(
            {
                success: true,
                data: newAccount,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        return handleError(error, "api") as APIErrorResponse;
    }
}
