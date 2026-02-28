export interface Post {
  id: string;
  character_id: string;
  content_type: 'image' | 'moving_poster';
  caption: string;
  media_url: string;
  media_thumb_url?: string;
  activity_mode: string;
  batch_sequence: number;
  generation_meta: Record<string, unknown>;
  like_count: number;
  view_count: number;
  share_count: number;
  status: 'generating' | 'published' | 'failed';
  created_at: string;
}

export interface CharacterRanking {
  id: string;
  name: string;
  avatar_url: string;
  follower_count: number;
  fan_level: number;
}
