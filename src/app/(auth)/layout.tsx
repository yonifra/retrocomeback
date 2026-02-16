import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center retro-grid-bg px-4">
      {/* Decorative scanline overlay */}
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="font-heading text-xl neon-text text-primary transition-opacity hover:opacity-80"
          >
            RETROCOMEBACK
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
