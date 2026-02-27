import UserDashboardGuard from "@/app/components/layouts/UserDashboardGuard";
import UserDashboardLayout from "@/app/components/layouts/userDashboardLayout";

export default function Layout({ children }) {
  return (
    <UserDashboardGuard>
      <UserDashboardLayout>{children}</UserDashboardLayout>
    </UserDashboardGuard>
  );
}