import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http=errors";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

// Get a user by ID api/users/[id]
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) {
        throw new NotFoundError("Account");
    }
    try {
        await dbConnect();
        const account = await Account.findById(id);
        if (!account) {
            throw new NotFoundError("Account");
        }
        return NextResponse.json(
            {
                success: true,
                data: account,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        handleError(error, "api") as APIErrorResponse;
    }
}

// Update a user by ID api/users/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) {
        throw new NotFoundError("Account");
    }
    try {
        await dbConnect();
        const body = await request.json();
        const validatedData = AccountSchema.partial().safeParse(body);
        if (!validatedData.success) {
            throw new ValidationError(
                validatedData.error.flatten().fieldErrors
            );
        }
        const updatedAccount = await Account.findByIdAndUpdate(
            id,
            validatedData,
            { new: true }
        );
        if (!updatedAccount) {
            throw new NotFoundError("Account");
        }
        return NextResponse.json(
            {
                success: true,
                data: updatedAccount,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return handleError(error, "api") as APIErrorResponse;
    }
}

// Delete a user by ID api/users/[id]
export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) {
        throw new NotFoundError("Account");
    }
    try {
        await dbConnect();
        const deletedAccount = await Account.findByIdAndDelete(id);
        if (!deletedAccount) {
            throw new NotFoundError("Account");
        }
        return NextResponse.json(
            {
                success: true,
                data: deletedAccount,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return handleError(error, "api") as APIErrorResponse;
    }
}
