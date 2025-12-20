import { IPost, IPostReply } from "@/types/forum";

const API_URL = "http://localhost:8080/posts";

export const forumService = {
    getAll: () => fetch(API_URL).then((res) => res.json()),

    getById: (id: string) =>
        fetch(`${API_URL}/${id}`).then((res) => res.json()),

    create: (post: Partial<IPost>) =>
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
        }).then((res) => res.json()),

    update: (id: string, post: Partial<IPost>) =>
        fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
        }).then((res) => res.json()),

    delete: (id: string) =>
        fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        }).then((res) => res.ok),

    getReplies: (postId: string): Promise<IPostReply[]> =>
        fetch(`${API_URL}/posts/${postId}/replies`).then((res) => res.json()),

    createReply: (postId: string, content: string): Promise<IPostReply> =>
        fetch(`${API_URL}/posts/${postId}/replies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        }).then((res) => res.json()),

    toggleLike: async (id: string) => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/like`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }
        );
        if (!res.ok) throw new Error("Không thể like");
        return res.json();
    },
};
