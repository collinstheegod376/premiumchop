import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "PremiumStore — Digital Services Marketplace",
  description: "Nigeria's premier digital services marketplace. Premium subscriptions, mobile numbers, and digital account access.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} font-body antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#111820", color: "#f8f9fa", border: "1px solid rgba(245,158,11,0.3)" },
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
