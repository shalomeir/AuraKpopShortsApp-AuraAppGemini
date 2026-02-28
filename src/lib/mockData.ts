import { Character } from '@/types/character';
import { Post, CharacterRanking } from '@/types/post';

/**
 * DummyJSON을 사용해 가상의 서버 응답과 유사한 형태의 Mock Data를 생성하는 유틸리티
 * TRD 기반 KPOP AI 앱 "Aura"의 모델 요구사항에 맞게 매핑
 */

const DUMMY_JSON_URL = 'https://dummyjson.com';

// 0. Pexels 영상 쇼츠 URL 헬퍼 (API 키가 있으면 패치, 없으면 Fallback 제공)
async function getMockVideoUrl(index: number): Promise<string> {
  const pexelsKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY || process.env.PEXELS_API_KEY;
  if (pexelsKey) {
    try {
      const res = await fetch(
        `https://api.pexels.com/videos/search?query=kpop+dance&per_page=15&orientation=portrait`,
        { headers: { Authorization: pexelsKey } }
      );
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        const video = data.videos[index % data.videos.length];
        const videoFile = video.video_files.find((f: Record<string, unknown>) => f.quality === 'hd') || video.video_files[0];
        return videoFile.link;
      }
    } catch (e) {
      console.error('Pexels API error:', e);
    }
  }
  
  // Fallback (공개 무료 샘플 비디오 링크)
  const fallbacks = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
  ];
  return fallbacks[index % fallbacks.length];
}

// 0.5. Unsplash API 헬퍼
async function getMockImageUrl(index: number, type: 'avatar' | 'post'): Promise<string> {
  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey) {
    try {
      const query = type === 'avatar' ? 'korean,portrait' : 'kpop,idol';
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=20`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const photo = data.results[index % data.results.length];
        return type === 'avatar' ? photo.urls.small : photo.urls.regular;
      }
    } catch (e) {
      console.error('Unsplash API error:', e);
    }
  }
  
  // Fallback (API 키 없을 때 loremflickr 사용)
  const width = type === 'avatar' ? 200 : 400;
  const height = type === 'avatar' ? 200 : 600;
  const keyword = type === 'avatar' ? 'face,portrait' : 'kpop,dance';
  return `https://loremflickr.com/${width}/${height}/${keyword}?random=${index}`;
}

// 1. 캐릭터 목록 Mock (DummyJSON Users 활용)
export async function getMockCharacters(limit = 10, skip = 0): Promise<Character[]> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/users?limit=${limit}&skip=${skip}`);
    const data = await res.json();
    
    // 순차적으로 API 호출 방지 (병렬 혹은 먼저 생성된 URL 연동)
    const characters = await Promise.all(data.users.map(async (user: Record<string, unknown>) => {
      // DummyJSON의 User 데이터를 Aura의 Character 도메인 스키마에 맞게 맵핑
      const gender = user.gender === 'male' ? 'male' : 'female';
      const age = Number(user.age) || 20;
      const age_range = age < 20 ? 'teen' : (age < 30 ? 'twenties' : 'thirties');
      
      const concepts = ['cute', 'sexy', 'boyish', 'innocent'];
      const positions = ['main_vocal', 'main_dancer', 'rapper', 'visual', 'leader', 'entertainer'];
      const moods = ['bright', 'dark', 'mysterious', 'comic'];
      const personas = ['casual', 'perfect', 'quirky', 'artist'];
      const idStr = String(user.id);
      const idNum = Number(user.id) || 0;
      const firstName = String(user.firstName || '');
      const lastName = String(user.lastName || '');

      const avatarUrl = String(user.image || '') || await getMockImageUrl(idNum, 'avatar');

      return {
        id: `char_${idStr}`,
        owner_id: `owner_${Math.floor(Math.random() * 10)}`, // Auth 유저 목업
        name: `${firstName} ${lastName}`,
        gender,
        age_range,
        nationality: (user.address as Record<string, unknown>)?.country || 'Korea', // 더미 json엔 주로 USA
        face_shape: 'v-line',
        hair_color: (user.hair as Record<string, unknown>)?.color || 'black',
        fashion_mood: 'trendy',
        concept: concepts[idNum % concepts.length],
        position: [positions[idNum % positions.length]],
        signature_mood: moods[idNum % moods.length],
        persona: personas[idNum % personas.length],
        comment_tone: 'friendly',
        activity_modes: ['performance', 'daily'],
        memory: {
          debut_story: `${firstName} 데뷔 스토리...`,
          milestones: [],
          last_event: null,
          post_count: 0
        },
        fan_level: age * 2,
        follower_count: Math.floor(Math.random() * 50000),
        is_active: true,
        // Unsplash API를 사용하여 KPOP 아이돌 초상화 스타일 적용
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }));
    return characters;
  } catch (error) {
    console.error('Failed to fetch mock characters:', error);
    return [];
  }
}

// 2. 피드/포스트 Mock (DummyJSON Posts 활용)
export async function getMockPosts(limit = 10, skip = 0): Promise<Post[]> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/posts?limit=${limit}&skip=${skip}`);
    const data = await res.json();
    
    // 포스트 이미지용: DummyJSON의 Recipe 썸네일 대신 Unsplash 및 Pexels 비디오 적용
    const posts = await Promise.all(data.posts.map(async (post: Record<string, unknown>, index: number) => {
      const modeOptions = ['performance', 'daily', 'meme', 'fan'];
      const idNum = Number(post.id) || 0;
      const idStr = String(post.id);
      const activity_mode = modeOptions[idNum % modeOptions.length];
      const reactions = (post.reactions as Record<string, number>) || { likes: 0 };
      const tags = (post.tags as string[]) || [];

      const isVideo = idNum % 3 === 0;
      let mediaUrl = await getMockImageUrl(index, 'post');
      const mediaThumbUrl = `https://loremflickr.com/200/300/kpop?random=${idStr}`;
      
      if (isVideo) {
         mediaUrl = await getMockVideoUrl(index);
      }

      return {
        id: `post_${idStr}`,
        character_id: `char_${((Number(post.userId) - 1) % 10) + 1}`, // Feed와 매칭되도록 1~10 캐릭터 ID로 한정 매핑
        content_type: isVideo ? 'moving_poster' : 'image', // 1/3 확률로 무빙포스터
        caption: String(post.body || '').slice(0, 100) + '... #' + (tags[0] || 'KPOP'), 
        // 9:16 비율 (세로 숏폼 포맷 모방)을 위해 Unsplash (또는 Pexels) 사용
        media_url: mediaUrl,
        media_thumb_url: mediaThumbUrl,
        activity_mode,
        batch_sequence: (index % 4) + 1,
        generation_meta: { source: isVideo ? 'pexels_mock' : 'unsplash_mock' },
        like_count: reactions.likes || 0,
        view_count: (reactions.likes || 0) * Math.floor(Math.random() * 5 + 2),
        share_count: Math.floor((reactions.likes || 0) / 10),
        status: 'published',
        created_at: new Date(Date.now() - (idNum * 3600000)).toISOString() // 최근 n시간 이내로 임의 분산
      };
    }));
    
    return posts;
  } catch (error) {
    console.error('Failed to fetch mock posts:', error);
    return [];
  }
}

// 3. 인기 랭킹 Mock
export async function getMockRanking(limit = 20): Promise<CharacterRanking[]> {
  const characters = await getMockCharacters(limit);
  
  // Follower 순 정렬
  const ranked = characters.map((c) => ({
    id: c.id,
    name: c.name,
    avatar_url: (c as Character & { avatar_url?: string }).avatar_url || '',
    follower_count: c.follower_count,
    fan_level: c.fan_level
  })).sort((a, b) => b.follower_count - a.follower_count);

  return ranked;
}
