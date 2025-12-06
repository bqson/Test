"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MessageCircle, Eye, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";

export const Forum: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      // Use post table instead of forum_posts
      const postsRes = await supabase
        .from("post")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (postsRes.error) throw postsRes.error;

      // Get user info for posts
      const postUserIds = [
        ...new Set((postsRes.data || []).map((p: any) => p.id_user)),
      ];
      const userInfoMap: Record<string, any> = {};

      if (postUserIds.length > 0) {
        // Get traveller and user info
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

      // Transform posts data
      const transformedPosts = (postsRes.data || []).map((post: any) => {
        const userInfo = userInfoMap[post.id_user] || {};

        return {
          ...post,
          id: post.uuid,
          last_activity_at: post.updated_at || post.created_at,
          reply_count: 0, // Can be calculated from post_reply if needed
          view_count: post.total_views || 0,
          is_pinned: false, // Not in schema
          forum_categories: {
            name: post.tags || "General",
            color: "#6366f1", // Default indigo
          },
          profiles: {
            username: userInfo.name || "user",
            avatar_url: userInfo.avatar_url || null,
          },
        };
      });

      setPosts(transformedPosts);

      // Create mock categories from post tags/categories
      const uniqueCategories = Array.from(
        new Set(
          transformedPosts
            .map((p: any) => p.forum_categories?.name)
            .filter(Boolean)
        )
      ).map((name: any) => ({
        id: name.toLowerCase(),
        name,
        color: "#6366f1",
        order_index: 0,
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
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
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
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-traveller/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-traveller">
                      {post.profiles?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${post.forum_categories?.color}20`,
                          color: post.forum_categories?.color,
                        }}
                      >
                        {post.forum_categories?.name}
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
                        {post.view_count}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimeAgo(post.last_activity_at)}
                      </span>
                      <span>by {post.profiles?.username}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-lg shadow-md p-6">
              <h3 className="font-bold text-foreground mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-foreground">
                      {category.name}
                    </span>
                  </div>
                ))}
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
