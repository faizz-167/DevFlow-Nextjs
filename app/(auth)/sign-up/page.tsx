"use client";
import AuthForm from "@/components/forms/AuthForm";
import { signUpWithCredentials } from "@/lib/actions/auth.action";
import { SignUpSchema } from "@/lib/validation";

const SignUp = () => {
    return (
        <AuthForm
            formType="SIGN_UP"
            schema={SignUpSchema}
            defaultValues={{ email: "", password: "", username: "", name: "" }}
            onSubmit={signUpWithCredentials}
        />
    );
};

export default SignUp;
