import React from "react";
import Link from "next/link";

export default function TypographyTestPage() {
  const sampleVowels = [
    "a à á ả ã ạ - ă ằ ắ ẳ ẵ ặ - â ầ ấn ẩ ẫ ậ",
    "e è é ẻ ẽ ẹ - ê ề ế ể ễ ệ",
    "i ì í ỉ ĩ ị",
    "o ò ó ỏ õ ọ - ô ồ ố ổ ỗ ộ - ơ ờ ớ ở ỡ ợ",
    "u ù ú ủ ũ ụ - ư ừ ứ ử ữ ự",
    "y ỳ ý ỷ ỹ ỵ",
    "đ Đ",
  ];

  const sampleUpperVowels = [
    "A À Á Ả Ã Ạ - Ă Ằ Ắ Ẳ Ẵ Ặ - Â Ầ Ấ Ẩ Ẫ Ậ",
    "E È É Ẻ Ẽ Ẹ - Ê Ề Ế Ể Ễ Ệ",
    "I Ì Í Ỉ Ĩ Ị",
    "O Ò Ó Ỏ Õ Ọ - Ô Ồ Ố Ổ Ỗ Ộ - Ơ Ờ Ớ Ở Ỡ Ợ",
    "U Ù Ú Ủ Ũ Ụ - Ư Ừ Ứ Ử Ữ Ự",
    "Y Ỳ Ý Ỷ Ỹ Ỵ",
  ];

  const testHeadings = [
    "Những khoảnh khắc lịch sử của Danh",
    "Bảo tàng kỹ thuật số lưu trữ các kiệt tác đầy nghi vấn",
    "SỰ CĂNG THẲNG CỦA KHỐI CƠ SAU HAI NĂM TẬP LUYỆN",
    "Kỷ luật sắt, góc máy bất ổn và sự vô tư tuyệt đối",
  ];

  const testParagraphs = [
    "Ban giám khảo xác nhận: tác phẩm này không cần giải thích, chỉ cần người chịu trách nhiệm. Một khoảnh khắc bình thường được xử lý bằng mức độ tự tin vượt xa ngân sách dự án.",
    "Theo hồ sơ bảo tàng, đây là bằng chứng cho thấy sự nghiêm túc và sự vô tri có thể cùng tồn tại hài hòa trong một khung hình. Dù tình huống có trớ trêu đến đâu, thần thái vẫn phải được duy trì ở mức tối đa.",
    "Nhiếp ảnh gia Duy đã bắt trọn khoảnh khắc Danh tin rằng mình là trung tâm vũ trụ, dù vũ trụ chưa hề đồng thuận. Tác phẩm không tìm kiếm sự thấu hiểu từ đám đông; nó chỉ đứng đó như một tượng đài bất khuất.",
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 bg-museum-bg min-h-screen">
      <div className="border-b border-museum-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-museum-text">
            Kiểm tra hiển thị Typography Tiếng Việt
          </h1>
          <p className="text-sm text-museum-secondary mt-1">
            Xác minh hiển thị Be Vietnam Pro (Giao diện) & Noto Serif (Tiêu đề)
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-cobalt text-white text-xs font-semibold hover:bg-cobalt-hover"
        >
          Về trang chủ
        </Link>
      </div>

      {/* Interface Font: Be Vietnam Pro */}
      <section className="p-6 rounded-xl bg-museum-surface border border-museum-border space-y-6">
        <div className="flex items-center justify-between border-b border-museum-border pb-3">
          <h2 className="text-lg font-bold text-museum-text">
            1. Font Giao diện — Be Vietnam Pro (Sans-serif)
          </h2>
          <span className="text-xs text-museum-subtle font-mono">
            'Be Vietnam Pro', sans-serif
          </span>
        </div>

        {/* Weights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded bg-museum-muted font-normal">
            <span className="text-xs text-museum-subtle block">Regular 400</span>
            Khảo cứu Danh học
          </div>
          <div className="p-3 rounded bg-museum-muted font-medium">
            <span className="text-xs text-museum-subtle block">Medium 500</span>
            Khảo cứu Danh học
          </div>
          <div className="p-3 rounded bg-museum-muted font-semibold">
            <span className="text-xs text-museum-subtle block">Semibold 600</span>
            Khảo cứu Danh học
          </div>
          <div className="p-3 rounded bg-museum-muted font-bold">
            <span className="text-xs text-museum-subtle block">Bold 700</span>
            Khảo cứu Danh học
          </div>
        </div>

        {/* Vowels and tone marks */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase font-semibold text-museum-secondary tracking-wider">
            Bảng nguyên âm có dấu (Chữ thường)
          </h3>
          <div className="p-4 rounded-lg bg-museum-muted/60 space-y-1 font-mono text-xs text-museum-text">
            {sampleVowels.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase font-semibold text-museum-secondary tracking-wider">
            Bảng nguyên âm có dấu (Chữ hoa)
          </h3>
          <div className="p-4 rounded-lg bg-museum-muted/60 space-y-1 font-mono text-xs text-museum-text">
            {sampleUpperVowels.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>

        {/* Paragraphs */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-semibold text-museum-secondary tracking-wider">
            Đoạn văn bản tiếng Việt dài (Line-height & Kerning)
          </h3>
          {testParagraphs.map((para, idx) => (
            <p key={idx} className="text-sm text-museum-text leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Display Font: Noto Serif */}
      <section className="p-6 rounded-xl bg-museum-surface border border-museum-border space-y-6">
        <div className="flex items-center justify-between border-b border-museum-border pb-3">
          <h2 className="text-lg font-bold text-museum-text">
            2. Font Display — Noto Serif
          </h2>
          <span className="text-xs text-museum-subtle font-mono">
            'Noto Serif', serif
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-semibold text-museum-secondary tracking-wider font-sans">
            Tiêu đề nghệ thuật và trích dẫn
          </h3>
          {testHeadings.map((h, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-museum-muted/40">
              <div className="font-serif text-2xl font-bold text-museum-text leading-snug">
                {h}
              </div>
            </div>
          ))}
        </div>

        {/* Pull quote italic */}
        <div className="p-6 rounded-lg border-l-4 border-cobalt bg-cobalt-light/40 space-y-2">
          <div className="font-serif italic text-lg text-museum-text leading-relaxed">
            “Mỗi bức ảnh đều có một câu chuyện. Phần lớn trong số đó lẽ ra không nên xảy ra.”
          </div>
          <div className="text-xs font-semibold text-cobalt font-sans">
            — Lời tựa từ Giám tuyển Duy & Đồng sự
          </div>
        </div>
      </section>
    </div>
  );
}
