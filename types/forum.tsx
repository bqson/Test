export interface UserProfile {
  id_user: string;
  username: string;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user: UserProfile;
}

export interface Post {
  id: string; //uuid
  id_post: string; 
  id_user: string;
  title: string;
  content: string;
  tags: string[]; 
  category: string;
  image_url?: string;
  status: 'published' | 'draft';
  created_at: string;
  total_likes: number;
  total_views: number;
  total_comments: number;
  profiles: UserProfile;
  user_has_liked?: boolean;
}