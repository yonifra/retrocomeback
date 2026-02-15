import Link from "next/link";

const footerSections = [
  {
    title: "Shop",
    links: [
      { label: "Products", href: "/products" },
      { label: "Categories", href: "/categories" },
      { label: "New Arrivals", href: "/products?sort=newest" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Orders", href: "/account/orders" },
      { label: "Wishlist", href: "/account/wishlist" },
    ],
  },
  {
    title: "Info",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Returns", href: "/returns" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Link Columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading text-xs text-primary mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="font-heading text-xs text-foreground mb-2">
              JOIN THE RETRO ZONE
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get radical deals and new arrivals straight to your inbox.
            </p>
            <form
              action="#"
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <button
                type="submit"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8">
          <span className="font-heading text-sm neon-text text-primary">
            RETROCOMEBACK
          </span>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 RETROCOMEBACK. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
