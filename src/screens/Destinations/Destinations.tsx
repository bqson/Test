'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, MapPin, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CreateDestinationModal } from './CreateDestinationModal';

export const Destinations: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateDestination, setShowCreateDestination] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('destination')
        .select('*')
        .order('average_rating', { ascending: false });

      if (error) {
        console.error('Destinations query error:', error);
        throw error;
      }

      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.region_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dest.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from destinations
  const categories = [...new Set(destinations.map((d) => d.category).filter(Boolean))];

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Explore Destinations</h1>
            <p className="text-muted-foreground mt-2">
              Discover amazing places around the world ({destinations.length} destinations)
            </p>
          </div>
          <button
            onClick={() => {
              if (!user) {
                router.push('/auth');
                return;
              }
              setShowCreateDestination(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-destination hover:bg-destination/90 text-white rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Destination</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-card rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations by name, country, or region..."
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
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((dest) => {
            // Get first image (format: [{url, caption}])
            const images = dest.images || [];
            const firstImageObj = Array.isArray(images) && images.length > 0 ? images[0] : null;
            const firstImage = firstImageObj?.url || (typeof firstImageObj === 'string' ? firstImageObj : null);

            return (
              <Link
                key={dest.id_destination}
                href={`/destinations/${dest.id_destination}`}
                className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                {/* Image */}
                <div className="h-48 relative overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={firstImageObj?.caption || dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.className += ' bg-gradient-to-br from-destination to-destination/60';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-destination to-destination/60 flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {dest.category && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-destination shadow-md">
                      {dest.category}
                    </div>
                  )}

                  {/* Rating Badge */}
                  {dest.average_rating > 0 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white text-xs font-bold">
                        {Number(dest.average_rating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1 group-hover:text-destination transition-colors">
                    {dest.name}
                  </h3>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {dest.region_name ? `${dest.region_name}, ` : ''}{dest.country || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      <span className="ml-1 text-sm font-medium text-foreground">
                        {Number(dest.average_rating || 0).toFixed(1)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({dest.total_reviews || 0} reviews)
                      </span>
                    </div>
                    {dest.best_season && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {dest.best_season}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No destinations found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to add a destination!'}
            </p>
            {user && (
              <button
                onClick={() => setShowCreateDestination(true)}
                className="px-6 py-3 bg-destination hover:bg-destination/90 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create First Destination
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Destination Modal */}
      {showCreateDestination && (
        <CreateDestinationModal
          onClose={() => setShowCreateDestination(false)}
          onDestinationCreated={() => {
            fetchDestinations();
            setShowCreateDestination(false);
          }}
        />
      )}
    </div>
  );
};
