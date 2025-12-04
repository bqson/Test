'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Calendar, MapPin, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      // Groups table doesn't exist in schema
      // Use trips as groups (trips can have multiple members via join_trip)
      const { data: tripsData, error } = await supabase
        .from('trip')
        .select('*, join_trip(id_user)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform trips to groups format
      const transformedGroups = (tripsData || []).map((trip: any) => {
        const members = Array.isArray(trip.join_trip) ? trip.join_trip : [trip.join_trip].filter(Boolean);
        return {
          ...trip,
          id: trip.uuid,
          name: trip.title || 'Untitled Group',
          description: trip.description,
          destination: trip.destination,
          start_date: trip.start_date,
          current_members_count: members.length,
          max_members: 10, // Default
          profiles: {
            username: 'user', // Can be fetched separately if needed
          },
        };
      });

      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-region"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Travel Groups</h1>
            <p className="text-muted-foreground mt-2">Find companions for your next adventure</p>
          </div>
          <Link
            href="/groups/new"
            className="flex items-center space-x-2 bg-region hover:bg-region/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Group</span>
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-region to-region/60"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{group.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{group.description}</p>

                <div className="space-y-2 mb-4">
                  {group.destination && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {group.destination}
                    </div>
                  )}
                  {group.start_date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(group.start_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {group.current_members_count} / {group.max_members} members
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">by {group.profiles?.username}</span>
                  <Link
                    href={`/groups/${group.id}`}
                    className="text-region hover:text-region/80 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No groups found</h3>
            <p className="text-muted-foreground">Be the first to create a travel group!</p>
          </div>
        )}
      </div>
    </div>
  );
};
