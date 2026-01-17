"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  buttonText?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  isPending?: boolean;
  isError?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  onClose,
  children,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        {children}
      </div>
    </div>
  );
}
