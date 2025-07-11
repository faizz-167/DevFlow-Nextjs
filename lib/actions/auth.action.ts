"use server";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { SignUpSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import { signIn } from "@/auth";

export async function signUpWithCredentials(
    params: SignUpWithCredentialsParams
): Promise<ActionResponse> {
    const validationResult = await action({
        params,
        schema: SignUpSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { name, username, email, password } = validationResult.params!;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const exsistingUser = await User.findOne({ email }).session(session);
        if (exsistingUser) {
            throw new Error("User with this email already exists.");
        }
        const existingUsername = await User.findOne({ username }).session(
            session
        );
        if (existingUsername) {
            throw new Error("Username is already taken.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await User.create([{ name, username, email }], {
            session,
        });
        await Account.create(
            [
                {
                    userId: newUser._id,
                    name,
                    provider: "credentials",
                    providerAccountId: email,
                    password: hashedPassword,
                },
            ],
            { session }
        );
        await session.commitTransaction();

        // Sign in after transaction is committed
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        return handleError(error) as ErrorResponse;
    } finally {
        await session.endSession();
    }
}
