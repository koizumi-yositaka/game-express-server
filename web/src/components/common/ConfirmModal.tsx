import { useAtom } from "jotai";
import { confirmModalAtom } from "@/atoms/confirmModalAtom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog() {
  const [dialog, setDialog] = useAtom(confirmModalAtom);

  const handleClose = (result: boolean) => {
    dialog.resolve(result);
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const typeStyle = (() => {
    switch (dialog.type) {
      case "error":
        return {
          iconColor: "text-red-600",
          accentBg: "",
          titleColor: "text-red-700",
          confirmVariant: "destructive" as const,
        };
      case "info":
        return {
          iconColor: "text-blue-600",
          accentBg: "",
          titleColor: "text-blue-700",
          confirmVariant: "default" as const,
        };
      default:
        return {
          iconColor: "text-yellow-600",
          accentBg: "",
          titleColor: "text-yellow-700",
          confirmVariant: "default" as const,
        };
    }
  })();

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => !open && handleClose(false)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={`flex items-center gap-2 rounded-md p-2 ${typeStyle.accentBg}`}
          >
            <svg
              className={`h-5 w-5 ${typeStyle.iconColor}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {dialog.type === "error" && (
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              )}
              {dialog.type === "info" && (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </>
              )}
              {dialog.type === "confirm" && (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 115.82 1c0 2-3 2-3 4" />
                  <circle cx="12" cy="17" r=".5" />
                </>
              )}
            </svg>
            <DialogTitle className={`${typeStyle.titleColor}`}>
              {dialog.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex items-start gap-3">
          <div className="grid flex-1 gap-2">
            <p className="leading-relaxed text-sm text-gray-700 whitespace-pre-wrap">
              {dialog.description}
            </p>
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          {!dialog.isOnlyYes && (
            <Button variant="outline" onClick={() => handleClose(false)}>
              {dialog.cancelLabel ?? "いいえ"}
            </Button>
          )}
          <Button
            variant={typeStyle.confirmVariant}
            onClick={() => handleClose(true)}
          >
            {dialog.execLabel ?? (dialog.type === "info" ? "OK" : "はい")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
