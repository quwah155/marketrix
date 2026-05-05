import { Metadata } from "next";
import { Shield, FileText, Cookie, Eye, Lock, Server, UserCheck, AlertTriangle, Scale, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal — Privacy, Terms & Cookie Policy | Marketrix",
  description: "Read the Marketrix Privacy Policy, Terms of Service, and Cookie Policy.",
};

function Section({ id, badge, title, subtitle, children }: { id: string; badge: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-4 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-chartreuse border border-chartreuse/20 bg-chartreuse/8">{badge}</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
          <p className="mt-2 text-xs text-muted-foreground">Last updated: May 1, 2026</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chartreuse/10 border border-chartreuse/20">
          <Icon className="h-4 w-4 text-chartreuse" />
        </div>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground space-y-3">{children}</div>
    </div>
  );
}

export default function LegalPage() {
  return (
    <div>
      <div className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-chartreuse/5 via-transparent to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-chartreuse/20 bg-chartreuse/8 px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-chartreuse" />
            <span className="text-xs font-bold uppercase tracking-widest text-chartreuse">Legal</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Legal & <span className="gradient-text">Policies</span></h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">Transparency matters. Read our policies to understand how we protect your data and govern the marketplace.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[{ label: "Privacy Policy", href: "#privacy", icon: Eye }, { label: "Terms of Service", href: "#terms", icon: FileText }, { label: "Cookie Policy", href: "#cookies", icon: Cookie }].map((link) => (
              <a key={link.label} href={link.href} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-sm font-medium transition-all hover:border-chartreuse/30 hover:bg-chartreuse/8 hover:text-chartreuse">
                <link.icon className="h-3.5 w-3.5" />{link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/6">
        {/* PRIVACY */}
        <Section id="privacy" badge="Privacy Policy" title="Your data, your control." subtitle="We take your privacy seriously. This policy explains what data we collect, how we use it, and your rights.">
          <div className="space-y-4">
            <Card icon={Eye} title="Information We Collect"><p>We collect information you provide directly: name, email address, and payment details when you create an account or make a purchase.</p><p>We also collect usage data automatically, including IP address, browser type, device information, and pages visited.</p></Card>
            <Card icon={Server} title="How We Use Your Data"><p>Your data is used to provide and improve Marketrix, process transactions, send notifications, and prevent fraud.</p><p>We never sell your personal data. Data is shared only with service providers (Stripe, MongoDB) as necessary.</p></Card>
            <Card icon={Lock} title="Data Security"><p>All data is encrypted in transit (TLS 1.3) and at rest. Payment information is processed by Stripe and never stored on our servers.</p></Card>
            <Card icon={UserCheck} title="Your Rights"><p>You can access, update, or delete your personal data through your account settings. Contact <span className="text-chartreuse">privacy@marketrix.com</span> for requests.</p></Card>
          </div>
        </Section>

        {/* TERMS */}
        <Section id="terms" badge="Terms of Service" title="Rules of the road." subtitle="By using Marketrix, you agree to these terms. Please read them carefully.">
          <div className="space-y-4">
            <Card icon={FileText} title="Account Terms"><p>You must be at least 18 years old. You are responsible for your account security. One person may not maintain more than one free account.</p></Card>
            <Card icon={Scale} title="Vendor Obligations"><p>Vendors must only list digital products they have legal right to sell. All products must accurately represent their contents. Marketrix reserves the right to remove violating products.</p></Card>
            <Card icon={RefreshCw} title="Refund Policy"><p>Buyers may request a refund within 14 days if a product does not match its description. Fully downloaded products are generally not eligible unless materially different from the listing.</p></Card>
            <Card icon={AlertTriangle} title="Prohibited Content"><p>Products containing malware, stolen content, or IP-violating material are prohibited. Accounts violating these policies may be suspended without notice.</p></Card>
          </div>
        </Section>

        {/* COOKIES */}
        <Section id="cookies" badge="Cookie Policy" title="How we use cookies." subtitle="Cookies help us provide, protect, and improve Marketrix.">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/8 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Type</span><span className="col-span-2">Purpose</span><span>Duration</span>
            </div>
            {[{ type: "Essential", purpose: "Authentication, security, and core functionality", duration: "Session / 30 days", req: true }, { type: "Functional", purpose: "Preferences, language settings", duration: "1 year", req: false }, { type: "Analytics", purpose: "Usage patterns to improve the platform", duration: "2 years", req: false }].map((c) => (
              <div key={c.type} className="grid sm:grid-cols-4 gap-2 sm:gap-4 px-6 py-5 border-b border-white/6 last:border-0">
                <div className="flex items-center gap-2"><span className="text-sm font-bold">{c.type}</span>{c.req && <span className="rounded-full bg-chartreuse/10 border border-chartreuse/20 px-2 py-0.5 text-[10px] font-bold text-chartreuse">Required</span>}</div>
                <p className="sm:col-span-2 text-sm text-muted-foreground">{c.purpose}</p>
                <span className="text-sm text-muted-foreground">{c.duration}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/3 p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">You can manage cookies in your browser settings. Contact <span className="text-chartreuse">privacy@marketrix.com</span> for questions.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
