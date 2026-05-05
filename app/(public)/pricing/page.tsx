import { Metadata } from "next";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Marketrix",
  description: "Transparent pricing for vendors on Marketrix. Start free, scale as you grow.",
};

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for creators just getting started.",
    icon: Zap,
    cta: "Get Started",
    href: "/auth/register?role=VENDOR",
    highlight: false,
    features: [
      "Up to 5 products",
      "Standard analytics",
      "Community support",
      "10% platform fee per sale",
      "Weekly payouts",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For established creators who want to grow faster.",
    icon: Crown,
    cta: "Upgrade to Pro",
    href: "/auth/register?role=VENDOR",
    highlight: true,
    features: [
      "Unlimited products",
      "Advanced analytics & insights",
      "Priority support",
      "5% platform fee per sale",
      "Instant payouts",
      "Custom vendor page",
      "Promotional tools",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For teams and agencies with high-volume needs.",
    icon: Rocket,
    cta: "Contact Sales",
    href: "/about#contact",
    highlight: false,
    features: [
      "Everything in Pro",
      "Custom platform fee",
      "Dedicated account manager",
      "API access",
      "White-label options",
      "SLA guarantee",
      "Bulk upload tools",
    ],
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-chartreuse/5 via-transparent to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-chartreuse/20 bg-chartreuse/8 px-4 py-1.5">
            <Crown className="h-3.5 w-3.5 text-chartreuse" />
            <span className="text-xs font-bold uppercase tracking-widest text-chartreuse">Pricing</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Start free. No credit card required. Scale your vendor business with plans that grow with you.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-7 transition-all ${
                plan.highlight
                  ? "border-2 border-chartreuse/40 bg-gradient-to-b from-chartreuse/6 to-transparent shadow-[0_0_40px_-10px_rgba(225,255,81,0.2)]"
                  : "glass-card"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-chartreuse px-4 py-1 text-xs font-bold text-gunmetal">
                  Most Popular
                </span>
              )}

              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-chartreuse/10 border border-chartreuse/20">
                <plan.icon className="h-5 w-5 text-chartreuse" />
              </div>

              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>

              <div className="mt-5 mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>

              <ul className="flex-1 space-y-3 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-chartreuse mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block rounded-xl py-3 text-center text-sm font-bold transition-all ${
                  plan.highlight
                    ? "bg-chartreuse text-gunmetal hover:bg-chartreuse-dim shadow-[0_8px_24px_rgba(225,255,81,0.25)]"
                    : "border border-white/12 bg-white/4 hover:border-chartreuse/30 hover:bg-chartreuse/8 hover:text-chartreuse"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Have questions?{" "}
            <Link href="/about#contact" className="font-medium text-chartreuse hover:underline">
              Contact our team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
