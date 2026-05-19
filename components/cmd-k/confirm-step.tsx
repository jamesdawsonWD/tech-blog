import { Button } from "@/components/ui/button";
import type { Action } from "./types";

type Props = {
  action: Action;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmStep({ action, onConfirm, onCancel }: Props) {
  if (!action.confirm) return null;
  const { title, description, confirmLabel = "Continue", destructive } = action.confirm;

  return (
    <div
      className="flex flex-col gap-4 p-6"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onConfirm();
        }
      }}
    >
      <div>
        <h2 className="text-base font-medium">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} autoFocus={destructive}>
          Cancel
        </Button>
        <Button
          variant={destructive ? "destructive" : "default"}
          onClick={onConfirm}
          autoFocus={!destructive}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
