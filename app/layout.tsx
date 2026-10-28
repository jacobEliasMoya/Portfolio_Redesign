import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Theme } from "@/design-system/theme";

const saboFilled = localFont({
  src: "./fonts/Sabo-Filled.woff",
  variable: "--font-sabo-filled",
  weight: "400",
  display: "swap",
});

const saboOutline = localFont({
  src: "./fonts/Sabo-Regular.woff",
  variable: "--font-sabo-outline",
  weight: "400",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Jacob Moya — Space Lab",
  description: "Pixel roots. New dimensions. Jacob Moya's interactive design space.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${saboFilled.variable} ${saboOutline.variable} h-full`}
    >
      <body className="min-h-full flex flex-col"><Theme>{children}</Theme></body>
    </html>
  );
}
