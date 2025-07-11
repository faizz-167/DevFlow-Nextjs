import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;

    try {
        await dbConnect();

        if (!isValidObjectId(userId)) {
            throw new ValidationError({ userId: ["Invalid user ID format"] });
        }

        const account = await Account.findOne({
            userId,
            provider: "credentials",
        });

        if (!account) {
            throw new NotFoundError("account");
        }

        return NextResponse.json(
            { success: true, data: account },
            { status: 200 }
        );
    } catch (error) {
        return handleError(error, "api") as APIErrorResponse;
    }
}
