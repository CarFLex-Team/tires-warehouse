"use client";

import { useState } from "react";
import { FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  register: any;
  error?: FieldError;
}

export default function FormInput({
  label,
  type = "text",
  placeholder,
  register,
  error,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>

      <div className="">
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          {...register}
          className={`h-11 w-full rounded-lg border px-3  text-sm outline-none transition
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
            focus:ring-1`}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
