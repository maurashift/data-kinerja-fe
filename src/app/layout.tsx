import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../components/styles/globals.css";

// Import Provider dan LayoutWrapper
import { BrandingProvider } from "@/src/providers/BrandingProvider";
import LayoutWrapper from "@/src/components/global/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Kinerja",
  description: "Aplikasi Data Kinerja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* 1. Provider Data (Paling Luar) */}
        <BrandingProvider>
            {/* 2. Wrapper Tampilan (Sidebar & Header) */}
            <LayoutWrapper>
                {/* 3. Halaman Konten */}
                {children}
            </LayoutWrapper>
        </BrandingProvider>
      </body>
    </html>
  );
}