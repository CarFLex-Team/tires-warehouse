"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  buttonText?: string;
  children?: React.ReactNode;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  onClose,
  children,
  buttonText,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  ">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg overflow-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        <div className="mt-6 flex flex-col justify-end gap-3 ">{children}</div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 border border-primary-600 text-primary-600 bg-white rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer"
          >
            {buttonText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
