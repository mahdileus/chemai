import "server-only";
import { authUser } from "@/utils/auth-server";
import { redirect } from "next/navigation";

export default async function UserDashboardGuard({ children }) {
  const user = await authUser();
  if (!user) redirect("/login-register");
  return children;
}