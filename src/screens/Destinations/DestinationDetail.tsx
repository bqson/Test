'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star, Calendar, Clock, Image as ImageIcon, Share2, Heart, MessageSquare, Plus, ThumbsUp, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CreateDestinationPost } from './CreateDestinationPost';

interface DestinationDetailProps {
  destinationId: string;
}

export const DestinationDetail: React.FC<DestinationDetailProps> = ({ destinationId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [destination, setDestination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    if (destinationId) {
      fetchDestinationDetail();
    }
  }, [destinationId]);

  useEffect(() => {
    if (destination) {
      checkIfSaved();
      fetchPosts();
    }
  }, [destination, user]);

  const fetchPosts = async () => {
    if (!destination?.id_destination) return;
    
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('post')
        .select('*')
        .eq('id_destination', destination.id_destination)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get user info for posts
      const postUserIds = [...new Set((data || []).map((p: any) => p.id_user))];
      const userInfoMap: Record<string, any> = {};
      
      if (postUserIds.length > 0) {
        const { data: travellers } = await supabase
          .from('traveller')
          .select('id_user')
          .in('id_user', postUserIds);
        
        const travellerIds = travellers?.map(t => t.id_user) || [];
        
        if (travellerIds.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id_user, name, avatar_url')
            .in('id_user', travellerIds);
          
          users?.forEach((u: any) => {
            userInfoMap[u.id_user] = u;
          });
        }
      }

      // Transform posts
      const transformedPosts = (data || []).map((post: any) => {
        const userInfo = userInfoMap[post.id_user] || {};
        
        return {
          ...post,
          id: post.uuid,
          author: {
            name: userInfo.name || 'Anonymous',
            avatar_url: userInfo.avatar_url || null,
          },
        };
      });

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchDestinationDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('destination')
        .select('*')
        .eq('uuid', destinationId)
        .single();

      if (error) throw error;
      setDestination(data);
    } catch (error) {
      console.error('Error fetching destination detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user || !destination) return;

    try {
      const { data: accountData } = await supabase
        .from('account')
        .select('id_user')
        .eq('email', user.email || '')
        .maybeSingle();

      if (!accountData?.id_user) return;

      const { data } = await supabase
        .from('traveller_destination')
        .select('*')
        .eq('id_user', accountData.id_user)
        .eq('id_destination', destination.id_destination)
        .maybeSingle();

      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveDestination = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      const { data: accountData } = await supabase
        .from('account')
        .select('id_user')
        .eq('email', user.email || '')
        .maybeSingle();

      if (!accountData?.id_user) {
        alert('User account not found');
        return;
      }

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('traveller_destination')
          .delete()
          .eq('id_user', accountData.id_user)
          .eq('id_destination', destination.id_destination);

        if (error) throw error;
        setIsSaved(false);
      } else {
        // Add to saved
        const { error } = await supabase
          .from('traveller_destination')
          .insert([
            {
              id_user: accountData.id_user,
              id_destination: destination.id_destination,
            },
          ]);

        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error: any) {
      console.error('Error saving destination:', error);
      alert(error.message || 'Failed to save destination');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destination"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Destination not found</h2>
          <button
            onClick={() => router.push('/destinations')}
            className="text-destination hover:text-destination/80"
          >
            Go back to destinations
          </button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(destination.images) ? destination.images : [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Destinations</span>
        </button>

        {/* Main content */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Image gallery */}
          <div className="relative h-96 bg-gradient-to-br from-destination to-destination/60">
            {hasImages ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-card transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-card transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-foreground rotate-180" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-card w-8' : 'bg-card/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {destination.category && (
                    <span className="px-3 py-1 bg-destination/20 text-destination rounded-full text-sm font-medium">
                      {destination.category}
                    </span>
                  )}
                  {destination.best_season && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                      Best: {destination.best_season}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-3">{destination.name}</h1>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{destination.country || destination.region_name || 'Unknown Location'}</span>
                  </div>
                  {destination.latitude && destination.longitude && (
                    <div className="flex items-center">
                      <span className="text-sm">
                        {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveDestination}
                  className={`p-3 rounded-full transition-colors ${
                    isSaved
                      ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save destination'}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: destination.name,
                        text: destination.description || destination.name,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="p-3 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Rating and stats */}
            <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-border">
              <div className="flex items-center">
                <Star className="w-6 h-6 text-trip fill-current mr-2" />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {(destination.average_rating || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {destination.total_reviews || 0} reviews
                  </div>
                </div>
              </div>
              {destination.created_at && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Added {new Date(destination.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {destination.description || destination.name || 'No description available.'}
              </p>
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.region_name && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Region</h3>
                  <p className="text-muted-foreground">{destination.region_name}</p>
                </div>
              )}
              {destination.best_season && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Best Season</h3>
                  <p className="text-muted-foreground">{destination.best_season}</p>
                </div>
              )}
              {destination.latitude && destination.longitude && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Coordinates</h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    {destination.latitude}, {destination.longitude}
                  </p>
                </div>
              )}
              {destination.category && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Category</h3>
                  <p className="text-muted-foreground capitalize">{destination.category}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-post" />
              Posts & Reviews
            </h2>
            {user && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-post hover:bg-post/90 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Write a Post</span>
              </button>
            )}
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-post"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No posts yet. Be the first to share your experience!</p>
              {user && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="px-4 py-2 bg-post hover:bg-post/90 text-white rounded-lg transition-colors"
                >
                  Write First Post
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-traveller/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {post.author.avatar_url ? (
                        <img 
                          src={post.author.avatar_url} 
                          alt={post.author.name} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-traveller font-bold text-lg">
                          {post.author.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-foreground mb-2">{post.title}</h4>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{post.content}</p>
                      {post.tags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.split(',').map((tag: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.total_likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.total_views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreateDestinationPost
          destinationId={destinationId}
          destinationName={destination.name}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={() => {
            fetchPosts();
            setShowCreatePost(false);
          }}
        />
      )}
    </div>
  );
};

