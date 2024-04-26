import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { Toaster } from "~/components/ui/toaster";
import AuthProvider from "~/context/AuthProvider";

export const metadata = {
  title: "Next.js",
  description: "Generated by Next.js",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={`font-sans ${inter.variable}`}>
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}
