import { AdminDashboard } from "@/components/features/admin/admin-dashboard";
import { notFound } from "next/navigation";
import { isAdminUiEnabled } from "@/lib/feature-flags";

export default function AdminPage() {
  if (!isAdminUiEnabled()) {
    notFound();
  }

  return <AdminDashboard />;
}
