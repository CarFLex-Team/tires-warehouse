"use client";

import { editInventoryCell } from "@/lib/api/inventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
export function EditableCell({
  value,
  rowId,
  field,
  type,
  options,
  className,
  date,
  icon,
  rowPrice,
}: {
  value: any;
  rowId: string;
  field: string;
  type: string;
  options?: { value: string; bg?: string; label?: string }[];
  className?: string;
  date?: string;
  icon?: string;
  rowPrice?: number;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const [newValue, setNewValue] = useState(value);
  useEffect(() => {
    setNewValue(value);
  }, [value]);
  const mutation = useMutation({
    mutationFn: editInventoryCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setNewValue(draft);
      setEditing(false);
    },
  });
  async function save(draftValue?: any) {
    if (mutation.isPending) return;
    if (draftValue !== undefined) {
      setDraft(draftValue);
    }
    if ((draftValue ?? draft) === newValue) {
      setEditing(false);
      return;
    }

    // setLoading(true);

    mutation.mutate({
      id: rowId,
      quantity: Number(draftValue ?? draft),
    });
  }
  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className={`cursor-pointer border border-transparent! hover:border-gray-300! flex gap-1 ${className}`}
      >
        {newValue === "" || newValue == null ? "—" : newValue}
        {/* {icon && <span className="text-black ml-1">{icon}</span>} */}
        {/* {mutation.isPending && <Loader2 size={8} />} */}
      </div>
    );
  }
  return (
    <div className={`flex gap-1 `}>
      <input
        autoFocus
        type={type === "datetime" ? "datetime-local" : type}
        value={draft ?? ""}
        onBlur={() => save()}
        onChange={(e) => setDraft(e.target.value)}
        className={`border max-w-20 ${className}`}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }

          if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
          }
        }}
      />
      {mutation.isPending && (
        <span className="flex items-center justify-center animate-spin">
          <Loader2 size={10} />
        </span>
      )}
    </div>
  );
}
