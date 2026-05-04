import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(225,255,81,0.08),transparent_28%),hsl(var(--background))]">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="dashboard-surface p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
