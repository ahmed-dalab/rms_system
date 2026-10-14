import { redirect } from "next/navigation";

/** Public self-registration is disabled — accounts are created by an admin. */
export default function RegisterPage() {
  redirect("/login");
}
