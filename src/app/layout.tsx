
import { Toaster } from "react-hot-toast";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";

import Providers from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MentorLagbe | Find Your Perfect Mentor",
    template: "%s | MentorLagbe",
  },
  description:
    "Find verified tutors, explore tuition opportunities, and connect with expert mentors through MentorLagbe.",
  applicationName: "MentorLagbe",
  keywords: [
    "MentorLagbe",
    "Online Tuition",
    "Home Tuition",
    "Tutors in Bangladesh",
    "Student Mentorship",
    "Education Marketplace",
  ],
  authors: [{ name: "MentorLagbe Team" }],
  creator: "MentorLagbe",
  openGraph: {
    title: "MentorLagbe | Find Your Perfect Mentor",
    description:
      "Discover trusted tutors and personalized learning opportunities.",
    siteName: "MentorLagbe",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5EF" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1420" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>

        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={10}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#101827",
              color: "#FFFFFF",
              border: "1px solid #D6B36C",
              borderRadius: "12px",
              padding: "13px 16px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            },
            success: {
              iconTheme: {
                primary: "#42D9A3",
                secondary: "#101827",
              },
            },
            error: {
              iconTheme: {
                primary: "#F87171",
                secondary: "#101827",
              },
            },
            loading: {
              iconTheme: {
                primary: "#D6B36C",
                secondary: "#101827",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
