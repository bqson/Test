'use client';

import React, { useState } from 'react';
import { X, Users, MapPin, Calendar, Globe, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SingleImageUploader } from '../../components/Upload/ImageUploader';

interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated: () => void;
}

const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  onClose,
  onGroupCreated,
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
    cover_image: '',
    max_members: 10,
    is_public: true,
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    if (!profile?.id_user) {
      setError('You must be logged in to create a group');
      return;
    }

    setLoading(true);

    try {
      const id_group = generateId();

      // Create the group
      const { error: groupError } = await supabase.from('travel_group').insert({
        id_group,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        destination: formData.destination.trim() || null,
        cover_image: formData.cover_image.trim() || null,
        max_members: formData.max_members,
        is_public: formData.is_public,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        created_by: profile.id_user,
      });

      if (groupError) {
        console.error('Group insert error:', groupError);
        throw new Error(groupError.message);
      }

      // Add creator as admin member
      const { error: memberError } = await supabase.from('group_member').insert({
        id_group,
        id_user: profile.id_user,
        role: 'admin',
      });

      if (memberError) {
        console.error('Member insert error:', memberError);
        // Don't throw, group was created successfully
      }

      onGroupCreated();
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-region to-region/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Group</h2>
                <p className="text-white/80 text-sm">Start a new travel group</p>
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

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Group Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Vietnam Backpackers 2024"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell others about your group..."
              rows={3}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground resize-none"
            />
          </div>

          {/* Destination */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g., Ho Chi Minh City, Vietnam"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground"
            />
          </div>

          {/* Cover Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Cover Image
            </label>
            <SingleImageUploader
              value={formData.cover_image}
              onChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url }))}
              bucket="groups"
              placeholder="Upload cover image"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground"
              />
            </div>
          </div>

          {/* Max Members & Visibility */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Max Members
              </label>
              <select
                name="max_members"
                value={formData.max_members}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground"
              >
                <option value={5}>5 members</option>
                <option value={10}>10 members</option>
                <option value={15}>15 members</option>
                <option value={20}>20 members</option>
                <option value={30}>30 members</option>
                <option value={50}>50 members</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Visibility
              </label>
              <div className="flex space-x-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, is_public: true }))}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                    formData.is_public
                      ? 'bg-region text-white border-region'
                      : 'bg-background text-foreground border-input hover:bg-muted'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, is_public: false }))}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                    !formData.is_public
                      ? 'bg-region text-white border-region'
                      : 'bg-background text-foreground border-input hover:bg-muted'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </button>
              </div>
            </div>
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
              className="flex items-center space-x-2 px-6 py-2 bg-region hover:bg-region/90 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

