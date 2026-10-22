# 🏛️ MEMEOF DANH — THE MUSEUM OF QUESTIONABLE MASTERPIECES
## BẢO TÀNG MEME & NHỮNG KIỆT TÁC ĐẦY NGHI VẤN

> **“Every image has a story. Most of them should not have happened.”**  
> *Bảo tàng kỹ thuật số đương đại lưu trữ các kiệt tác hình ảnh, video meme và tư liệu đời thường về nhân vật Danh.*

---

## 1. TỔNG QUAN & ART DIRECTION (LIGHT & DARK EDITORIAL MUSEUM)

Dự án là một **Interactive Digital Art Museum & Personalization Studio** cao cấp:
- **Hệ thống Dual-Theme hoàn chỉnh (Light & Dark Mode):**
  - **Light Mode (Editorial Paper):** Nền `#F5F2EA` (giấy ngà ấm áp), Bề mặt `#FFFEFA` (trắng sứ bảo tàng), Viền `#DDD9CE`, Chữ `#202127`.
  - **Dark Mode (Deep Slate Gallery):** Nền `#0C0E14` (đen than phiến đá trầm sâu), Bề mặt `#141720` (slate mờ đương đại), Viền `#222736`, Chữ `#F0F2F8`.
  - Chống nhấp nháy giao diện (Zero-Flash Hydration) bằng inline script đọc `localStorage` (`memeofdanh_settings_v2`) trước first paint.
- **Personalization Studio (Cài đặt bảo tàng):**
  - **Giao diện (Appearance):** Chuyển Theme (Sáng / Tối / Tự động), 6 bảng màu Accent (Electric Cobalt, Deep Violet, Mint Emerald, Warm Coral, Golden Amber, Noir Monochrome), Mật độ giao diện (Thoáng đãng, Chuẩn, Gọn gàng), Tỉ lệ chữ (Nhỏ, Chuẩn, Lớn).
  - **Chuyển động (Motion & Effects):** Cường độ chuyển động (Tinh tế, Biểu cảm, Điện ảnh), Con trỏ chuột tương tác (Custom Cursor + Spotlight), Hiệu ứng nghiêng 3D (Card Perspective Tilt), Nút hút nam châm (Magnetic Buttons), Hỗ trợ chuẩn Accessible `prefers-reduced-motion`.
  - **Tùy chọn (Preferences):** Âm thanh giao diện tổng hợp (Web Audio API Synthesizer không phụ thuộc file ngoài), Hiển thị thông tin nhanh trên card, Bố cục gallery mặc định (Masonry / Lưới đều), Khôi phục thiết lập gốc 1-click.
- **Hệ thống Typography Tiếng Việt hoàn chỉnh:**
  - **Font Giao diện chính:** `Be Vietnam Pro` (Sans-serif) qua `@fontsource/be-vietnam-pro`, tối ưu hóa 100% cho dấu tiếng Việt.
  - **Font Display / Tiêu đề:** `Noto Serif` (Serif) qua `@fontsource/noto-serif` cho tiêu đề và các câu trích dẫn nghệ thuật.
  - Tự lưu trữ hoàn toàn nội bộ, không lỗi hiển thị, không giật font (FOUT).

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
C:\Users\thitr\Downloads\Danh
├── app/                           # Next.js 14 App Router
│   ├── api/
│   │   ├── ai/roast/route.ts      # API tạo / tạo lại bình luận AI cho từng ảnh
│   │   ├── manifest/route.ts      # API phục vụ catalog manifest JSON
│   │   ├── media/[...path]/       # Streaming ảnh & video (hỗ trợ HTTP 206 Range)
│   │   └── sync/route.ts          # API kích hoạt quét và đồng bộ từ web UI
│   ├── artwork/[id]/              # Trang triển lãm độc lập cho từng kiệt tác
│   ├── typography-test/           # Trang fixture nội bộ kiểm tra toàn bộ bảng chữ tiếng Việt
│   ├── globals.css                # Style toàn cục, import font Be Vietnam Pro & Noto Serif
│   ├── layout.tsx                 # Root layout, metadata tiếng Việt chuẩn
│   └── page.tsx                   # Trang chủ bảo tàng (Hero, Manifesto, Gallery, Lightbox)
├── components/                    # UI Components theo chuẩn Light Editorial
│   ├── artwork/
│   │   ├── ArtworkCard.tsx        # Thẻ tác phẩm nền trắng sứ, viền ấm, hiển thị tỉ lệ tự nhiên
│   │   └── ArtworkLightbox.tsx    # Lightbox triển lãm chi tiết với backdrop blur mờ nhẹ
│   ├── gallery/
│   │   ├── GalleryFilter.tsx      # Thanh tìm kiếm thông minh không dấu/có dấu, tab phân loại
│   │   └── GalleryGrid.tsx        # Bố cục Masonry nhịp điệu bảo tàng
│   ├── hero/
│   │   ├── CuratorialStatement.tsx# Tuyên ngôn giám tuyển (Văn phong dí dỏm, tự nhiên)
│   │   └── MuseumHero.tsx         # Hero section bất đối xứng, kiệt tác tiêu biểu, chỉ số thực
│   └── layout/
│       ├── MuseumFooter.tsx       # Colophon bảo tàng, thông số thể trạng Danh, credit Duy
│       └── MuseumHeader.tsx       # Thanh điều hướng thanh lịch với đồng hồ thực tế
├── data/
│   ├── manifest.json              # Catalog dữ liệu bền vững của 193 tác phẩm
│   └── metadata-backup/           # Bản sao lưu tự động trước các lần đồng bộ lớn
├── lib/
│   ├── ai/
│   │   ├── providers/             # Gemini Vision, OpenAI và Offline Smart Curator
│   │   ├── prompts.ts             # Bộ prompt giám tuyển hóm hỉnh tiếng Việt
│   │   ├── schemas.ts             # Zod schema kiểm tra dữ liệu AI
│   │   └── index.ts               # Bộ điều phối trung tâm AI Curator
│   ├── memes/
│   │   ├── manifest.ts            # Đọc/ghi manifest an toàn (Atomic File Write)
│   │   ├── scanner.ts             # Quét thư mục, tính SHA-256, trích xuất kích thước
│   │   ├── thumbnails.ts          # Sharp WebP thumbnail generator
│   │   └── types.ts               # Định nghĩa TypeScript cho hiện vật bảo tàng
│   └── utils.ts                   # Trợ năng styling và thuật toán tìm kiếm tiếng Việt không dấu
├── memes/                         # Thư viện ảnh/video gốc (BẢO TOÀN NGUYÊN VẸN 100%)
├── public/
│   ├── thumbnails/                # Bộ nhớ đệm thumbnail WebP đã tối ưu
│   └── favicon.svg                # Monogram bảo tàng MemeOfDanh
├── scripts/
│   ├── sync.ts                    # Script đồng bộ catalog CLI (npm run sync:memes)
│   ├── watch.ts                   # Giám sát thư mục thời gian thực (npm run watch:memes)
│   └── take-screenshots.ts        # Script tự động chụp màn hình kiểm thử giao diện
├── .env.example                   # Mẫu cấu hình biến môi trường
├── package.json                   # Cấu hình dependencies và lệnh chạy
├── tsconfig.json                  # Cấu hình TypeScript Strict Mode
└── README.md                      # Tài liệu hướng dẫn sử dụng
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN WINDOWS POWERSHELL

Mở PowerShell và di chuyển vào thư mục dự án:

```powershell
cd C:\Users\thitr\Downloads\Danh
```

### Bước 1: Cài đặt Dependencies
```powershell
npm.cmd install
```

### Bước 2: Thiết lập biến môi trường (Tùy chọn)
```powershell
Copy-Item .env.example .env.local
```
*Ghi chú: Nếu chưa có `AI_API_KEY`, ứng dụng sẽ tự động chạy ở chế độ **Offline Smart Curator** với các bài bình luận tiếng Việt đặc sắc mà không gây bất kỳ lỗi nào!*

### Bước 3: Đồng bộ thư viện & Giám tuyển AI V3.0
```powershell
# Quét và đồng bộ thông thường (tự động bỏ qua file đã có cache để tiết kiệm chi phí/quota)
npm.cmd run sync:memes

# Xem trước phong cách đặt tên trên 3 file mẫu trước khi chạy toàn bộ
npm.cmd run sync:memes -- --preview 3

# Buộc tạo lại metadata bằng AI cho tất cả hiện vật
npm.cmd run sync:memes -- --ai
```

### Bước 4: Chạy Development Server
```powershell
npm.cmd run dev
```
Mở trình duyệt: **[http://localhost:3000](http://localhost:3000)**  
Trang kiểm tra font tiếng Việt: **[http://localhost:3000/typography-test](http://localhost:3000/typography-test)**

### Bước 5: Build Production & Khởi chạy
```powershell
npm.cmd run build
npm.cmd start
```

---

## 4. TÌNH TRẠNG NGHIỆM THU & BẢO TỒN DỮ LIỆU

- **Dữ liệu ảnh gốc:** 193 files ảnh và video trong `memes/` được bảo tồn tuyệt đối 100%.
- **Giao diện sạch:** Đã xóa bỏ 100% đồng hồ số, tên thành phố (Hanoi) và múi giờ; thay bằng thông số thực: trạng thái kho lưu trữ mở và quy mô bộ sưu tập.
- **Hệ thống AI Meme Curator V3.0:**
  - **Provider chính:** Google Gemini Developer API với model mặc định `gemini-3.8-flash`.
  - **Video Understanding:** Tích hợp trực tiếp Google AI File API phân tích toàn bộ diễn biến, cao trào và nhịp điệu của video MP4.
  - **Cơ chế 3 Ứng viên (Candidates A, B, C):** Sinh 3 hướng tiếp cận (Punchline trực tiếp, Ngắn gọn meme, Liên tưởng sáng tạo), tự chọn tiêu đề tối ưu nhất theo ngữ cảnh thực tế.
  - **Phân định rõ ràng:** `title` (ngắn 3-8 từ), `caption` (lời bình châm biếm riêng biệt), `description` (quan sát khách quan).
  - **Provider thứ hai:** Hỗ trợ local AI qua Ollama + `qwen3-vl` với cơ chế kiểm tra kết nối an toàn (không tự động tải model nhiều GB).
  - **Tiết kiệm chi phí & Quota:** Dùng SHA-256 Content Hash chống gọi lại AI khi khởi động lại, đổi theme hoặc chỉnh sửa cài đặt; có hàng đợi retry/backoff khi chạm rate limit.

---

🏛️ **MemeOfDanh** — *Curated with care, art-directed with subtlety, engineered for durability.*
