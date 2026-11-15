import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Outfit } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/shared/lib/utils";
import { Provider } from "@/shared/providers/Provider";
import { Toaster } from "@/shared/components/ui/toast";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentForge",
  description: "Build, test, and run AI agents with a visual workflow builder.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        dmSans.variable,
        outfitHeading.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
