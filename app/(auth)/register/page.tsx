import { RegisterForm } from "@/components/auth/register-form";
import { isPublicAdminRegisterAllowed } from "@/lib/constants/register";

export default function RegisterPage() {
  return (
    <RegisterForm allowAdminRegister={isPublicAdminRegisterAllowed()} />
  );
}
