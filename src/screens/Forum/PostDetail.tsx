'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Eye, 
  Send,
  User
} from 'lucide-react';
import { BEN_THANH_POST } from '../../../data/detail';
import { Post } from '../../../types/forum';

export default function PostDetail({ postData = BEN_THANH_POST }: { postData?: Post }) {
  const router = useRouter();
  const [commentText, setCommentText] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

        {/* Main Content Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Featured Image */}
          <div className="w-full h-[400px] relative bg-secondary">
            {postData.image_url ? (
              <img 
                src={postData.image_url} 
                alt={postData.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {postData.title}
            </h1>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{postData.tags[0] || "Unknown Location"}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(postData.created_at)}</span>
              </div>
              
              {/* Views */}
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>{postData.total_views} lượt xem</span>
              </div>

              <div className="flex items-center ml-auto">
                 <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-secondary">
                    {postData.profiles?.avatar_url ? (
                        <img src={postData.profiles.avatar_url} alt="avatar" />
                    ) : <User className="w-4 h-4 m-1"/>}
                 </div>
                 <span className="font-medium text-foreground">{postData.profiles?.username}</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose dark:prose-invert max-w-none text-foreground mb-12">
              {postData.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-base sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Comments Section Container */}
            <div className="border border-border rounded-xl p-6 bg-card">
              <h3 className="text-xl font-bold text-foreground mb-6">
                Comments ({postData.total_comments})
              </h3>

              {/* Comment Input Box */}
              <div className="mb-8">
                <div className="border border-input rounded-lg bg-background p-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[100px] text-foreground placeholder:text-muted-foreground"
                    maxLength={2000}
                  />
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-border/50">
                    <span className="text-xs text-muted-foreground">
                      {commentText.length}/2000
                    </span>
                    <button 
                      className="flex items-center space-x-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>

              {postData.total_comments === 0 ? (
                <div className="bg-secondary/50 rounded-lg p-8 text-center border border-border">
                  <p className="text-muted-foreground">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>Comment list placeholder...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}