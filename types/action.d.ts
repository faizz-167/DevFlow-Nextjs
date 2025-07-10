interface SignInWithOAuthParams {
    provider: 'github' | 'google';
    providerAccountId: string;
    user: {
        email: string;
        name: string;
        image?: string;
        username: string;
    }
}