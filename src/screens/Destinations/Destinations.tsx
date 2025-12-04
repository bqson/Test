'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Destinations: React.FC = () => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destination')
        .select('*')
        .order('average_rating', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform data to match expected format
      const transformedDestinations = (data || []).map((dest: any) => ({
        ...dest,
        id: dest.uuid,
        description: dest.name, // Use name as description fallback
        average_cost_per_day: null, // Not in schema
      }));

      setDestinations(transformedDestinations);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dest.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destination"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Explore Destinations</h1>
          <p className="text-muted-foreground mt-2">Discover amazing places around the world</p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-destination bg-background text-foreground"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-destination bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                <option value="mountain">Mountain</option>
                <option value="beach">Beach</option>
                <option value="city">City</option>
                <option value="desert">Desert</option>
                <option value="forest">Forest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => {
            // Get first image from images array (jsonb)
            const images = destination.images || [];
            const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null;
            
            return (
              <Link
                key={destination.id}
                href={`/destinations/${destination.uuid || destination.id}`}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-48 relative overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient if image fails
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.className += ' bg-gradient-to-br from-destination to-destination/60';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-destination to-destination/60" />
                  )}
                  {destination.category && (
                    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-foreground">
                      {destination.category}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1">{destination.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{destination.country || destination.region_name || 'Unknown'}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {destination.description || destination.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-trip fill-current flex-shrink-0" />
                      <span className="ml-1 text-sm font-medium text-foreground">
                        {(destination.average_rating || 0).toFixed(1)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({destination.total_reviews || 0})
                      </span>
                    </div>
                    {destination.best_season && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {destination.best_season}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No destinations found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
