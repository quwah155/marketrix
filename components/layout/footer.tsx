import Link from "next/link";

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
    <footer className="border-t border-border" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200"
                style={{
                  background: "#00272c",
                  borderColor: "rgba(225,255,81,0.25)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 18L3 8L8 14L11 10L14 14L19 8V18" stroke="#e1ff51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="11" cy="5" r="2" fill="#e1ff51" fillOpacity="0.3" stroke="#e1ff51" strokeWidth="1.5"/>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-foreground">market</span>
                <span style={{ color: "#e1ff51" }}>rix</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium digital products marketplace for creators and buyers worldwide.
            </p>
            {/* Social icons placeholder */}
            <div className="flex items-center gap-3 mt-4">
              {["X", "in", "gh"].map((s) => (
                <div
                  key={s}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground border border-border hover:border-[#e1ff51]/40 hover:text-[#e1ff51] transition-colors cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "#e1ff51" }}>{category}</h3>
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
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "#e1ff51" }} className="font-semibold">Marketrix</span>.
            All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ using Next.js &amp; Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
