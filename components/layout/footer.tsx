import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

const footerLinks = {
  Marketplace: [
    { label: "Browse Products", href: "/products" },
    { label: "Courses", href: "/products?category=COURSES" },
    { label: "Templates", href: "/products?category=TEMPLATES" },
    { label: "Software", href: "/products?category=SOFTWARE" },
  ],
  Vendors: [
    { label: "Become a Vendor", href: "/auth/register?role=VENDOR" },
    { label: "Vendor Dashboard", href: "/dashboard/vendor" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { label: "X", href: "https://x.com" },
  { label: "In", href: "https://linkedin.com" },
  { label: "Gh", href: "https://github.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[radial-gradient(circle_at_top,rgba(225,255,81,0.07),transparent_35%),hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <BrandLogo className="mb-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Premium digital products marketplace for creators and buyers worldwide.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-xs font-bold text-muted-foreground transition-colors hover:border-chartreuse/40 hover:text-chartreuse"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold text-chartreuse">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-chartreuse">Marketrix</span>. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Designed for trusted digital commerce with Next.js and Stripe.
          </p>
        </div>
      </div>
    </footer>
  );
}
