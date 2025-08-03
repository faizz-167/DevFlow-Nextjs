import { auth } from "@/auth";
import EditProfileForm from "@/components/forms/EditProfileForm";
import ROUTES from "@/constants/routes";
import { getUser } from "@/lib/actions/user.action";
import { notFound, redirect } from "next/navigation";
import React from "react";

const EditProfile = async ({ params }: RouteParams) => {
    const { id } = await params;
    if (!id) return notFound();

    const session = await auth();
    if (!session) return redirect("/sign-in");

    const { data, success } = await getUser({ userId: id });
    const { user } = data!;

    if (!success || !user) return notFound();
    if (user._id.toString() !== session?.user?.id) {
        redirect(ROUTES.PROFILE(id));
    }
    return (
        <main>
            <EditProfileForm user={user} />
        </main>
    );
};

export default EditProfile;
