import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const Home = async () => {
    const session = await auth();
    console.log("Session:", session);
    return (
        <>
            <h1 className="text-3xl font-bold font-space-grotesk text-center mt-10">
                Welcome to Devflow
            </h1>
            <form
                className="px-10 pt-[100px] "
                action={async () => {
                    "use server";
                    await signOut({ redirectTo: ROUTES.SIGN_IN });
                }}
            >
                <Button type="submit">Log Out</Button>
            </form>
        </>
    );
};

export default Home;
