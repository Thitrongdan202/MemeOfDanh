# 🏛️ MEMEOF DANH — THE MUSEUM OF QUESTIONABLE MASTERPIECES

> **“Every image has a story. Most of them should not have happened.”**  
> *Bảo tàng kỹ thuật số đương đại lưu trữ các kiệt tác hình ảnh, video meme và tư liệu lịch sử về nhân vật Danh.*

---

## 1. TỔNG QUAN & KIẾN TRÚC HỆ THỐNG

Dự án là một ứng dụng web bảo tàng nghệ thuật cao cấp (**Digital Art Museum**) được tái thiết kế toàn diện từ nền tảng cũ, kết hợp phong cách **Dark Editorial Luxury** (đen than, xám chì, chữ trắng ngà, điểm nhấn vàng chanh acid lime) cùng các chuyển động mượt mà của **GSAP Motion System** và hệ thống giám tuyển thông minh **AI Meme Curator**.

### 🛠️ Tech Stack Lựa Chọn & Lý Do:
- **Next.js 14 (App Router) + React 18 + TypeScript (Strict Mode):** Cung cấp hiệu năng SSR/Streaming vượt trội, phục vụ cả hình ảnh và video dung lượng lớn qua chuẩn HTTP Range Streaming (RFC 7233).
- **Tailwind CSS:** Hệ thống design token tùy biến theo bảng màu bảo tàng quốc tế (`#07080a`, `#111317`, `#242a35`, `#d4ff32`).
- **GSAP & Framer Motion:** Xử lý opening animation, mask typography reveal, custom magnetic cursor và tương tác card.
- **Sharp:** Tự động tạo thumbnail định dạng WebP siêu nhẹ cho toàn bộ thư viện, tối ưu hóa tốc độ tải ảnh ngoài viewport.
- **Zod:** Kiểm định tính toàn vẹn của dữ liệu trả về từ các mô hình AI Vision.
- **Persistent JSON Manifest & SHA-256 Content Hashing:** Nhận diện file theo mã băm nội dung thay vì tên file. Chống gọi lại API AI không cần thiết, bảo vệ dữ liệu vĩnh viễn với cơ chế ghi file nguyên tử (Atomic Write).

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
C:\Users\thitr\Downloads\Danh
├── app/                           # Next.js App Router
│   ├── api/
│   │   ├── ai/roast/route.ts      # API tạo / tạo lại bình luận AI cho từng ảnh
│   │   ├── manifest/route.ts      # API phục vụ catalog manifest JSON
│   │   ├── media/[...path]/       # Streaming ảnh & video (hỗ trợ 206 Partial Content)
│   │   └── sync/route.ts          # API kích hoạt quét và đồng bộ từ web UI
│   ├── artwork/[id]/              # Trang triển lãm độc lập cho từng kiệt tác (Deep Link & SEO)
│   ├── globals.css                # Style toàn cục, scrollbar bảo tàng, grain texture
│   ├── layout.tsx                 # Root layout, Google Fonts (Playfair Display, Plus Jakarta Sans)
│   └── page.tsx                   # Trang chủ bảo tàng (Grand Foyer, Hero, Stats, Gallery)
├── components/                    # UI Components
│   ├── artwork/
│   │   ├── ArtworkCard.tsx        # Thẻ tác phẩm với hiệu ứng hover, mã catalog DANH-XXX
│   │   └── ArtworkLightbox.tsx    # Lightbox triển lãm chi tiết cao cấp
│   ├── gallery/
│   │   ├── GalleryFilter.tsx      # Bộ lọc tìm kiếm thời gian thực, phân loại media, sắp xếp
│   │   └── GalleryGrid.tsx        # Bố cục Masonry nhịp điệu bảo tàng
│   ├── hero/
│   │   ├── CuratorialStatement.tsx# Tuyên ngôn giám tuyển (Danh học khảo luận)
│   │   └── MuseumHero.tsx         # Hero section, tiêu đề khổng lồ, kiệt tác tiêu biểu, thống kê
│   └── layout/
│       ├── CustomCursor.tsx       # Con trỏ chuột tương tác GSAP mượt mà
│       ├── MuseumFooter.tsx       # Colophon bảo tàng, thông số thể trạng Danh, credit Duy
│       └── MuseumHeader.tsx       # Thanh điều hướng với đồng hồ thực tế, nút đồng bộ nhanh
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
│   └── utils.ts                   # Trợ năng styling và tính toán màu nền tương phản
├── memes/                         # Thư viện ảnh/video gốc (BẢO TOÀN NGUYÊN VẸN 100%)
├── public/
│   ├── thumbnails/                # Bộ nhớ đệm thumbnail WebP đã tối ưu
│   └── favicon.svg                # Monogram bảo tàng MemeOfDanh
├── scripts/
│   ├── sync.ts                    # Script đồng bộ catalog CLI (npm run sync:memes)
│   └── watch.ts                   # Giám sát thư mục thời gian thực (npm run watch:memes)
├── .env.example                   # Mẫu cấu hình biến môi trường
├── package.json                   # Cấu hình dependencies và lệnh chạy
├── tsconfig.json                  # Cấu hình TypeScript
└── README.md                      # Tài liệu hướng dẫn sử dụng
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN WINDOWS

Mở terminal **PowerShell** và di chuyển vào thư mục dự án:

```powershell
cd C:\Users\thitr\Downloads\Danh
```

### Bước 1: Cài đặt Dependencies
Vì chính sách bảo mật PowerShell của Windows có thể chặn script `npm.ps1`, bạn có thể chạy an toàn bằng lệnh `npm.cmd` hoặc `cmd /c npm`:

```powershell
npm.cmd install
```

### Bước 2: Thiết lập biến môi trường (Tùy chọn)
Tạo file `.env.local` từ mẫu `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Nếu chưa cấu hình `AI_API_KEY`, ứng dụng sẽ **tự động chuyển sang chế độ Smart Offline Curator** với kho dữ liệu bình phẩm bảo tàng phong phú mà **không làm sập website hay báo lỗi!**

### Bước 3: Chạy Development Server
```powershell
npm.cmd run dev
```

Mở trình duyệt truy cập: **[http://localhost:3000](http://localhost:3000)**

### Bước 4: Build Production & Khởi chạy chính thức
```powershell
npm.cmd run build
npm.cmd start
```

---

## 4. QUẢN LÝ THƯ VIỆN ẢNH & ĐỒNG BỘ (SYNC SYSTEM)

### Thêm ảnh hoặc video mới:
1. Thả trực tiếp ảnh (`.jpg`, `.png`, `.webp`, `.gif`, v.v.) hoặc video (`.mp4`, `.webm`, `.mov`, v.v.) vào thư mục `memes/` (hoặc thư mục ngoài được cấu hình trong `MEMES_DIR`).
2. Chạy lệnh đồng bộ:
   ```powershell
   npm.cmd run sync:memes
   ```
3. Hệ thống sẽ:
   - Quét toàn bộ file mới.
   - Tính mã hash SHA-256 để kiểm tra trùng lặp hoặc sửa đổi nội dung.
   - Tạo thumbnail WebP tối ưu vào `public/thumbnails/`.
   - Sinh bài bình luận giám tuyển mới cho các file chưa có.
   - Ghi lại an toàn vào `data/manifest.json`.

### Các tùy chọn đồng bộ nâng cao:
- **Chạy thử nghiệm không ghi file (Dry Run):**
  ```powershell
  npm.cmd run sync:memes:dry
  ```
- **Tạo lại toàn bộ lời bình AI cho tất cả ảnh:**
  ```powershell
  npm.cmd run sync:memes:ai
  ```
- **Bật chế độ giám sát tự động thời gian thực (Watch Mode):**
  ```powershell
  npm.cmd run watch:memes
  ```
  *Mỗi khi bạn copy thêm ảnh mới vào `memes/`, hệ thống sẽ tự động cập nhật catalog sau 1.5 giây mà không cần bấm lệnh nào nữa!*

---

## 5. CẤU HÌNH AI MEME CURATOR

Hệ thống hỗ trợ 3 nhà cung cấp (AI Providers):

| Provider | Biến cấu hình | Đặc điểm |
| :--- | :--- | :--- |
| **Offline (Mặc định)** | `AI_PROVIDER=offline` | Hoạt động ngay cả khi không có mạng, không tốn tiền API, bình luận dí dỏm chuẩn tone giám tuyển. |
| **Google Gemini** | `AI_PROVIDER=gemini`<br>`AI_API_KEY=AIzaSy...`<br>`AI_MODEL=gemini-1.5-flash` | Hỗ trợ Gemini Vision phân tích hình ảnh trực quan với chi phí cực thấp hoặc miễn phí. |
| **OpenAI** | `AI_PROVIDER=openai`<br>`AI_API_KEY=sk-...`<br>`AI_MODEL=gpt-4o-mini` | Hỗ trợ GPT-4o Vision. |

### Cơ chế chống lãng phí chi phí AI:
- Mỗi bức ảnh được gắn với mã **SHA-256** của chính nó.
- Nếu bạn đổi tên file nhưng nội dung không đổi, AI **không bị gọi lại**.
- Nếu bạn tải lại trang web 1.000 lần, AI **không bị gọi lại**.
- Chỉ khi nào file bị sửa đổi nội dung thật hoặc người dùng bấm nút **"Bình phẩm lại"** trên giao diện, AI mới tiến hành phân tích lại.

---

## 6. XỬ LÝ LỖI PHỔ BIẾN TRÊN WINDOWS

1. **Lỗi: `File ...\npm.ps1 cannot be loaded because running scripts is disabled...`**
   - *Nguyên nhân:* PowerShell Execution Policy trên Windows hạn chế script `.ps1`.
   - *Giải pháp:* Sử dụng `npm.cmd` thay vì `npm`, ví dụ: `npm.cmd run dev`.

2. **Lỗi đường dẫn thư mục có dấu cách tiếng Việt:**
   - Hệ thống đã tích hợp `encodeURIComponent` và chuẩn hóa path URL, an toàn với mọi tên file tiếng Việt có dấu.

3. **Video không tua được (Scrubbing / Seeking):**
   - API route `/api/media/[...path]` đã tích hợp đầy đủ header `Accept-Ranges: bytes` và `206 Partial Content`. Trình duyệt có thể tua video mượt mà mà không bị tải lại từ đầu.

---

## 7. BẢO VỆ DỮ LIỆU & SAO LƯU

- Thư mục `memes/` gốc chứa 193 files ảnh và video được bảo tồn nguyên vẹn 100%, không bị ghi đè hay xóa bỏ trong bất kỳ tình huống nào.
- Catalog metadata được tự động sao lưu tại `data/metadata-backup/` mỗi khi có thay đổi lớn.
- Mã nguồn đã được cấu hình `.gitignore` chặn rò rỉ `.env` và API keys lên Git.

---

🏛️ **MemeOfDanh** — *Designed with aesthetic rigor, editorial typography, and high-performance engineering.*
