'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateDestinationPostProps {
  destinationId: string;
  destinationName: string;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreateDestinationPost: React.FC<CreateDestinationPostProps> = ({
  destinationId,
  destinationName,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });

  const generateId = (length: number = 6) => {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to create a post');
      return;
    }

    setLoading(true);
    try {
      // Get user's id_user
      const { data: accountData } = await supabase
        .from('account')
        .select('id_user')
        .eq('email', user.email || '')
        .maybeSingle();

      if (!accountData?.id_user) {
        throw new Error('User account not found');
      }

      // Get destination's id_destination
      const { data: destinationData } = await supabase
        .from('destination')
        .select('id_destination')
        .eq('uuid', destinationId)
        .single();

      if (!destinationData?.id_destination) {
        throw new Error('Destination not found');
      }

      // Create post
      const { error } = await supabase
        .from('post')
        .insert([
          {
            id_post: generateId(6),
            id_user: accountData.id_user,
            id_destination: destinationData.id_destination,
            title: formData.title,
            content: formData.content,
            tags: formData.tags || `destination:${destinationName}`,
            total_likes: 0,
            total_views: 0,
          },
        ]);

      if (error) throw error;

      onPostCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Write about {destinationName}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-post bg-background text-foreground"
              placeholder="Give your post a title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-post bg-background text-foreground"
              placeholder="Share your experience, tips, or questions about this destination..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags (optional, comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-post bg-background text-foreground"
              placeholder="travel, tips, review"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-md text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-post hover:bg-post/90 text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Publish Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

