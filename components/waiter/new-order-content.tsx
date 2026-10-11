import { redirect } from "next/navigation";

/** Legacy route content — POS lives at /waiter/pos */
export async function NewOrderContent() {
  redirect("/waiter/pos");
}
