import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary dark:bg-surface-dark">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
