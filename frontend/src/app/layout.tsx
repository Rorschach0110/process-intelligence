import type { Metadata } from "next";
import { Navigation } from "@/components/layout/navigation";
import { Topbar } from "@/components/layout/topbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Process Intelligence",
  description: "Industrial process intelligence and low-carbon optimization platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-[#f5f5f7] text-[#1d1d1f]">
        <div className="flex min-h-screen bg-[linear-gradient(135deg,#ffffff_0%,#f5f5f7_38%,#e9edf0_100%)]">
          <Navigation />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
