import React from "react";
import { Compass, Quote } from "lucide-react";

export function CuratorialStatement() {
  return (
    <section
      id="curatorial-statement"
      className="w-full py-14 px-4 sm:px-6 lg:px-8 border-b border-museum-border bg-museum-surface scroll-mt-16"
    >
      <div className="max-w-3xl mx-auto space-y-5 text-center">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cobalt uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Tuyên ngôn giám tuyển</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-museum-text leading-snug">
          Khi sự vô tư và tính nghiêm túc cùng xuất hiện trong một khung hình
        </h2>

        <div className="space-y-4 text-museum-secondary text-sm sm:text-base leading-relaxed text-left sm:text-justify pt-1">
          <p>
            Nghệ thuật không chỉ nằm ở những khoảnh khắc được chuẩn bị kỹ lưỡng. Tại bảo tàng này, chúng tôi lưu giữ những giây phút chân thực nhất: khi góc máy chụp lén bắt trọn biểu cảm lạc trôi, khi cơ ngực gồng hết sức giữa một tình huống hoàn toàn ngẫu hứng, hay các lựa chọn thời trang đầy bất ngờ.
          </p>
          <p>
            Nhân vật Danh (~1m60, ~63kg, 2 năm kiên trì đẩy tạ) là nguồn cảm hứng bất tận của dự án. Dù trong hoàn cảnh nào, sự tự tin và kỷ luật rèn luyện của Danh vẫn luôn hiện diện, tạo nên nét hóm hỉnh rất riêng cho từng bức ảnh.
          </p>
        </div>

        <div className="pt-2 text-left p-4 rounded-xl bg-museum-muted border border-museum-border/80">
          <p className="font-serif italic text-xs sm:text-sm text-museum-text leading-relaxed">
            “Mục tiêu của bảo tàng không phải để dìm hàng, mà là để lưu giữ một kỷ niệm đẹp và vui vẻ giữa những người bạn thân. Mỗi bức ảnh là một lát cắt đáng nhớ của tuổi trẻ.”
          </p>
          <div className="text-[11px] font-semibold text-cobalt mt-1.5">
            — Duy & Hội đồng biên tập
          </div>
        </div>
      </div>
    </section>
  );
}
