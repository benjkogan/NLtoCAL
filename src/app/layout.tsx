import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NLtoCal",
  description: "Natural language to Google Calendar",
  icons: {
    icon: "/favicon.png",
  },
  verification: {
    google: "B0c__q2prIk4MFVYxusv8YFfG181KloTBtXp0MSZEYU",
  },
  openGraph: {
    title: "NLtoCal",
    description: "Natural language to Google Calendar",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NLtoCal",
    description: "Natural language to Google Calendar",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.className}`}>
        <SessionProvider>
          <div className="flex min-h-screen flex-col items-center bg-pattern px-6">
            <Header />
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
