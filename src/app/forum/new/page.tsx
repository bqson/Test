// app/forum/new/page.tsx
"use client";

import { Navbar } from "@/components/Layout/Navbar";
import NewPost from "@/screens/Forum/NewPost";

export default function NewPostPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <NewPost />
        </div>
    );
}
