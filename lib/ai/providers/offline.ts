import { AICurationResponse, NamingCandidate } from "../schemas";

interface OfflineContext {
  filename: string;
  mediaType: "image" | "video";
  catalogNumber: number;
  hash: string;
}

// Curated pool of witty, natural Vietnamese meme candidate concepts
const CANDIDATE_PAIRS: Array<{
  a: { title: string; reason: string };
  b: { title: string; reason: string };
  c: { title: string; reason: string };
  best: "A" | "B" | "C";
  selectionReason: string;
  caption: string;
  description: string;
  tags: string[];
  humorStyle: string;
}> = [
  {
    a: {
      title: "Deadline chưa tới, thần thái tới trước",
      reason: "Punchline trực diện, châm biếm sự tự tin vượt quá hoàn cảnh",
    },
    b: {
      title: "Tự tin như thể đã pass test",
      reason: "Gọn gàng, bắt trúng tâm lý dân công nghệ",
    },
    c: {
      title: "Giao diện bình thản, hệ điều hành hoảng loạn",
      reason: "Ví von sự tương phản giữa biểu cảm bề ngoài và nội tâm",
    },
    best: "A",
    selectionReason: "Tự nhiên, nhịp điệu ngắn gọn 8 từ, phản ánh trực tiếp biểu cảm",
    caption: "Tự tin đến mức deadline nhìn thấy cũng chủ động xin gia hạn thêm 2 ngày.",
    description: "Chủ thể nhìn thẳng vào ống kính với tư thế kiên định, bất chấp khung cảnh xung quanh có vẻ hơi hỗn loạn.",
    tags: ["Thần thái", "Deadline", "Tự tin", "Giao diện"],
    humorStyle: "Châm biếm nhẹ nhàng",
  },
  {
    a: {
      title: "Cơ bắp đang cập nhật phiên bản",
      reason: "Gắn liền thực tế 2 năm tập gym với ngôn ngữ hiện đại",
    },
    b: {
      title: "Tập xong vẫn còn nguyên câu hỏi",
      reason: "Ngắn, deadpan, phản ánh biểu cảm hoang mang",
    },
    c: {
      title: "Tạ nặng không bằng lòng nặng trĩu",
      reason: "So sánh hài hước giữa thể lực và tâm lý",
    },
    best: "B",
    selectionReason: "Sắc bén, bắt trọn khoảnh khắc đứng hình ngơ ngác sau set tập",
    caption: "Cơ thể đã vào phòng gym được 2 năm nhưng tâm trí vẫn đang đợi xe bus ở ngã tư.",
    description: "Khoảnh khắc chụp lại một tư thế thể thao hoặc gồng cơ, kèm biểu cảm hơi trầm tư suy nghĩ.",
    tags: ["Gym", "Biểu cảm", "Tập luyện", "Hoang mang"],
    humorStyle: "Deadpan",
  },
  {
    a: {
      title: "Não vừa thoát ứng dụng bất ngờ",
      reason: "Châm biếm trực tiếp ánh mắt nhìn vô định",
    },
    b: {
      title: "Đang xử lý, vui lòng đừng hỏi",
      reason: "Phong cách câu lệnh hệ thống ngắn gọn, dễ nhớ",
    },
    c: {
      title: "Tâm hồn đã rời khỏi phòng họp",
      reason: "Liên tưởng đời thường sâu sắc",
    },
    best: "B",
    selectionReason: "Nghe như câu nói cửa miệng đời thường của giới trẻ Việt Nam",
    caption: "Ánh mắt cho thấy bộ vi xử lý trung tâm đang bận khởi động lại ở chế độ an toàn.",
    description: "Chân dung cận cảnh với ánh nhìn không có tiêu cự rõ ràng, biểu cảm ngưng trệ tự nhiên.",
    tags: ["Vô tri", "Biểu cảm", "Đứng hình", "Chân dung"],
    humorStyle: "Hài hước vô tri",
  },
  {
    a: {
      title: "Mọi chuyện vẫn ổn cho đến giây cuối",
      reason: "Tạo cảm giác hồi hộp của một pha quay xe bất ngờ",
    },
    b: {
      title: "Pha xử lý đi vào lòng đất",
      reason: "Slang mạng cực kỳ quen thuộc và bắt tai",
    },
    c: {
      title: "Sự cố kỹ thuật ngoài ý muốn",
      reason: "Giọng điệu nghiêm túc giả định",
    },
    best: "A",
    selectionReason: "Phản ánh đúng tiết tấu chuyển biến tình huống từ yên ả sang bất ngờ",
    caption: "Kịch bản diễn ra hoàn hảo từ đầu đến 99%, cho đến khi biến số định mệnh xuất hiện.",
    description: "Khung hình ghi lại một hành động đang dở dang kèm một yếu tố bất ngờ ở góc nhìn.",
    tags: ["Bất ngờ", "Pha quay xe", "Hành động", "Khoảnh khắc"],
    humorStyle: "Cà khịa thân thiện",
  },
  {
    a: {
      title: "Đứng đúng vị trí, sai vũ trụ",
      reason: "So sánh không gian viễn tưởng với tình huống thực",
    },
    b: {
      title: "Góc nghiêng 0 độ tự giác",
      reason: "Ngắn, châm biếm tư thế tạo dáng",
    },
    c: {
      title: "Khách mời bất đắc dĩ của bức ảnh",
      reason: "Bắt trúng cảm giác người bị chụp lén",
    },
    best: "C",
    selectionReason: "Tính cụ thể cao, đúng bối cảnh ảnh chụp lén không báo trước",
    caption: "Không hề biết mình đã trở thành nhân vật chính cho đến khi bức ảnh lên nhóm chat.",
    description: "Nhân vật xuất hiện trong tư thế tự nhiên, không chuẩn bị trước cho ống kính.",
    tags: ["Chụp lén", "Hậu trường", "Bất ngờ", "Đời thường"],
    humorStyle: "Quan sát chân thực",
  },
  {
    a: {
      title: "Ánh mắt của người vừa nhận tin sốc",
      reason: "Tả thực biểu cảm căng thẳng tột độ",
    },
    b: {
      title: "Nhìn vậy chứ không ổn đâu",
      reason: "Understatement kinh điển của người Việt",
    },
    c: {
      title: "Nụ cười gượng gạo nhất năm",
      reason: "Nhận diện trực tiếp sự đối lập trong cơ mặt",
    },
    best: "B",
    selectionReason: "Ngắn, tự nhiên, tạo punchline mạnh mẽ mà không cần giải thích",
    caption: "Miệng vẫn nở nụ cười xã giao nhưng trong lòng đã muốn tắt nguồn điện thoại.",
    description: "Biểu cảm cười gượng hoặc nhếch mép nhẹ trong một tình thế khó xử.",
    tags: ["Biểu cảm", "Xã giao", "Khó xử", "Nụ cười"],
    humorStyle: "Understatement",
  },
  {
    a: {
      title: "Tư thế như chuẩn bị combat",
      reason: "Hình ảnh năng động, đầy tính thách thức",
    },
    b: {
      title: "Gồng hết cỡ nhưng quên thở",
      reason: "Chi tiết gym chân thực, cà khịa thân thiện",
    },
    c: {
      title: "Tọa độ nguy hiểm cấp phòng tập",
      reason: "Phóng đại sự việc theo hướng giải trí",
    },
    best: "B",
    selectionReason: "Vừa đúng bối cảnh tập gym vừa tạo tiếng cười lập tức",
    caption: "Hai năm tập luyện rèn giũa để có được giây phút nín thở chụp một tấm ảnh ưng ý.",
    description: "Tư thế gồng tay hoặc đứng thẳng người khoe form dáng trước ống kính.",
    tags: ["Gym", "Gồng cơ", "Tạo dáng", "Thể hình"],
    humorStyle: "Cà khịa thân thiện",
  },
  {
    a: {
      title: "Nhân chứng duy nhất không muốn làm chứng",
      reason: "Hài hước deadpan với phong cách hình sự",
    },
    b: {
      title: "Biết quá nhiều nhưng chọn im lặng",
      reason: "Ngắn, kích thích trí tò mò của người xem",
    },
    c: {
      title: "Cặp mắt phán xét mọi quyết định",
      reason: "Tập trung vào đôi mắt",
    },
    best: "B",
    selectionReason: "Súc tích 7 từ, gợi hình ảnh cực kỳ rõ nét",
    caption: "Đôi mắt nói lên tất cả những điều mà biên bản cuộc họp đã khéo léo bỏ qua.",
    description: "Góc chụp bắt trọn ánh nhìn liếc ngang đầy hoài nghi của chủ thể.",
    tags: ["Phán xét", "Ánh mắt", "Im lặng", "Bí ẩn"],
    humorStyle: "Deadpan",
  },
];

export function getOfflineCuration(ctx: OfflineContext): AICurationResponse {
  // Deterministic selection based on file hash and catalog number
  let seed = Math.abs(ctx.catalogNumber);
  for (let i = 0; i < ctx.hash.length; i++) {
    seed = (Math.imul(seed, 31) + ctx.hash.charCodeAt(i)) >>> 0;
  }

  const index = Math.abs(seed % CANDIDATE_PAIRS.length);
  const item = CANDIDATE_PAIRS[index];

  const candidateA: NamingCandidate = {
    approach: "direct_punchline",
    title: item.a.title,
    rationale: item.a.reason,
  };

  const candidateB: NamingCandidate = {
    approach: "short_meme",
    title: item.b.title,
    rationale: item.b.reason,
  };

  const candidateC: NamingCandidate = {
    approach: "unexpected_grounded",
    title: item.c.title,
    rationale: item.c.reason,
  };

  const selectedTitle =
    item.best === "A"
      ? candidateA.title
      : item.best === "B"
      ? candidateB.title
      : candidateC.title;

  const tags = [...item.tags];
  if (ctx.mediaType === "video" && !tags.includes("Video")) {
    tags.push("Video");
  }

  return {
    candidates: [candidateA, candidateB, candidateC],
    selected_candidate: item.best,
    selection_reason: item.selectionReason,
    title: selectedTitle,
    caption: item.caption,
    description: item.description,
    tags,
    humor_style: item.humorStyle,
    needs_review: false,
  };
}
