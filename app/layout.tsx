import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings/SettingsContext";
import { InteractiveCursor } from "@/components/cursor/InteractiveCursor";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";

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
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        {/* Anti-flash script for persistent theme before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem("memeofdanh_settings_v2");
                if (stored) {
                  var parsed = JSON.parse(stored);
                  var isDark = parsed.theme === "dark" || (parsed.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                  if (isDark) {
                    document.documentElement.classList.add("dark");
                    document.documentElement.classList.remove("light");
                  } else {
                    document.documentElement.classList.add("light");
                    document.documentElement.classList.remove("dark");
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-museum-bg text-museum-text antialiased min-h-screen">
        <SettingsProvider>
          <InteractiveCursor />
          {children}
          <SettingsDrawer />
        </SettingsProvider>
      </body>
    </html>
  );
}
