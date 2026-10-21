import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/layout/CustomCursor";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-editorial",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MEMEOF DANH — The Museum of Questionable Masterpieces",
  description:
    "Bảo tàng kỹ thuật số lưu trữ các kiệt tác meme và khoảnh khắc lịch sử của Danh. Giám tuyển và bảo tồn bởi Duy.",
  keywords: ["MemeOfDanh", "Bảo tàng meme", "Danh", "Digital Museum", "Curated Memes"],
  authors: [{ name: "Duy" }],
  openGraph: {
    title: "MEMEOF DANH — The Museum of Questionable Masterpieces",
    description: "Every image has a story. Most of them should not have happened.",
    type: "website",
    locale: "vi_VN",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`dark ${sansFont.variable} ${serifFont.variable} ${monoFont.variable}`}
    >
      <body className="bg-museum-950 text-ivory antialiased selection:bg-lime-accent selection:text-museum-950 min-h-screen">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
