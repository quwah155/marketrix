import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(225,255,81,0.08),transparent_28%),hsl(var(--background))]">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        {/* pt-14 on mobile offsets the fixed top bar, lg:pt-0 removes it on desktop */}
        <div className="dashboard-surface p-4 pt-[4.5rem] sm:p-6 sm:pt-[4.5rem] lg:p-8 lg:pt-8">{children}</div>
      </div>
    </div>
  );
}
