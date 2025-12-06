'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Tag, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const commonTags = [
  'Travel Tips',
  'Budget Travel',
  'Solo Travel',
  'Family Travel',
  'Adventure',
  'Food & Culture',
  'Photography',
  'Accommodation',
  'Transportation',
  'Safety',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  onPostCreated,
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Post title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Post content is required');
      return;
    }

    if (!profile?.id_user) {
      setError('You must be logged in to create a post');
      return;
    }

    setLoading(true);

    try {
      const id_post = generateId();
      const allTags = [...selectedTags];
      if (formData.tags.trim()) {
        allTags.push(...formData.tags.split(',').map((t) => t.trim()).filter(Boolean));
      }

      const { error: insertError } = await supabase.from('post').insert({
        id_post,
        id_user: profile.id_user,
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: allTags.length > 0 ? allTags.join(', ') : null,
        total_likes: 0,
        total_views: 0,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message);
      }

      onPostCreated();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-post to-post/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Start Discussion</h2>
                <p className="text-white/80 text-sm">Share with the community</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Best street food in Saigon?"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-post bg-background text-foreground"
              required
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your thoughts, questions, or experiences..."
              rows={6}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-post bg-background text-foreground resize-none"
              required
            />
          </div>

          {/* Quick Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Quick Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-post text-white'
                      : 'bg-muted text-muted-foreground hover:bg-post/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Custom Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-post bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              e.g., Vietnam, Backpacking, First time
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-post hover:bg-post/90 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Post Discussion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

