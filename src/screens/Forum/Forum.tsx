"use client";

import { IPost } from "@/types/forum";
import { Clock, Eye, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export interface ICategory {
    id: string;
    name: string;
    color: string;
}

const getCategoryColor = (category: string) => {
    switch (category) {
        case "Travel Tips":
            return "#10b981";
        case "Destinations":
            return "#3b82f6";
        case "Gear & Equipment":
            return "#f59e0b";
        default:
            return "#6366f1";
    }
};

export const Forum: React.FC = () => {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    useEffect(() => {
        fetchForumData();
    }, []);

    const fetchForumData = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/posts`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch forum data");
            }

            const rawData = await res.json();
            const rawPosts = Array.isArray(rawData)
                ? rawData
                : rawData.data || [];

            const postUserIds = [
                ...new Set(rawPosts.map((p: any) => p.id_user)),
            ];

            const userInfoMap: Record<string, any> = {};

            if (postUserIds.length > 0) {
                const { data: travellers } = await supabase
                    .from("traveller")
                    .select("id_user")
                    .in("id_user", postUserIds);

                const travellerIds = travellers?.map((t) => t.id_user) || [];

                if (travellerIds.length > 0) {
                    const { data: users } = await supabase
                        .from("users")
                        .select("id_user, name, avatar_url")
                        .in("id_user", travellerIds);

                    users?.forEach((u: any) => {
                        userInfoMap[u.id_user] = u;
                    });
                }
            }

            const transformedPosts: IPost[] = rawPosts.map((post: any) => {
                const userInfo = userInfoMap[post.id_user] || {};
                const categoryName = post.tags || "General";
                return {
                    ...post,
                    id: post.id || post.uuid,
                    last_activity_at: post.updated_at || post.created_at,
                    reply_count: post.reply_count || 0,
                    view_count: post.total_views || 0,
                    is_pinned: false,
                    forum_categories: {
                        name: categoryName,
                        color: getCategoryColor(categoryName),
                    },
                    profiles: {
                        username: userInfo.name || "User",
                        avatar_url: userInfo.avatar_url || null,
                    },
                };
            });

            setPosts(transformedPosts);

            const uniqueCategories = Array.from(
                new Set(
                    transformedPosts
                        .map((p: any) => p.forum_categories?.name)
                        .filter(Boolean)
                )
            ).map((name: any) => ({
                id: name.toLowerCase().replace(/\s+/g, "-"),
                name,
                color: getCategoryColor(name),
            }));

            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching forum data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000
        );

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-post"></div>
            </div>
        );
    }

    const filteredPosts = selectedCategory
        ? posts.filter(
              (post) => post.forum_categories?.name === selectedCategory
          )
        : posts;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Community Forum
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Share experiences and ask questions
                        </p>
                    </div>
                    <Link
                        href="/forum/new"
                        className="flex items-center space-x-2 bg-post hover:bg-post/90 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Post</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                        {filteredPosts.length === 0 ? (
                            <div className="bg-card rounded-lg p-12 text-center border-2 border-dashed">
                                <p className="text-muted-foreground">
                                    No posts found in this category.
                                </p>
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/forum/${post.id}`}
                                    className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-traveller/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-traveller">
                                                {post.profiles?.full_name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span
                                                    className="text-xs px-2 py-1 rounded"
                                                    style={{
                                                        backgroundColor: `${post.forum_categories?.color}20`,
                                                        color: post
                                                            .forum_categories
                                                            ?.color,
                                                    }}
                                                >
                                                    {
                                                        post.forum_categories
                                                            ?.name
                                                    }
                                                </span>
                                                {post.is_pinned && (
                                                    <span className="text-xs bg-trip/20 text-trip px-2 py-1 rounded">
                                                        Pinned
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                                {post.content}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                <span className="flex items-center">
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    {post.reply_count}
                                                </span>
                                                <span className="flex items-center">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    {post.total_views}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {formatTimeAgo(
                                                        post.last_activity_at
                                                    )}
                                                </span>
                                                <span>
                                                    by{" "}
                                                    {post.profiles?.full_name ||
                                                        "User"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-card rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-foreground mb-4">
                                Categories
                            </h3>
                            <div className="space-y-2">
                                <div
                                    onClick={() => setSelectedCategory(null)}
                                    className={`flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer transition-colors ${
                                        selectedCategory === null
                                            ? "bg-muted font-bold"
                                            : ""
                                    }`}
                                >
                                    <span className="text-sm text-foreground">
                                        All Topics
                                    </span>
                                </div>
                                {categories.map((category) => {
                                    const isActive =
                                        selectedCategory === category.name;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                setSelectedCategory(
                                                    category.name
                                                )
                                            }
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                                                isActive
                                                    ? "shadow-md scale-105"
                                                    : "bg-card border-border hover:bg-muted"
                                            }`}
                                            style={{
                                                borderColor: isActive
                                                    ? category.color
                                                    : undefined,
                                                backgroundColor: isActive
                                                    ? `${category.color}15`
                                                    : undefined,
                                                color: isActive
                                                    ? category.color
                                                    : undefined,
                                            }}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        category.color,
                                                }}
                                            />
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-post to-post/80 rounded-lg shadow-md p-6 text-white">
                            <h3 className="font-bold mb-2">Forum Guidelines</h3>
                            <ul className="text-sm space-y-2">
                                <li>Be respectful and friendly</li>
                                <li>Share your experiences</li>
                                <li>Help fellow travelers</li>
                                <li>No spam or self-promotion</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
