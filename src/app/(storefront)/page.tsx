import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="retro-grid-bg flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl leading-relaxed neon-text text-primary sm:text-3xl md:text-4xl">
        WELCOME TO
        <br />
        THE RETRO ZONE
      </h1>

      <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
        Radical products from the totally tubular 80s
      </p>

      <Button
        asChild
        size="lg"
        className="mt-10 font-heading text-xs transition-shadow hover:neon-glow"
      >
        <Link href="/products">SHOP NOW</Link>
      </Button>
    </section>
  );
}
