'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Stopover {
  location_name: string;
  latitude: string;
  longitude: string;
  description: string;
  estimated_duration_hours: string;
}

export const CreateRoute: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'moderate',
    duration_days: '',
    distance_km: '',
    start_location: '',
    end_location: '',
    tags: '',
    is_public: true,
  });
  const [stopovers, setStopovers] = useState<Stopover[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user's id_user
      const { data: accountData } = await supabase
        .from('account')
        .select('id_user')
        .eq('email', user!.email || '')
        .maybeSingle();

      if (!accountData?.id_user) {
        throw new Error('User account not found');
      }

      // Generate IDs
      const generateId = (length: number = 6) => {
        return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
      };

      // First create a trip (routes require id_trip)
      const idTrip = generateId(6);
      const tripData = {
        id_trip: idTrip,
        title: formData.title,
        description: formData.description,
        departure: formData.start_location || 'Unknown',
        destination: formData.end_location || 'Unknown',
        distance: parseFloat(formData.distance_km) || 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + (parseInt(formData.duration_days) || 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        difficult: formData.difficulty,
        spent_amount: 0,
        total_budget: 1000000, // Default budget
        status: 'planning',
      };

      const { data: tripResult, error: tripError } = await supabase
        .from('trip')
        .insert([tripData])
        .select()
        .single();

      if (tripError) throw tripError;

      // Join user to trip
      const { error: joinError } = await supabase
        .from('join_trip')
        .insert([
          {
            id_user: accountData.id_user,
            id_trip: idTrip,
          },
        ]);

      if (joinError) console.error('Error joining trip:', joinError);

      // Now create route
      const idRoute = generateId(6);
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .insert([
          {
            id_route: idRoute,
            title: formData.title,
            description: formData.description,
            start_location: formData.start_location,
            end_location: formData.end_location,
            id_trip: idTrip,
            route_order: 1,
          },
        ])
        .select()
        .single();

      if (routeError) throw routeError;

      // Stopovers table doesn't exist in schema, skip for now
      // You could store this in route description or create a separate table

      router.push(`/routes/${routeData.uuid}`);
    } catch (error: any) {
      console.error('Error creating route:', error);
      alert(error.message || 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  const addStopover = () => {
    setStopovers([
      ...stopovers,
      {
        location_name: '',
        latitude: '',
        longitude: '',
        description: '',
        estimated_duration_hours: '',
      },
    ]);
  };

  const removeStopover = (index: number) => {
    setStopovers(stopovers.filter((_, i) => i !== index));
  };

  const updateStopover = (index: number, field: keyof Stopover, value: string) => {
    const updated = [...stopovers];
    updated[index][field] = value;
    setStopovers(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Create New Route</h1>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-foreground text-sm font-medium mb-2">Route Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-foreground text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Duration (days)</label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={formData.distance_km}
                onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Start Location</label>
              <input
                type="text"
                value={formData.start_location}
                onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">End Location</label>
              <input
                type="text"
                value={formData.end_location}
                onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="hiking, camping, mountain"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Make this route public</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Stopovers</h3>
              <button
                type="button"
                onClick={addStopover}
                className="flex items-center space-x-1 text-green-600 hover:text-green-700"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Stopover</span>
              </button>
            </div>

            {stopovers.map((stopover, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4 relative">
                <button
                  type="button"
                  onClick={() => removeStopover(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Location Name
                    </label>
                    <input
                      type="text"
                      value={stopover.location_name}
                      onChange={(e) => updateStopover(index, 'location_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={stopover.latitude}
                      onChange={(e) => updateStopover(index, 'latitude', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={stopover.longitude}
                      onChange={(e) => updateStopover(index, 'longitude', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={stopover.description}
                      onChange={(e) => updateStopover(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={stopover.estimated_duration_hours}
                      onChange={(e) =>
                        updateStopover(index, 'estimated_duration_hours', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/routes')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-routes hover:bg-routes/90 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
