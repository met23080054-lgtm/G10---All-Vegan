import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "All Vegan – Nhà hàng chay Hà Nội",
  description: "Đặt món chay ngon tại nhà hàng All Vegan Hà Nội. Ẩm thực thuần chay cao cấp, tươi sạch, bổ dưỡng.",
  keywords: "nhà hàng chay, all vegan, ẩm thực chay, hà nội",
};

export const viewport: Viewport = {
  themeColor: "#6b120b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=nunito:400,500,600,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="max-w-md mx-auto bg-white min-h-screen relative">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
