"use client";

import { useAuth } from "@/contexts/AuthContext";
import { forumService } from "@/services/forumService";
import { IPost, IPostReply } from "@/types/forum";
import {
    ArrowLeft,
    Calendar,
    Edit3,
    Eye,
    Heart,
    MapPin,
    MessageCircle,
    Send,
    Trash2,
    User,
    UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PostDetailProps {
    postData: IPost;
}

export default function PostDetail({ postData }: PostDetailProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const isOwner = user?.id === postData.user_id;

    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editTitle, setEditTitle] = useState(postData.title || "");
    const [editContent, setEditContent] = useState(postData.content || "");
    const [isSaving, setIsSaving] = useState(false);

    const [replies, setReplies] = useState<IPostReply[]>([]);
    const [replyText, setReplyText] = useState("");
    const [isLiked, setIsLiked] = useState(postData.is_liked || false);
    const [likesCount, setLikesCount] = useState(postData.total_likes || 0);

    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const response = await forumService.getReplies(postData.id);
                setReplies(response);
            } catch (error) {
                console.error("Lỗi tải phản hồi:", error);
            }
        };
        fetchReplies();
    }, [postData.id]);

    const handleToggleLike = async () => {
        if (!user) return alert("Vui lòng đăng nhập!");
        const originalLiked = isLiked;
        const originalCount = likesCount;
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
        try {
            await forumService.toggleLike(postData.id);
        } catch {
            setIsLiked(originalLiked);
            setLikesCount(originalCount);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        try {
            const newReply = await forumService.createReply(
                postData.id,
                replyText
            );
            setReplies([newReply, ...replies]);
            setReplyText("");
        } catch (error) {
            alert("Không thể gửi phản hồi");
        }
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            console.log(postData.id, editTitle, editContent);
            const response = await forumService.update(postData.id!, {
                title: editTitle,
                content: editContent,
            });
            console.log(postData.id, editTitle, editContent);
            if (response) {
                alert("Cập nhật thành công!");
                setIsEditingMode(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Lỗi khi cập nhật bài viết.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: string | Date) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };
    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

        setIsDeleting(true);
        try {
            const response = await forumService.delete(postData.id!);

            if (response) {
                alert("Xóa bài viết thành công!");
                router.push("/forum");
                router.refresh();
            } else {
                alert("Có lỗi xảy ra khi xóa bài viết.");
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted pt-8 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Quay lại
                </button>

                {isOwner && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditingMode(!isEditingMode)}
                            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {isEditingMode ? "Hủy" : "Sửa"}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? "Đang xóa..." : "Xóa"}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 sm:p-8">
                    {isEditingMode ? (
                        <input
                            id="edit-title"
                            aria-label="Tiêu đề bài viết"
                            placeholder="Nhập tiêu đề bài viết..."
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="text-3xl font-bold w-full p-2 border rounded-md mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-foreground mb-4">
                            {postData.title}
                        </h1>
                    )}

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>
                                {(postData.tags || "").split(",")[0] ||
                                    "General"}
                            </span>
                        </div>

                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(postData.created_at)}</span>
                        </div>

                        <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            <span>{postData.total_views} lượt xem</span>
                        </div>

                        <div className="flex items-center ml-auto">
                            <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-secondary flex items-center justify-center border border-border">
                                {postData.profiles?.avatar_url ? (
                                    <img
                                        src={postData.profiles.avatar_url}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-4 h-4 m-1" />
                                )}
                            </div>
                            <span className="font-medium text-foreground">
                                {postData.profiles?.full_name || "Unknown User"}
                            </span>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-foreground mb-12">
                        {isEditingMode ? (
                            <textarea
                                id="edit-content"
                                aria-label="Nội dung bài viết"
                                placeholder="Nhập nội dung bài viết..."
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-4 border rounded-md min-h-[300px] outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            (postData.content || "")
                                .split("\n\n")
                                .map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className="mb-4 leading-relaxed text-base sm:text-lg"
                                    >
                                        {paragraph}
                                    </p>
                                ))
                        )}
                    </div>

                    {isEditingMode && (
                        <button
                            onClick={handleUpdate}
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all mb-8"
                        >
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    )}

                    <div className="flex flex-wrap gap-2 mb-12">
                        {(postData.tags || "").split(",").map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                            >
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 py-4 border-t border-b border-border mb-8">
                        <button
                            onClick={handleToggleLike}
                            className={`flex items-center gap-2 ${
                                isLiked
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                            }`}
                        >
                            <Heart
                                className={`w-6 h-6 ${
                                    isLiked ? "fill-current" : ""
                                }`}
                            />
                            <span className="font-bold">{likesCount}</span>
                        </button>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageCircle className="w-6 h-6" />
                            <span className="font-bold">
                                {replies.length} Comment
                            </span>
                        </div>
                    </div>

                    {/* Comments Section Container */}
                    <div className="border border-border rounded-xl p-6 bg-card">
                        <h3 className="text-xl font-bold text-foreground mb-6">
                            Comments ({postData.reply_count})
                        </h3>

                        {/* Comment Input Box */}
                        <div className="mb-8">
                            <div className="border border-input rounded-lg bg-background p-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                                <textarea
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                    placeholder="Share your thoughts..."
                                    className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[100px] text-foreground placeholder:text-muted-foreground"
                                    maxLength={2000}
                                />
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-border/50">
                                    <span className="text-xs text-muted-foreground">
                                        {replyText.length}/2000
                                    </span>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={!replyText.trim()}
                                        className="flex items-center space-x-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Send</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {postData.reply_count === 0 ? (
                            <div className="bg-secondary/50 rounded-lg p-8 text-center border border-border">
                                <p className="text-muted-foreground">
                                    Chưa có bình luận nào. Hãy là người đầu tiên
                                    bình luận!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 mt-12">
                                {Array.isArray(replies) &&
                                    replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="flex gap-4 group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border">
                                                {reply.profiles?.avatar_url ? (
                                                    <img
                                                        alt="avatar"
                                                        src={
                                                            reply.profiles
                                                                .avatar_url
                                                        }
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <UserIcon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-muted/40 rounded-2xl rounded-tl-none p-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-sm">
                                                            {reply.profiles
                                                                ?.full_name ||
                                                                "Người dùng"}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDate(
                                                                reply.created_at
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed">
                                                        {reply.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
