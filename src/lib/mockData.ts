import { Character } from '@/types/character';
import { Post, CharacterRanking } from '@/types/post';

/**
 * DummyJSON을 사용해 가상의 서버 응답과 유사한 형태의 Mock Data를 생성하는 유틸리티
 * TRD 기반 KPOP AI 앱 "Aura"의 모델 요구사항에 맞게 매핑
 */

const DUMMY_JSON_URL = 'https://dummyjson.com';

// 1. 캐릭터 목록 Mock (DummyJSON Users 활용)
export async function getMockCharacters(limit = 10, skip = 0): Promise<Character[]> {
  try {
    const res = await fetch(`${DUMMY_JSON_URL}/users?limit=${limit}&skip=${skip}`);
    const data = await res.json();
    
    return data.users.map((user: Record<string, unknown>) => {
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
        // 기존 썸네일을 아바타용으로 채택
        avatar_url: String(user.image || ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
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
    
    // 포스트 이미지용: DummyJSON의 Recipe 썸네일을 차용하거나, 픽섬 랜덤 이미지 활용
    return data.posts.map((post: Record<string, unknown>, index: number) => {
      const modeOptions = ['performance', 'daily', 'meme', 'fan'];
      const idNum = Number(post.id) || 0;
      const idStr = String(post.id);
      const activity_mode = modeOptions[idNum % modeOptions.length];
      const reactions = (post.reactions as Record<string, number>) || { likes: 0 };
      const tags = (post.tags as string[]) || [];

      return {
        id: `post_${idStr}`,
        character_id: `char_${post.userId}`, // DummyJSON의 userId를 Character ID에 매핑
        content_type: (idNum % 3 === 0) ? 'moving_poster' : 'image', // 1/3 확률로 무빙포스터
        caption: String(post.body || '').slice(0, 100) + '... #' + (tags[0] || 'KPOP'), 
        // 9:16 비율 (세로 숏폼 포맷 모방)을 위해 picsum 랜덤 이미지 사용
        media_url: `https://picsum.photos/seed/${idStr}/360/640`,
        media_thumb_url: `https://picsum.photos/seed/${idStr}/180/320`,
        activity_mode,
        batch_sequence: (index % 4) + 1,
        generation_meta: { source: 'dummyjson_mock' },
        like_count: reactions.likes || 0,
        view_count: (reactions.likes || 0) * Math.floor(Math.random() * 5 + 2),
        share_count: Math.floor((reactions.likes || 0) / 10),
        status: 'published',
        created_at: new Date(Date.now() - (idNum * 3600000)).toISOString() // 최근 n시간 이내로 임의 분산
      };
    });
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
