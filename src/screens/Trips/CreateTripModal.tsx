'use client';

import React, { useState } from 'react';
import { X, Plane, MapPin, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateTripModalProps {
  onClose: () => void;
  onTripCreated: () => void;
}

const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const difficulties = ['Easy', 'Moderate', 'Challenging', 'Difficult', 'Expert'];

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  onClose,
  onTripCreated,
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departure: '',
    destination: '',
    start_date: '',
    end_date: '',
    difficult: 'Moderate',
    total_budget: '',
    distance: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.departure.trim()) {
      setError('Departure location is required');
      return;
    }

    if (!formData.destination.trim()) {
      setError('Destination is required');
      return;
    }

    if (!formData.start_date) {
      setError('Start date is required');
      return;
    }

    if (!formData.end_date) {
      setError('End date is required');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be after start date');
      return;
    }

    const budget = parseFloat(formData.total_budget);
    if (formData.total_budget && (isNaN(budget) || budget < 100000)) {
      setError('Budget must be at least 100,000 VND');
      return;
    }

    if (!profile?.id_user) {
      setError('You must be logged in to create a trip');
      return;
    }

    setLoading(true);

    try {
      const id_trip = generateId();

      // Create the trip
      const { error: tripError } = await supabase.from('trip').insert({
        id_trip,
        title: formData.title.trim() || `${formData.departure} → ${formData.destination}`,
        description: formData.description.trim() || null,
        departure: formData.departure.trim(),
        destination: formData.destination.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        difficult: formData.difficult,
        total_budget: budget || 100000,
        spent_amount: 0,
        distance: formData.distance ? parseFloat(formData.distance) : null,
        status: 'planned',
      });

      if (tripError) {
        console.error('Trip insert error:', tripError);
        throw new Error(tripError.message);
      }

      // Add creator to join_trip
      const { error: joinError } = await supabase.from('join_trip').insert({
        id_user: profile.id_user,
        id_trip,
      });

      if (joinError) {
        console.error('Join trip error:', joinError);
        // Don't throw, trip was created successfully
      }

      onTripCreated();
    } catch (err: any) {
      console.error('Error creating trip:', err);
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-trip to-trip/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Plan New Trip</h2>
                <p className="text-white/80 text-sm">Create your next adventure</p>
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
              Trip Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Vietnam Adventure"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
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
              placeholder="Describe your trip..."
              rows={2}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground resize-none"
            />
          </div>

          {/* Departure & Destination */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Departure *
              </label>
              <input
                type="text"
                name="departure"
                value={formData.departure}
                onChange={handleChange}
                placeholder="e.g., Hanoi"
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Destination *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g., Ho Chi Minh"
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
                required
              />
            </div>
          </div>

          {/* Difficulty & Distance */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Difficulty
              </label>
              <select
                name="difficult"
                value={formData.difficult}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                placeholder="e.g., 1700"
                min="1"
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Total Budget (VND)
            </label>
            <input
              type="number"
              name="total_budget"
              value={formData.total_budget}
              onChange={handleChange}
              placeholder="e.g., 5000000"
              min="100000"
              step="50000"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-trip bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum: 100,000 VND</p>
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
              className="flex items-center space-x-2 px-6 py-2 bg-trip hover:bg-trip/90 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plane className="w-4 h-4" />
                  <span>Create Trip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

