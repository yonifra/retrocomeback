import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="retro-grid-bg relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Scanline overlay */}
      <div className="scanline-overlay pointer-events-none absolute inset-0" />

      {/* Decorative neon lines */}
      <div className="absolute left-0 top-1/3 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-1/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
          Est. 1985 &bull; Digital Reboot 2026
        </p>

        <h1 className="font-heading text-2xl leading-relaxed neon-text text-primary sm:text-3xl md:text-5xl">
          WELCOME TO
          <br />
          THE RETRO ZONE
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
          Radical stickers, vintage tech, synthwave apparel & neon decor — all
          from the totally tubular 80s.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="font-heading text-xs transition-shadow hover:neon-glow"
          >
            <Link href="/products">
              SHOP NOW
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-heading text-xs border-accent text-accent transition-shadow hover:neon-glow-cyan hover:bg-accent/10"
          >
            <Link href="/categories">BROWSE CATEGORIES</Link>
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
