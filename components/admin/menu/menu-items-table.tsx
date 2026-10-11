import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/format/currency";
import type { MenuItemRecord } from "@/types/menu-item";

type MenuItemsTableProps = {
  items: MenuItemRecord[];
};

export function MenuItemsTable({ items }: MenuItemsTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No menu items yet</CardTitle>
          <CardDescription>
            Add dishes below and assign each one to a category.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu</CardTitle>
        <CardDescription>
          {items.length} item{items.length === 1 ? "" : "s"} on the menu
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Item
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Category
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Price
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-6 py-3">
                  <p className="font-medium">{item.name}</p>
                  {item.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  ) : null}
                </td>
                <td className="px-6 py-3 text-muted-foreground">
                  {item.categoryName}
                </td>
                <td className="px-6 py-3 font-medium">
                  {formatMoney(item.price)}
                </td>
                <td className="px-6 py-3">
                  <Badge variant={item.isAvailable ? "default" : "muted"}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
