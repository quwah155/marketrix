import { requireAuth } from "@/server/guards/auth.guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BuyerSettingsPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your buyer account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name:</span> {user.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-muted-foreground">
            Settings forms are scaffolded and ready to connect to update actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
