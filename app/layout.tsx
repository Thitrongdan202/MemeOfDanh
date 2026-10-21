import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEMEOF DANH — Bảo tàng Meme & Những Kiệt Tác Đầy Nghi Vấn",
  description:
    "Kho lưu trữ hình ảnh, video và những khoảnh khắc đời thường của Danh. Sưu tầm và số hóa bởi Duy cùng bình phẩm dí dỏm từ giám tuyển AI.",
  keywords: ["MemeOfDanh", "Bảo tàng meme", "Danh", "Digital Meme Museum", "Meme Việt Nam"],
  authors: [{ name: "Duy" }],
  openGraph: {
    title: "MEMEOF DANH — The Museum of Questionable Masterpieces",
    description: "Mỗi bức ảnh đều có một câu chuyện. Phần lớn trong số đó lẽ ra không nên xảy ra.",
    type: "website",
    locale: "vi_VN",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F2EA",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="bg-museum-bg text-museum-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
