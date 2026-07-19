import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface StatusChangeModalProps {
  isOpen: boolean;
  taskTitle: string;
  newStatus: string;
  onClose: () => void;
  onConfirm: (updateSubtasks: boolean) => void;
}

export function StatusChangeModal({
  isOpen,
  taskTitle,
  newStatus,
  onClose,
  onConfirm,
}: StatusChangeModalProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-foreground">Update Subtasks?</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100 transition-colors"
          >
            <XIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          You are changing the status of <strong>&quot;{taskTitle}&quot;</strong> to{" "}
          <span className="font-semibold text-foreground">
            {newStatus.toUpperCase().replace("_", " ")}
          </span>
          . This task has subtasks attached to it.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Do you want to update the status of all its subtasks as well?
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => onConfirm(false)}>
            Only this task
          </Button>
          <Button onClick={() => onConfirm(true)}>
            Task and Subtasks
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
