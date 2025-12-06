'use client';

import React, { useState, useEffect } from 'react';
import { X, Map, MapPin, Navigation, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateRouteModalProps {
  onClose: () => void;
  onRouteCreated: () => void;
}

const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const CreateRouteModal: React.FC<CreateRouteModalProps> = ({
  onClose,
  onRouteCreated,
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_location: '',
    end_location: '',
    trip_id: '',
  });
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserTrips();
  }, [profile]);

  const fetchUserTrips = async () => {
    if (!profile?.id_user) {
      setLoadingTrips(false);
      return;
    }

    try {
      // Get trips user has joined
      const { data: joinedTrips } = await supabase
        .from('join_trip')
        .select('id_trip')
        .eq('id_user', profile.id_user);

      if (!joinedTrips || joinedTrips.length === 0) {
        setTrips([]);
        setLoadingTrips(false);
        return;
      }

      const tripIds = joinedTrips.map((j) => j.id_trip);

      const { data: tripsData, error } = await supabase
        .from('trip')
        .select('*')
        .in('id_trip', tripIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(tripsData || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Route title is required');
      return;
    }

    if (!formData.start_location.trim()) {
      setError('Start location is required');
      return;
    }

    if (!formData.end_location.trim()) {
      setError('End location is required');
      return;
    }

    setLoading(true);

    try {
      const id_route = generateId();

      // Get max route_order for selected trip
      let route_order = 1;
      if (formData.trip_id) {
        const { data: existingRoutes } = await supabase
          .from('routes')
          .select('route_order')
          .eq('id_trip', formData.trip_id)
          .order('route_order', { ascending: false })
          .limit(1);

        if (existingRoutes && existingRoutes.length > 0) {
          route_order = (existingRoutes[0].route_order || 0) + 1;
        }
      }

      const { error: insertError } = await supabase.from('routes').insert({
        id_route,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_location: formData.start_location.trim(),
        end_location: formData.end_location.trim(),
        id_trip: formData.trip_id || null,
        route_order,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message);
      }

      onRouteCreated();
    } catch (err: any) {
      console.error('Error creating route:', err);
      setError(err.message || 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-routes to-routes/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Route</h2>
                <p className="text-white/80 text-sm">Add a new route to your trip</p>
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
              Route Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Day 1: City Tour"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
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
              placeholder="Describe what you'll do on this route..."
              rows={3}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground resize-none"
            />
          </div>

          {/* Start Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Start Location *
            </label>
            <input
              type="text"
              name="start_location"
              value={formData.start_location}
              onChange={handleChange}
              placeholder="e.g., Ben Thanh Market"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
              required
            />
          </div>

          {/* End Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <Navigation className="w-4 h-4 inline mr-1" />
              End Location *
            </label>
            <input
              type="text"
              name="end_location"
              value={formData.end_location}
              onChange={handleChange}
              placeholder="e.g., War Remnants Museum"
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
              required
            />
          </div>

          {/* Trip Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Assign to Trip (Optional)
            </label>
            {loadingTrips ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : trips.length > 0 ? (
              <select
                name="trip_id"
                value={formData.trip_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
              >
                <option value="">No trip (standalone route)</option>
                {trips.map((trip) => (
                  <option key={trip.id_trip} value={trip.id_trip}>
                    {trip.title || `${trip.departure} → ${trip.destination}`}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No trips found. Create a trip first to assign routes.
              </p>
            )}
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
              className="flex items-center space-x-2 px-6 py-2 bg-routes hover:bg-routes/90 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Map className="w-4 h-4" />
                  <span>Create Route</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

