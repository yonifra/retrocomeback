import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchCommand } from "@/components/shared/search-command";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  } catch {
    // Supabase not configured
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header initialUserEmail={userEmail} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchCommand />
      <Toaster />
    </div>
  );
}
