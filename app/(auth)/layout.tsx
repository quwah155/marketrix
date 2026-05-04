import React from "react";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#001a1f] via-[#00272c] to-[#05343c] p-12 lg:flex lg:w-[45%] lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
          <div className="absolute bottom-10 right-10 h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[100px]" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-md text-center">
          <BrandLogo showWordmark={false} className="mx-auto mb-8" />

          <h2 className="mb-4 text-3xl font-bold leading-tight text-white">
            A sharper marketplace for{" "}
            <span className="gradient-text">premium digital products</span>
          </h2>
          <p className="text-lg leading-relaxed text-blue-200/80">
            Marketrix helps creators sell polished digital products and helps buyers discover tools worth trusting.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "5K+", label: "Products" },
              { value: "2K+", label: "Vendors" },
              { value: "$2M+", label: "Earned" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-0.5 text-sm text-blue-300/80">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm">
            <p className="text-sm italic leading-relaxed text-blue-100/80">
              &ldquo;The quality bar feels higher here. I can find polished assets fast and trust the vendor behind them.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                A
              </div>
              <div>
                <p className="text-xs font-medium text-white">Amina Cole</p>
                <p className="text-xs text-blue-300/70">Product designer and buyer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[hsl(var(--background))] p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">{children}</div>
      </div>
    </div>
  );
}
