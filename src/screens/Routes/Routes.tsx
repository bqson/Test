'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Map as MapIcon, Star, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const Routes: React.FC = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      // Get all routes with trip info
      const { data, error } = await supabase
        .from('routes')
        .select('*, trip(id_trip, title, difficult, distance, departure, destination)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match expected format
      const transformedRoutes = (data || []).map((route: any) => ({
        ...route,
        id: route.uuid,
        difficulty: route.trip?.difficult || 'moderate',
        duration_days: null,
        distance_km: route.trip?.distance || 0,
        view_count: 0,
        average_rating: 0,
        profiles: {
          username: 'user',
          avatar_url: null,
        },
      }));

      setRoutes(transformedRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || route.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-routes"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Explore Routes</h1>
            <p className="text-muted-foreground mt-2">Discover amazing adventure routes from our community</p>
          </div>
          <Link
            href="/routes/new"
            className="flex items-center space-x-2 bg-routes hover:bg-routes/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Route</span>
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground w-5 h-5" />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-routes bg-background text-foreground"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <Link
              key={route.id}
              href={`/routes/${route.id}`}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-routes to-routes/60 relative">
                <div className="absolute top-3 right-3 bg-card px-3 py-1 rounded-full text-xs font-medium text-foreground">
                  {route.difficulty}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg">{route.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{route.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center">
                    <MapIcon className="w-4 h-4 mr-1" />
                    {route.distance_km || 0} km
                  </span>
                  <span>{route.duration_days || 'N/A'} days</span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {route.view_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-traveller/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-traveller">
                        {route.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">{route.profiles?.username || 'user'}</span>
                  </div>
                  {route.average_rating !== undefined && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-trip fill-current" />
                      <span className="ml-1 text-sm text-foreground">{route.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12">
            <MapIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No routes found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
