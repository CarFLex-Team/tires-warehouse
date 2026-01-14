"use client";

import AuthButton from "@/components/Auth/AuthButton";
import FormInput from "@/components/Auth/FormInput";
import { resetSchema, ResetFormData } from "@/lib/validations/resetSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });
  async function onSubmit(data: ResetFormData) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: data.email }),
    });

    setSent(true);
  }

  return sent ? (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="mb-4 flex justify-center">
          <img src="/Logo.png" alt="Logo" className=" w-25" />
        </div>

        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">
          Forgot your password?
        </h1>
        <p className="text-center text-gray-700">
          If you provided a valid email address, Please check your email for a
          reset link.
        </p>
      </div>
    </div>
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="mb-4 flex justify-center">
          <img src="/Logo.png" alt="Logo" className=" w-25" />
        </div>

        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">
          Forgot your password?
        </h1>

        <form className="space-y-3">
          <FormInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            register={register("email")}
            error={errors.email}
          />

          <AuthButton
           
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Processing..." : "Reset Password"}
          </AuthButton>
        </form>
      </div>
    </div>
  );
}
