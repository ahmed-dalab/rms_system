import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CategoryRecord } from "@/types/category";

type CategoriesTableProps = {
  categories: CategoryRecord[];
};

export function CategoriesTable({ categories }: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No categories yet</CardTitle>
          <CardDescription>
            Create your first category using the form above (e.g. Appetizers,
            Mains, Drinks).
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All categories</CardTitle>
        <CardDescription>
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}{" "}
          sorted for display order
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Slug
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Order
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-6 py-3 font-medium">{category.name}</td>
                <td className="px-6 py-3 text-muted-foreground">
                  {category.slug}
                </td>
                <td className="px-6 py-3">{category.sortOrder}</td>
                <td className="px-6 py-3">
                  <Badge variant={category.isActive ? "default" : "muted"}>
                    {category.isActive ? "Active" : "Hidden"}
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
