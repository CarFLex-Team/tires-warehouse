"use client";

import AuthButton from "@/components/Auth/AuthButton";
import FormInput from "@/components/Auth/FormInput";
import {
  ResetPassFormData,
  resetPassSchema,
} from "@/lib/validations/resetSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPassFormData>({
    resolver: zodResolver(resetPassSchema),
  });
  async function onSubmit(data: ResetPassFormData) {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password: data.password }),
    });

    if (res.ok) router.push("/login");
    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || "An error occurred");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="mb-4 flex justify-center">
          <img src="/Logo.png" alt="Logo" className=" w-25" />
        </div>

        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-900">
          Enter your new password
        </h1>

        <form className="space-y-3">
          <FormInput
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            register={register("password")}
            error={errors.password}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <AuthButton
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Processing..." : "New Password"}
          </AuthButton>
        </form>
      </div>
    </div>
  );
}
