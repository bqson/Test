import { Post } from "../types/forum";

export const BEN_THANH_POST: Post = {
    id: "ben_thanh_01",
    id_post: "post_ben_thanh_01",
    id_user: "user_duy_phu",
    title: "Chợ Bến Thành",
    content: `Một trong những địa điểm nổi tiếng nhất Sài Gòn, Chợ Bến Thành là biểu tượng của thành phố. Với kiến trúc độc đáo kết hợp giữa phong cách Pháp và truyền thống địa phương, chợ này không chỉ là nơi mua sắm mà còn là điểm đến du lịch hấp dẫn.\n\nBên trong chợ, bạn sẽ tìm thấy hàng trăm cửa hàng bán đủ thứ: từ quần áo, phụ kiện, đến đồ lưu niệm và hàng hóa địa phương. Không khí sôi động với tiếng thị đó của những tiểu thương tạo nên một trải nghiệm mua sắm độc đáo và thú vị.\n\nTôi rất thích ghé thăm chợ vào buổi sáng sớm khi không quá đông đúc. Bạn có thể tìm được nhiều món hàng chất lượng với giá hợp lý nếu biết thương lượng. Cách tốt nhất là dạo bộ quanh chợ, khám phá các gian hàng, và cảm nhận không khí văn hóa độc đáo của Sài Gòn.`,
    tags: ["HoChiMinh", "Culture", "Market", "Travel"],
    category: "Destinations",
    image_url:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070&auto=format&fit=crop",
    status: "published",
    created_at: "2025-12-15T08:00:00Z",
    total_likes: 18,
    total_views: 324,
    total_comments: 0,
    profiles: {
        id_user: "user_duy_phu",
        username: "Duy Phu",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DuyPhu",
    },
    user_has_liked: false,
};
