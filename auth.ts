import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { api } from "./lib/api";
import { ActionResponse } from "./types/global";
import { IAccountDoc } from "./database/account.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [GitHub, Google],
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
