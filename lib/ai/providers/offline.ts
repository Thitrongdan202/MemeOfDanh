import { AICurationResponse } from "../schemas";

interface OfflineContext {
  filename: string;
  mediaType: "image" | "video";
  catalogNumber: number;
  hash: string;
}

const ARTWORK_TITLES = [
  "Nghi thức trước giờ G",
  "Sự im lặng của khối cơ 2 năm",
  "Thần thái vượt ngoài ngân sách",
  "Bản giao hưởng của sự vô tri",
  "Chiến lược phòng gym không lối thoát",
  "Khoảnh khắc lịch sử bị chụp lén",
  "Vũ trụ song song nơi Danh làm stylist",
  "Tác phẩm số 42: Đỉnh cao bất động",
  "Thử thách trọng lực và sự điềm tĩnh",
  "Tuyên ngôn nghệ thuật lúc nửa đêm",
  "Ánh mắt của người nắm giữ bí mật",
  "Sự bất lực mang tính học thuật",
  "Hậu trường không có kịch bản",
  "Cuộc viễn chinh không có bản đồ",
  "Độ phân giải thấp, sự tự tin 4K",
  "Bằng chứng ngoại phạm của sự nghiêm túc",
  "Chân dung người gánh team trong vô vọng",
  "Bi kịch của sự tập trung cao độ",
  "Nghệ thuật sinh tồn giữa các ống kính",
  "Tiếng thở dài của máy ảnh Leica",
];

const CURATOR_CAPTIONS = [
  "Ban giám khảo xác nhận: tác phẩm này không cần giải thích, chỉ cần người chịu trách nhiệm.",
  "Một khoảnh khắc bình thường được xử lý bằng mức độ tự tin vượt xa ngân sách dự án.",
  "Theo hồ sơ bảo tàng, đây là bằng chứng cho thấy sự nghiêm túc và sự vô tri có thể tồn tại trong cùng một khung hình.",
  "Sự căng thẳng của khối cơ sau 2 năm rèn luyện không cứu vãn nổi ánh mắt đang lạc trôi về một chiều không gian khác.",
  "Nhiếp ảnh gia đã bắt trọn giây phút chủ thể tin rằng mình là trung tâm vũ trụ, dù vũ trụ chưa đồng thuận.",
  "Một bố cục đầy tính chiêm nghiệm: ánh sáng hoàn hảo, góc nghiêng chuẩn mực, chỉ có mục đích là hoàn toàn bí ẩn.",
  "Được các chuyên gia đánh giá là bước ngoặt trong phong trào biểu cảm tự phát của thế kỷ 21.",
  "Độ căng của khung hình tỷ lệ thuận với mức độ khó hiểu của người xem.",
  "Khung hình ghi lại sự giao thoa hiếm hoi giữa kỷ luật thép phòng tập và sự thả lỏng tuyệt đối của nhận thức.",
  "Tác phẩm chứng minh rằng không cần kỹ xảo điện ảnh, chỉ cần một góc máy chân thực là đủ tạo ra tấn bi kịch hài hước.",
  "Hội đồng nghệ thuật quyết định miễn giải trình cho tác phẩm vì không ai đủ can đảm đối thoại trực tiếp.",
  "Sự đĩnh đạc lạ lùng của một cá nhân đang cố gắng kiểm soát tình thế đã vượt khỏi tầm tay từ 5 phút trước.",
  "Khoảnh khắc hiếm hoi khi thời trang, hình thể và sự lúng túng hòa quyện thành một thể thống nhất.",
  "Một nghiên cứu sâu sắc về tác động của trọng lực lên biểu cảm con người sau hai hiệp tập nặng.",
  "Tác phẩm không tìm kiếm sự thấu hiểu từ đám đông; nó chỉ đứng đó như một tượng đài bất khuất.",
];

const DESCRIPTIONS = [
  "Góc máy tĩnh ghi lại biểu cảm có chiều sâu nội tâm nhưng thiếu định hướng hành động. Ánh sáng tự nhiên phản chiếu tinh thần bất khuất.",
  "Tác phẩm được bảo tồn nguyên trạng nhằm nhắc nhở hậu thế về giá trị của những quyết định bộc phát trong cuộc sống đời thường.",
  "Kỹ thuật lấy nét chọn lọc làm nổi bật chủ thể giữa một bối cảnh hỗn loạn, tượng trưng cho sự cô đơn của kẻ đi trước thời đại.",
  "Một hiện vật quý hiếm từ bộ sưu tập tư nhân của Duy, được số hóa để phục vụ nghiên cứu nhân chủng học kỹ thuật số.",
  "Sự tương phản gay gắt giữa ánh sáng và bóng tối gợi mở những suy tư triết học về bản chất của các buổi đi chơi không báo trước.",
];

const TAG_POOLS = [
  ["Bảo tàng", "Biểu cảm", "Kỷ luật thép", "Hệ tư tưởng"],
  ["Gym", "Thần thái", "Vô tri", "Nghệ thuật đương đại"],
  ["Hậu trường", "Khoảnh khắc vàng", "Tự tin", "Chứng cứ pháp y"],
  ["Chân dung", "Không gian sâu", "Bất khả giải thích", "Danh học"],
  ["Tuyệt phẩm", "Duy ghi hình", "Ánh mắt", "Sự cố kỹ thuật"],
];

const HUMOR_STYLES = [
  "Giám tuyển bác học",
  "Châm biếm hóm hỉnh",
  "Tán dương bất lực",
  "Triết học đường phố",
  "Phân tích pháp y nghệ thuật",
];

export function getOfflineCuration(ctx: OfflineContext): AICurationResponse {
  // Deterministic positive selection based on file hash and catalog number
  let seed = Math.abs(ctx.catalogNumber);
  for (let i = 0; i < ctx.hash.length; i++) {
    seed = (Math.imul(seed, 31) + ctx.hash.charCodeAt(i)) >>> 0;
  }

  const titleIdx = Math.abs(seed % ARTWORK_TITLES.length);
  const titleBase = ARTWORK_TITLES[titleIdx];
  const title = `${titleBase} (Hồ sơ #${ctx.catalogNumber.toString().padStart(3, "0")})`;

  const captionIdx = Math.abs((seed >>> 2) % CURATOR_CAPTIONS.length);
  const caption = CURATOR_CAPTIONS[captionIdx];

  const descIdx = Math.abs((seed >>> 4) % DESCRIPTIONS.length);
  const description = DESCRIPTIONS[descIdx];

  const tagIdx = Math.abs((seed >>> 6) % TAG_POOLS.length);
  const tags = [...TAG_POOLS[tagIdx]];

  if (ctx.mediaType === "video") {
    tags.push("Chuyển động", "Tư liệu sống");
  } else {
    tags.push("Nhiếp ảnh");
  }

  const humorIdx = Math.abs((seed >>> 8) % HUMOR_STYLES.length);
  const humor_style = HUMOR_STYLES[humorIdx];

  return {
    title,
    caption,
    description,
    tags,
    humor_style,
  };
}
