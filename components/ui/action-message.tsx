import { cn } from "@/lib/utils";

type ActionMessageProps = {
  message: string;
  ok?: boolean;
  className?: string;
  size?: "xs" | "sm";
};

export function ActionMessage({
  message,
  ok,
  className,
  size = "xs",
}: ActionMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role={ok ? "status" : "alert"}
      className={cn(
        size === "xs" ? "text-xs" : "text-sm",
        ok ? "text-success" : "text-destructive",
        className,
      )}
    >
      {message}
    </p>
  );
}
