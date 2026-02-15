import type { Metadata } from "next";
import { Press_Start_2P, Fira_Code } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RETROCOMEBACK - Retro Products Store",
  description:
    "Your portal to the radical 80s. Retro stickers, vintage tech, synthwave apparel and more.",
  keywords: [
    "retro",
    "80s",
    "vintage",
    "synthwave",
    "neon",
    "arcade",
    "retro products",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pressStart2P.variable} ${firaCode.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
