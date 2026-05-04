import { requireAdmin } from "@/server/guards/auth.guard";
import { userRepository } from "@/server/repositories/user.repository";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail, ShieldCheck, UserCog } from "lucide-react";

export default async function AdminSettingsPage() {
  const user = await requireAdmin();
  const profile = await userRepository.findById(user.id);

  const platformChecks = [
    {
      label: "Email delivery",
      value: process.env.SMTP_HOST ? "Configured" : "Missing config",
      ok: Boolean(process.env.SMTP_HOST),
    },
    {
      label: "Authentication",
      value: process.env.NEXTAUTH_SECRET ? "Configured" : "Missing config",
      ok: Boolean(process.env.NEXTAUTH_SECRET),
    },
    {
      label: "Payments",
      value: process.env.STRIPE_SECRET_KEY ? "Configured" : "Missing config",
      ok: Boolean(process.env.STRIPE_SECRET_KEY),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin identity and review the platform services this workspace depends on.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">Administrator access</p>
            <p className="text-sm text-muted-foreground">Platform-level control and moderation</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">{user.email}</p>
            <p className="text-sm text-muted-foreground">Signed-in account</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <UserCog className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">{profile?.name ?? user.name}</p>
            <p className="text-sm text-muted-foreground">Current display name</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AccountSettingsForm
          roleLabel="Administrator"
          email={user.email}
          emailVerified={Boolean(profile?.emailVerified)}
          initialValues={{
            name: profile?.name ?? user.name,
            bio: profile?.bio ?? "",
            image: profile?.image ?? "",
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Platform health</CardTitle>
            <p className="text-sm text-muted-foreground">
              Quick visibility into environment-backed services.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformChecks.map((check) => (
              <div
                key={check.label}
                className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.value}</p>
                </div>
                <Badge variant={check.ok ? "success" : "warning"}>
                  {check.ok ? "Ready" : "Attention"}
                </Badge>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                Admin settings are now interactive
              </div>
              This page now saves your profile, refreshes visible session details, and surfaces configuration status for core services.
            </div>
          </CardContent>
        </Card>
      </div>

      <PasswordSettingsForm />
    </div>
  );
}
