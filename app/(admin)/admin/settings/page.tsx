import { requireAdmin } from "@/server/guards/auth.guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Platform-level settings can be configured here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Settings management is scaffolded. Connect this page to your
            environment-backed configuration service when needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
