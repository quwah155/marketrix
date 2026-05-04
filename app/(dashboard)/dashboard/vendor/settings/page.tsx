import { requireVendor } from "@/server/guards/auth.guard";
import { userRepository } from "@/server/repositories/user.repository";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { VendorProfileForm } from "@/components/settings/vendor-profile-form";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorSettingsProfile } from "@/services/vendor-query.service";
import { Globe, ShieldCheck, Store } from "lucide-react";

export default async function VendorSettingsPage() {
  const user = await requireVendor();
  const accountProfile = await userRepository.findById(user.id);
  const profile = await getVendorSettingsProfile(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Vendor Settings</h1>
        <p className="text-muted-foreground">
          Manage your account identity and the storefront details buyers will trust.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storefront snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <Store className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">Public seller profile</p>
            <p className="text-sm text-muted-foreground">Bio, website, and storefront image</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <Badge variant={profile?.verified ? "success" : "warning"}>
              {profile?.verified ? "Verified vendor" : "Verification pending"}
            </Badge>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <Globe className="h-5 w-5" />
            </div>
            <p className="truncate text-sm font-semibold">{profile?.website || "No website set"}</p>
            <p className="text-sm text-muted-foreground">External brand destination</p>
          </div>
        </CardContent>
      </Card>

      <AccountSettingsForm
        roleLabel="Vendor"
        email={user.email}
        emailVerified={Boolean(accountProfile?.emailVerified)}
        initialValues={{
          name: accountProfile?.name ?? user.name,
          bio: accountProfile?.bio ?? "",
          image: accountProfile?.image ?? "",
        }}
      />

      <VendorProfileForm
        verified={Boolean(profile?.verified)}
        initialValues={{
          bio: profile?.bio ?? "",
          website: profile?.website ?? "",
          avatar: profile?.avatar ?? "",
        }}
      />

      <PasswordSettingsForm />
    </div>
  );
}
