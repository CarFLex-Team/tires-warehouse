"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/auth/FormInput";
import AuthButton from "@/components/auth/AuthButton";
import { signinSchema, SigninFormData } from "@/lib/validations/signinSchema";

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    console.log("Signup data:", data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="mb-4 flex justify-center">
          <img src="/logo.png" alt="Logo" className=" w-25" />
        </div>

        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">
          Create an account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <FormInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            register={register("email")}
            error={errors.email}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            register={register("password")}
            error={errors.password}
          />

          <a
            href="/login"
            className="font-medium text-primary hover:underline text-center text-sm text-gray-600"
          >
            Forget Password?
          </a>

          <AuthButton
            // type="submit"
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            // disabled={isSubmitting}
            title="Sign in"
            onClick={() => handleSubmit(onSubmit)()}
          >
            {/* {isSubmitting ? "Creating account..." : "Sign up"} */}
          </AuthButton>
        </form>
      </div>
    </div>
  );
}
