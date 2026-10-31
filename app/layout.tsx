import type { Metadata } from "next";
import {saboFilled,saboOutline,pressStart2P} from "./fonts";
import "./globals.css";
import { Theme } from "@/design-system/theme";

export const metadata: Metadata = {
  title: "Jacob Moya — Space Lab",
  description: "Pixel roots. New dimensions. Jacob Moya's interactive design space.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${saboFilled.variable} ${saboOutline.variable} ${pressStart2P.variable} h-full`}
    >
      <body className="min-h-full flex flex-col"><Theme>{children}</Theme></body>
    </html>
  );
}
