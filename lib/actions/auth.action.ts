"use server";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { SignInSchema, SignUpSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import { signIn } from "@/auth";
import { NotFoundError } from "../http-errors";

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
export async function signInWithCredentials(
    params: Pick<SignUpWithCredentialsParams, "email" | "password">
): Promise<ActionResponse> {
    const validationResult = await action({
        params,
        schema: SignInSchema,
    });
    if (validationResult instanceof Error) {
        return handleError(validationResult) as ErrorResponse;
    }

    const { email, password } = validationResult.params!;

    try {
        const exsistingUser = await User.findOne({ email });
        if (!exsistingUser) {
            throw new NotFoundError("User");
        }
        const existingAccount = await Account.findOne({
            provider: "credentials",
            providerAccountId: email,
        });
        if (!existingAccount) {
            throw new NotFoundError("Account");
        }

        const passwordMatch = await bcrypt.compare(
            password,
            existingAccount.password!
        );
        if (!passwordMatch) {
            throw new Error("Invalid password.");
        }
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        return { success: true };
    } catch (error) {
        return handleError(error) as ErrorResponse;
    }
}
