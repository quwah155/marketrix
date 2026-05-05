import { requireBuyer } from "@/server/guards/auth.guard";
import { userRepository } from "@/server/repositories/user.repository";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ShieldCheck } from "lucide-react";

export default async function BuyerSettingsPage() {
  const user = await requireBuyer();
  const profile = await userRepository.findById(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your buyer profile, security, and account identity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">Buyer account</p>
            <p className="text-sm text-muted-foreground">Purchasing, downloads, and reviews</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">{user.email}</p>
            <p className="text-sm text-muted-foreground">Primary email</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <Badge variant={profile?.emailVerified ? "success" : "warning"}>
              {profile?.emailVerified ? "Verified" : "Pending"}
            </Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Verified accounts have a smoother sign-in and recovery flow.
            </p>
          </div>
        </CardContent>
      </Card>

      <AccountSettingsForm
        roleLabel="Buyer"
        email={user.email}
        emailVerified={Boolean(profile?.emailVerified)}
        initialValues={{
          name: profile?.name ?? user.name,
          bio: profile?.bio ?? "",
          image: profile?.image ?? "",
        }}
      />

      <PasswordSettingsForm />
    </div>
  );
}
