import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http=errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(request: Request) {
    const { provider, providerAccountId, user } = await request.json();
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();
    //if we try to create an account -> fails
    //then the user we create -> fails

    try {
        const validatedData = SignInWithOAuthSchema.safeParse({
            provider,
            providerAccountId,
            user,
        });
        if (!validatedData.success) {
            throw new ValidationError(
                validatedData.error.flatten().fieldErrors
            );
        }

        const { name, username, email, image } = user;
        const slugifyUsername = slugify(username, {
            lower: true,
            strict: true,
            trim: true,
        });

        let exsistingUser = await User.findOne({ email }).session(session);
        if (!exsistingUser) {
            [exsistingUser] = await User.create(
                [{ name, username: slugifyUsername, email, image }],
                { session }
            );
        } else {
            const updatedData: { name?: string; image?: string } = {};
            if (exsistingUser.name !== name) {
                updatedData.name = name;
            }
            if (exsistingUser.image !== image) {
                updatedData.image = image;
            }
            if (Object.keys(updatedData).length > 0) {
                await User.updateOne(
                    { _id: exsistingUser._id },
                    { $set: updatedData }
                ).session(session);
            }
        }

        const exsistingAccount = await Account.findOne({
            userId: exsistingUser._id,
            provider,
            providerAccountId,
        }).session(session);

        if (!exsistingAccount) {
            await Account.create(
                [
                    {
                        userId: exsistingUser._id,
                        name,
                        image,
                        provider,
                        providerAccountId,
                    },
                ],
                { session }
            );
        }
        await session.commitTransaction();

        return NextResponse.json({ success: true, data: exsistingUser });
    } catch (error: unknown) {
        await session.abortTransaction();
        return handleError(error, "api") as APIErrorResponse;
    } finally {
        session.endSession();
    }
}
