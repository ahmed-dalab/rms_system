import {
  VAT_PERCENT_LABEL,
  calculateTotalWithVat,
  calculateVatAmount,
} from "@/lib/constants/tax";
import { formatMoney } from "@/lib/format/currency";
import { cn } from "@/lib/utils";

type OrderTotalsSummaryProps = {
  subtotal: number;
  /** Larger total line for POS ticket footer */
  emphasis?: "default" | "pos";
  className?: string;
};

export function OrderTotalsSummary({
  subtotal,
  emphasis = "default",
  className,
}: OrderTotalsSummaryProps) {
  const vat = calculateVatAmount(subtotal);
  const total = calculateTotalWithVat(subtotal);

  return (
    <div className={cn("space-y-1 text-sm", className)}>
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatMoney(subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>VAT ({VAT_PERCENT_LABEL})</span>
        <span className="tabular-nums">{formatMoney(vat)}</span>
      </div>
      <div className="flex items-baseline justify-between border-t border-border pt-2">
        <span className="font-medium">Total</span>
        <span
          className={cn(
            "font-bold text-primary tabular-nums",
            emphasis === "pos" ? "text-2xl" : "text-xl",
          )}
        >
          {formatMoney(total)}
        </span>
      </div>
    </div>
  );
}
