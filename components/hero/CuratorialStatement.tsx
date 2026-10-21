import React from "react";
import { Sparkles, Compass, ShieldCheck } from "lucide-react";

export function CuratorialStatement() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-b border-museum-850 bg-museum-950/40">
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-lime-accent uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5" />
          <span>TUYÊN NGÔN GIÁM TUYỂN • DANH HỌC KHẢO LUẬN</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ivory">
          Khi sự vô tri và tính nghiêm túc gặp nhau tại phòng gym
        </h2>

        <div className="space-y-4 text-museum-300 text-sm sm:text-base leading-relaxed font-serif text-left sm:text-justify max-w-3xl mx-auto pt-2">
          <p>
            Trong lịch sử nhân loại, nghệ thuật luôn nỗ lực nắm bắt cái đẹp hoàn mỹ. Nhưng tại Bảo Tàng Kiệt Tác Đầy Nghi Vấn, chúng tôi đi theo một quỹ đạo ngược lại: vinh danh những khoảnh khắc mà thần thái đi lạc, cơ ngực gồng sai thời điểm và các quyết định thời trang mang tính thách thức vũ trụ.
          </p>
          <p>
            Nhân vật Danh (~1.60m, ~63kg, 2 năm kiên trì đẩy tạ) không đơn thuần là một cá nhân; Danh là một hệ tư tưởng. Đó là biểu tượng của tinh thần: dù tình huống có trớ trêu đến đâu, sự tự tin vẫn phải được duy trì ở mức độ cực đoan nhất.
          </p>
          <p className="italic text-museum-400 border-l-2 border-museum-700 pl-4 py-1">
            "Chúng tôi không sửa ảnh. Chúng tôi không dùng filter cứu vãn danh dự. Chúng tôi chỉ gắn số catalog và để lịch sử tự phán xét." — Ban Giám Tuyển Duy & Đồng Sự.
          </p>
        </div>
      </div>
    </section>
  );
}
