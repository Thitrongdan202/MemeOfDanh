# 🏛️ MEMEOF DANH — THE MUSEUM OF QUESTIONABLE MASTERPIECES
## BẢO TÀNG MEME & NHỮNG KIỆT TÁC ĐẦY NGHI VẤN

> **“Every image has a story. Most of them should not have happened.”**  
> *Bảo tàng kỹ thuật số đương đại lưu trữ các kiệt tác hình ảnh, video meme và tư liệu đời thường về nhân vật Danh.*

---

## 1. TỔNG QUAN & ART DIRECTION MỚI (LIGHT EDITORIAL MUSEUM)

Dự án đã được thiết kế lại hoàn toàn theo định hướng **Light Editorial Museum** (tạp chí nghệ thuật độc lập đương đại):
- **Bảng màu chủ đạo:**
  - Nền chính: `#F5F2EA` (giấy ngà ấm áp, có vi chất liệu editorial)
  - Bề mặt card / modal: `#FFFEFA` (trắng sứ bảo tàng tinh tế)
  - Vùng phụ trợ: `#ECE8DE` (đá mài sáng, nhã nhặn)
  - Viền: `#DDD9CE` (viền mảnh, tương phản thấp)
  - Chữ chính: `#202127` (đen than graphite, độ tương phản tiêu chuẩn)
  - Chữ phụ: `#686A73` (xám phiến đá, dễ đọc)
  - Điểm nhấn chính: `#4056E8` (electric cobalt cho các nút hành động, trạng thái active)
  - Điểm nhấn phụ: `#EE684A` (warm coral cho mục yêu thích và các badge đặc biệt)
- **Hệ thống Typography Tiếng Việt hoàn chỉnh:**
  - **Font Giao diện chính:** `Be Vietnam Pro` (Sans-serif) — Tích hợp nội bộ qua `@fontsource/be-vietnam-pro`, tối ưu hóa 100% cho dấu tiếng Việt (ă, â, ê, ô, ơ, ư, đ, các dấu thanh và chữ hoa có dấu).
  - **Font Display / Tiêu đề:** `Noto Serif` (Serif) — Tích hợp nội bộ qua `@fontsource/noto-serif` cho tiêu đề và các câu trích dẫn nghệ thuật.
  - Tự lưu trữ (Self-hosted) hoàn toàn trong dependencies, không phụ thuộc vào kết nối CDN bên ngoài, không lỗi hiển thị ký tự.
  - Chiều cao dòng (line-height) được nới rộng tự nhiên, loại bỏ hoàn toàn hiện tượng cắt dấu hoặc dính chữ.

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

### Bước 3: Đồng bộ thư viện
```powershell
npm.cmd run sync:memes
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
- **Font tiếng Việt:** Đã khắc phục triệt để lỗi ký tự, dấu thanh và khoảng cách chữ bằng bộ đôi `Be Vietnam Pro` và `Noto Serif`.
- **Tìm kiếm thông minh:** Tìm `danh`, `gym`, `ao xanh` tìm thấy ngay cả khi dữ liệu có dấu `Danh`, `Áo xanh`, `Phòng gym`.
- **Hiệu năng:** Điểm số build đạt 100% không cảnh báo, video phát trực tiếp với HTTP 206 Partial Content.

---

🏛️ **MemeOfDanh** — *Curated with care, art-directed with subtlety, engineered for durability.*
