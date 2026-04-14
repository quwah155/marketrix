import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      {/* Left panel — always dark gradient */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0b1120] via-[#0f1e3d] to-[#1a0b3b] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/20 blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-purple-600/15 blur-[100px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 border border-brand-500/30 mx-auto mb-8 backdrop-blur-sm animate-pulse-glow">
            <svg className="h-7 w-7 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            The marketplace for{" "}
            <span className="gradient-text">premium</span>{" "}
            digital products
          </h2>
          <p className="text-blue-200/80 text-lg leading-relaxed">
            Join thousands of creators and buyers in the world&apos;s best digital product marketplace.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "5K+", label: "Products" },
              { value: "2K+", label: "Vendors" },
              { value: "$2M+", label: "Earned" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-center"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-blue-300/80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 text-left">
            <p className="text-sm text-blue-100/80 italic leading-relaxed">
              &ldquo;Saved me weeks of work. The SaaS starter kit is the best investment I&apos;ve made for my business.&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-7 w-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div>
                <p className="text-xs text-white font-medium">Alex Rivera</p>
                <p className="text-xs text-blue-300/70">Verified Buyer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — respects light/dark mode */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[hsl(var(--background))]">
        <div className="w-full max-w-md animate-slide-up">{children}</div>
      </div>
    </div>
  );
}
