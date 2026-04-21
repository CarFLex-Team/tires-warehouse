"use client";

import LoadingSpinner from "./LoadingSpinner";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  extraBody?: React.ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  description = "Do you want to Delete?",
  onConfirm,
  onCancel,
  loading = false,
  error,

  extraBody,
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {extraBody}
        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error || "An error occurred"}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Processing..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}
