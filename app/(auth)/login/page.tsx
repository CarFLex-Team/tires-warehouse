"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/Auth/FormInput";
import AuthButton from "@/components/Auth/AuthButton";
import { signinSchema, SigninFormData } from "@/lib/validations/signinSchema";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    setAuthError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setAuthError("Invalid email or password");
      return;
    }

    // success
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    const role = session?.user?.role;
    router.push(role === "OWNER" ? "/owner/dashboard" : "/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="mb-4 flex justify-center">
          <img src="/Logo.png" alt="Logo" className=" w-25" />
        </div>

        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">
          Sign in to your account
        </h1>

        <form className="">
          <div className=" space-y-3">
            <FormInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              register={register("email")}
              error={errors.email}
            />
            <div className=" relative">
              <FormInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                register={register("password")}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-primary hover:underline absolute right-3 top-9"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <a
            href="/forgot-password"
            className="font-medium text-primary hover:underline text-sm text-gray-600 mb-4 block mt-2"
          >
            Forget Password?
          </a>

          {/* Auth error */}
          {authError && <p className="text-sm text-red-500">{authError}</p>}
          <AuthButton
            // type="submit"
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Processing..." : "Sign in"}
          </AuthButton>
        </form>
      </div>
    </div>
  );
}
