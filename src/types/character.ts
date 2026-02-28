export interface CharacterMemory {
  debut_story: string | null;
  milestones: string[];
  last_event: string | null;
  post_count: number;
}

export interface Character {
  id: string;
  owner_id: string;
  name: string;
  gender: "female" | "male" | "nonbinary";
  age_range: "teen" | "twenties" | "thirties";
  nationality: string;
  face_shape: string;
  hair_color: string;
  fashion_mood: string;
  concept: "cute" | "sexy" | "boyish" | "innocent" | string;
  position: (
    | "main_vocal"
    | "main_dancer"
    | "rapper"
    | "visual"
    | "leader"
    | "entertainer"
    | string
  )[];
  signature_mood: "bright" | "dark" | "mysterious" | "comic" | string;
  persona: "casual" | "perfect" | "quirky" | "artist" | string;
  comment_tone: "friendly" | "provocative" | "chic" | "playful" | string;
  activity_modes: string[];
  memory: CharacterMemory;
  fan_level: number;
  follower_count: number;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
