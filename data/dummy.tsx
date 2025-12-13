import { Post } from "../types/forum";

export const DUMMY_POSTS: Post[] = [
    {
        id: "1",
        id_post: "post_01",
        id_user: "user_01",
        title: "Kinh nghiệm đi phượt Hà Giang mùa hoa tam giác mạch",
        content:
            "Mọi người cho mình hỏi đi Hà Giang tầm tháng 10 thì nên chuẩn bị những gì? Đường đi có khó không và nên thuê xe máy ở đâu uy tín ạ? Mình định đi 3 ngày 2 đêm.",
        tags: ["hagiang", "phuot", "review"],
        category: "Travel Tips",
        status: "published",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        total_likes: 45,
        total_views: 1205,
        total_comments: 12,
        profiles: {
            id_user: "user_01",
            username: "MinhTraveller",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Minh",
        },
    },
    {
        id: "2",
        id_post: "post_02",
        id_user: "user_02",
        title: "Review chuyến đi Đà Lạt 4N3Đ cực chill",
        content:
            "Đà Lạt mùa này đẹp lắm các bác ơi. Mình vừa đi về và có list ra một số quán cafe view đẹp và homestay giá rẻ cho mọi người tham khảo nhé...",
        tags: ["dalat", "review", "homestay"],
        category: "Destinations",
        status: "published",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        total_likes: 120,
        total_views: 3400,
        total_comments: 45,
        profiles: {
            id_user: "user_02",
            username: "SarahNguyen",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        },
    },
    {
        id: "3",
        id_post: "post_03",
        id_user: "user_03",
        title: "Hỏi về Gear leo núi Bà Đen",
        content:
            "Cuối tuần này team mình định leo núi Bà Đen cung đường cột điện. Cho mình hỏi cần chuẩn bị giày loại nào thì bám tốt ạ? Có cần mang nhiều nước không?",
        tags: ["trekking", "gear", "question"],
        category: "Gear & Equipment",
        status: "published",
        created_at: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 2
        ).toISOString(), // 2 days ago
        total_likes: 15,
        total_views: 560,
        total_comments: 8,
        profiles: {
            id_user: "user_03",
            username: "HungTrekking",
            avatar_url: null, // Test trường hợp không có avatar
        },
    },
];
