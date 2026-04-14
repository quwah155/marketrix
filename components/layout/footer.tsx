import Link from "next/link";
import { Store } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary dark:bg-surface-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                quwahmarket<span className="text-brand-500">-saas</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium digital products marketplace for creators and buyers.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} quwahmarket-saas. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ using Next.js & Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}

