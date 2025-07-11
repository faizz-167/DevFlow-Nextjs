import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { api } from "./lib/api";
import { ActionResponse } from "./types/global";
import { IAccountDoc } from "./database/account.model";
import { SignInSchema } from "./lib/validation";
import { IUserDoc } from "./database/user.model";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { Types } from "mongoose";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub,
        Google,
        Credentials({
            async authorize(credentials) {
                const validatedFields = SignInSchema.safeParse(credentials);
                if (!validatedFields.success) {
                    return null;
                }

                const { email, password } = validatedFields.data;

                try {
                    // First, get the user by email
                    const userResponse = await api.users.getByEmail(email);

                    if (
                        !userResponse ||
                        !userResponse.success ||
                        !userResponse.data
                    ) {
                        console.log("User not found for email:", email);
                        return null;
                    }

                    const existingUser = userResponse.data as IUserDoc;

                    // Get the account associated with this user (credentials provider)
                    const accountResponse = await api.accounts.getByUserId(
                        (existingUser._id as Types.ObjectId).toString()
                    );

                    if (
                        !accountResponse ||
                        !accountResponse.success ||
                        !accountResponse.data
                    ) {
                        console.log(
                            "Account not found for user:",
                            existingUser._id
                        );
                        return null;
                    }

                    const existingAccount = accountResponse.data as IAccountDoc;

                    // Verify password
                    if (!existingAccount.password) {
                        console.log("No password found for account");
                        return null;
                    }

                    const isValidPassword = await bcrypt.compare(
                        password,
                        existingAccount.password
                    );

                    if (!isValidPassword) {
                        console.log("Invalid password for user:", email);
                        return null;
                    }

                    return {
                        id: (existingUser._id as Types.ObjectId).toString(),
                        name: existingUser.name,
                        email: existingUser.email,
                        image: existingUser.image || null,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            session.user.id = token.sub as string; // Ensure user ID is set in session
            return session;
        },
        async jwt({ token, account }) {
            if (account) {
                const { data: exsistingAccount, success } =
                    (await api.accounts.getByProvider(
                        account.type === "credentials"
                            ? token.email!
                            : account.providerAccountId
                    )) as ActionResponse<IAccountDoc>;
                if (!success || !exsistingAccount) return token; // Return token if no account found
                const userId = exsistingAccount.userId;
                if (userId) {
                    token.sub = userId.toString(); // Set user ID in token
                }
            }
            return token;
        },
        async signIn({ user, account, profile }) {
            if (account?.type === "credentials") {
                return true; // Allow sign-in with credentials
            }
            if (!account || !user) {
                return false; // Deny sign-in if account or user is not available
            }

            const userInfo = {
                name: user.name!,
                email: user.email!,
                image: user.image!,
                username:
                    account.provider === "github"
                        ? (profile?.login as string)
                        : (user.name?.toLowerCase() as string),
            };

            const { success } = (await api.auth.oAuthSignIn({
                user: userInfo,
                provider: account.provider as "github" | "google",
                providerAccountId: account.providerAccountId,
            })) as ActionResponse;

            if (!success) {
                return false; // Deny sign-in if API call fails
            }

            return true;
        },
    },
});
