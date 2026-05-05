import { Metadata } from "next";
import {
  Building2,
  Rocket,
  Users,
  Globe,
  Mail,
  MapPin,
  Clock,
  Newspaper,
  Briefcase,
  TrendingUp,
  Shield,
  Heart,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Marketrix — Company, Blog, Careers & Contact",
  description:
    "Learn about the Marketrix team, read our latest insights, explore career opportunities, and get in touch.",
};

/* ─────────────────────────────────────────────
   Reusable section shell
───────────────────────────────────────────── */
function Section({
  id,
  badge,
  title,
  subtitle,
  children,
}: {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <span className="inline-block mb-4 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-chartreuse border border-chartreuse/20 bg-chartreuse/8">
            {badge}
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ABOUT SECTION
───────────────────────────────────────────── */
function AboutSection() {
  const values = [
    {
      icon: Shield,
      title: "Trust First",
      desc: "Every vendor is vetted and every product reviewed. Quality is non-negotiable.",
    },
    {
      icon: Zap,
      title: "Creator Empowerment",
      desc: "We give vendors the tools, analytics, and audience to build sustainable businesses.",
    },
    {
      icon: Heart,
      title: "Community Driven",
      desc: "Buyers and sellers co-shape the marketplace through reviews, requests, and feedback.",
    },
    {
      icon: Globe,
      title: "Globally Accessible",
      desc: "Available worldwide with multi-currency support and localized experiences.",
    },
  ];

  return (
    <Section
      id="about"
      badge="About Us"
      title="The marketplace built on trust."
      subtitle="Marketrix is a premium digital marketplace connecting creators with buyers who demand quality. We believe digital commerce should feel polished, secure, and fair for everyone."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {values.map((v) => (
          <div
            key={v.title}
            className="glass-card rounded-2xl p-6 transition-all hover:border-chartreuse/30"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-chartreuse/10 border border-chartreuse/20">
              <v.icon className="h-5 w-5 text-chartreuse" />
            </div>
            <h3 className="text-base font-bold">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {v.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: "5K+", label: "Products Listed" },
          { value: "2K+", label: "Verified Vendors" },
          { value: "$2M+", label: "Creator Earnings" },
          { value: "98%", label: "Satisfaction Rate" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/8 bg-white/3 p-5 text-center"
          >
            <p className="text-2xl font-extrabold text-chartreuse">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────────────
   BLOG SECTION
───────────────────────────────────────────── */
function BlogSection() {
  const posts = [
    {
      tag: "Product",
      title: "Introducing Instant Payouts for Vendors",
      excerpt:
        "Vendors can now withdraw their earnings instantly via Stripe Express — no more waiting for weekly payouts.",
      date: "Apr 28, 2026",
    },
    {
      tag: "Growth",
      title: "How Top Vendors Earn $10K/month on Marketrix",
      excerpt:
        "We studied our highest-earning creators to find the patterns that drive consistent revenue.",
      date: "Apr 15, 2026",
    },
    {
      tag: "Engineering",
      title: "Migrating to Next.js 16 — What We Learned",
      excerpt:
        "Our engineering team shares the challenges and wins from upgrading the entire platform.",
      date: "Mar 30, 2026",
    },
  ];

  return (
    <Section
      id="blog"
      badge="Blog"
      title="Latest from the team."
      subtitle="Insights on product updates, growth strategies, and the tech behind Marketrix."
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.title}
            className="glass-card group rounded-2xl p-6 transition-all hover:border-chartreuse/30 flex flex-col"
          >
            <span className="mb-3 inline-block w-fit rounded-full bg-chartreuse/8 border border-chartreuse/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-chartreuse">
              {post.tag}
            </span>
            <h3 className="text-base font-bold leading-snug">{post.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{post.date}</span>
              <span className="text-xs font-medium text-chartreuse group-hover:underline flex items-center gap-1">
                Read more <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────────────
   CAREERS SECTION
───────────────────────────────────────────── */
function CareersSection() {
  const openings = [
    {
      role: "Senior Full-Stack Engineer",
      team: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
    {
      role: "Product Designer",
      team: "Design",
      location: "Remote",
      type: "Full-time",
    },
    {
      role: "Growth Marketing Lead",
      team: "Marketing",
      location: "Remote",
      type: "Full-time",
    },
    {
      role: "Customer Success Manager",
      team: "Support",
      location: "Remote",
      type: "Full-time",
    },
  ];

  const perks = [
    { icon: Globe, label: "Fully remote — work from anywhere" },
    { icon: TrendingUp, label: "Equity in a fast-growing startup" },
    { icon: Clock, label: "Flexible hours, async-first culture" },
    { icon: Rocket, label: "Ship fast, learn faster" },
  ];

  return (
    <Section
      id="careers"
      badge="Careers"
      title="Build the future of commerce."
      subtitle="We're a small, ambitious team reshaping how digital products are bought and sold. Join us."
    >
      {/* Perks */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {perks.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-4"
          >
            <p.icon className="h-4 w-4 flex-shrink-0 text-chartreuse" />
            <span className="text-xs font-medium text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {openings.map((job) => (
          <div
            key={job.role}
            className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-5 transition-all hover:border-chartreuse/30"
          >
            <div>
              <h3 className="text-sm font-bold">{job.role}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {job.team} · {job.location} · {job.type}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-chartreuse">
              Apply <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────────────
   CONTACT SECTION
───────────────────────────────────────────── */
function ContactSection() {
  const channels = [
    {
      icon: Mail,
      title: "Email us",
      value: "support@marketrix.com",
      desc: "For general inquiries and support.",
    },
    {
      icon: Briefcase,
      title: "Partnerships",
      value: "partners@marketrix.com",
      desc: "Interested in collaborating with us?",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Remote-first, Global",
      desc: "Our team works across multiple time zones.",
    },
    {
      icon: Clock,
      title: "Response time",
      value: "< 24 hours",
      desc: "We aim to respond within one business day.",
    },
  ];

  return (
    <Section
      id="contact"
      badge="Contact"
      title="Get in touch."
      subtitle="Have a question, partnership proposal, or need support? We'd love to hear from you."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {channels.map((ch) => (
          <div
            key={ch.title}
            className="glass-card rounded-2xl p-6 transition-all hover:border-chartreuse/30"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-chartreuse/10 border border-chartreuse/20">
              <ch.icon className="h-5 w-5 text-chartreuse" />
            </div>
            <h3 className="text-sm font-bold">{ch.title}</h3>
            <p className="mt-1 text-base font-semibold text-chartreuse">{ch.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{ch.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-chartreuse/5 via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-chartreuse/20 bg-chartreuse/8 px-4 py-1.5">
            <Building2 className="h-3.5 w-3.5 text-chartreuse" />
            <span className="text-xs font-bold uppercase tracking-widest text-chartreuse">
              Marketrix
            </span>
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Powering the next wave of{" "}
            <span className="gradient-text">digital commerce</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            We build the tools, marketplace, and community that help digital
            creators thrive and buyers discover products worth trusting.
          </p>

          {/* Jump links */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              { label: "About", href: "#about", icon: Building2 },
              { label: "Blog", href: "#blog", icon: Newspaper },
              { label: "Careers", href: "#careers", icon: Briefcase },
              { label: "Contact", href: "#contact", icon: Mail },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-sm font-medium transition-all hover:border-chartreuse/30 hover:bg-chartreuse/8 hover:text-chartreuse"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-white/6">
        <AboutSection />
        <BlogSection />
        <CareersSection />
        <ContactSection />
      </div>
    </div>
  );
}
