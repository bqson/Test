'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Calendar, MapPin, Search, Globe, Lock, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CreateGroupModal } from './CreateGroupModal';

export const Groups: React.FC = () => {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      // Try to fetch from travel_group table first
      const { data: groupsData, error: groupsError } = await supabase
        .from('travel_group')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('Groups query error:', groupsError);
        // Fallback to trips if travel_group doesn't exist
        await fetchTripsAsGroups();
        return;
      }

      if (!groupsData || groupsData.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      // Fetch member counts for each group
      const groupIds = groupsData.map((g: any) => g.id_group);
      const { data: membersData } = await supabase
        .from('group_member')
        .select('id_group, id_user')
        .in('id_group', groupIds);

      // Count members per group
      const memberCounts: Record<string, number> = {};
      (membersData || []).forEach((m: any) => {
        memberCounts[m.id_group] = (memberCounts[m.id_group] || 0) + 1;
      });

      // Fetch creator info
      const creatorIds = [...new Set(groupsData.map((g: any) => g.created_by).filter(Boolean))];
      const creatorMap: Record<string, any> = {};

      if (creatorIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id_user, name, avatar_url')
          .in('id_user', creatorIds);

        (usersData || []).forEach((u: any) => {
          creatorMap[u.id_user] = u;
        });
      }

      // Transform groups
      const transformedGroups = groupsData.map((group: any) => ({
        ...group,
        id: group.uuid,
        current_members_count: memberCounts[group.id_group] || 0,
        creator: creatorMap[group.created_by] || { name: 'Unknown', avatar_url: null },
      }));

      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripsAsGroups = async () => {
    try {
      const { data: tripsData, error } = await supabase
        .from('trip')
        .select('*, join_trip(id_user)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedGroups = (tripsData || []).map((trip: any) => {
        const members = Array.isArray(trip.join_trip) ? trip.join_trip : [trip.join_trip].filter(Boolean);
        return {
          ...trip,
          id: trip.uuid,
          name: trip.title || 'Untitled Group',
          description: trip.description,
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          current_members_count: members.length,
          max_members: 10,
          is_public: true,
          creator: { name: 'User', avatar_url: null },
        };
      });

      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error fetching trips as groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group: any) => {
    if (!profile?.id_user) {
      router.push('/auth');
      return;
    }

    try {
      const { error } = await supabase.from('group_member').insert({
        id_group: group.id_group,
        id_user: profile.id_user,
        role: 'member',
      });

      if (error) {
        if (error.code === '23505') {
          alert('You are already a member of this group');
        } else {
          throw error;
        }
      } else {
        alert('Successfully joined the group!');
        fetchGroups();
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      alert(error.message || 'Failed to join group');
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.destination?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Travel Groups</h1>
            <p className="text-muted-foreground mt-2">
              Find companions for your next adventure ({groups.length} groups)
            </p>
          </div>
          <button
            onClick={() => {
              if (!user) {
                router.push('/auth');
                return;
              }
              setShowCreateGroup(true);
            }}
            className="flex items-center space-x-2 bg-region hover:bg-region/90 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-card rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups by name or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-region bg-background text-foreground"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Cover Image */}
              <div className="h-36 relative overflow-hidden">
                {group.cover_image ? (
                  <img
                    src={group.cover_image}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.className += ' bg-gradient-to-br from-region to-region/60';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-region to-region/60 flex items-center justify-center">
                    <Users className="w-16 h-16 text-white/50" />
                  </div>
                )}

                {/* Visibility Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                  {group.is_public ? (
                    <>
                      <Globe className="w-3 h-3 text-green-400" />
                      <span className="text-white text-xs">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-yellow-400" />
                      <span className="text-white text-xs">Private</span>
                    </>
                  )}
                </div>

                {/* Members Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                  <Users className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">
                    {group.current_members_count}/{group.max_members}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-region transition-colors">
                  {group.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                  {group.description || 'No description'}
                </p>

                <div className="space-y-2 mb-4">
                  {group.destination && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-destination" />
                      <span className="truncate">{group.destination}</span>
                    </div>
                  )}
                  {group.start_date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-trip" />
                      <span>
                        {new Date(group.start_date).toLocaleDateString('vi-VN')}
                        {group.end_date && ` - ${new Date(group.end_date).toLocaleDateString('vi-VN')}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-region/20 rounded-full flex items-center justify-center">
                      {group.creator?.avatar_url ? (
                        <img
                          src={group.creator.avatar_url}
                          alt={group.creator.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-region text-xs font-bold">
                          {group.creator?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      by {group.creator?.name || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {group.current_members_count < group.max_members && (
                      <button
                        onClick={() => handleJoinGroup(group)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-region/10 hover:bg-region hover:text-white text-region rounded-lg text-sm font-medium transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    )}
                    <Link
                      href={`/groups/${group.id}`}
                      className="text-region hover:text-region/80 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No groups found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Be the first to create a travel group!'}
            </p>
            {user && (
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-6 py-3 bg-region hover:bg-region/90 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create First Group
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={() => {
            fetchGroups();
            setShowCreateGroup(false);
          }}
        />
      )}
    </div>
  );
};
