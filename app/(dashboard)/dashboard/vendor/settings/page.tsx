import { requireVendor } from "@/server/guards/auth.guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorSettingsProfile } from "@/services/vendor-query.service";

export default async function VendorSettingsPage() {
  const user = await requireVendor();

  const profile = await getVendorSettingsProfile(user.id);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Vendor Settings</h1>
        <p className="text-muted-foreground">Manage your public vendor profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Verification:</span>{" "}
            {profile?.verified ? "Verified" : "Pending"}
          </p>
          <p>
            <span className="font-medium">Bio:</span> {profile?.bio || "Not set"}
          </p>
          <p>
            <span className="font-medium">Website:</span> {profile?.website || "Not set"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
