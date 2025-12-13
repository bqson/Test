// app/forum/[postId]/page.tsx
"use client";

import { Navbar } from "@/components/Layout/Navbar";
import CommentSection from "@/screens/Forum/CommentSection";
import PostDetail from "@/screens/Forum/PostDetail";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function PostDetailPage() {
    const params = useParams();
    const postId = params.postId as string;
    const [post, setPost] = useState(null);

    //   useEffect(() => {
    //     const fetchPost = async () => {
    //       const { data, error } = await supabase
    //         .from('post')
    //         .select('*, users(*)')
    //         .eq('uuid', postId)
    //         .single();

    //       if (data) setPost(data);
    //     };

    //     if (postId) fetchPost();
    //   }, [postId]);

    //   if (!post) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <PostDetail />
            {/* <CommentSection /> */}
        </div>
    );
}
