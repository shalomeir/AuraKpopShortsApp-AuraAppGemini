import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CharacterGenerationRequest,
  GeneratedCharacter,
} from "@/lib/character-gen/schema";

interface PersistInput {
  requestId: string;
  managerUserId: string;
  request: CharacterGenerationRequest;
  character: GeneratedCharacter;
  model: string;
  rawText: string;
}

/**
 * 생성 결과를 Supabase Storage에 저장하고 선택적으로 메타데이터를 기록한다.
 */
export async function persistCharacterGeneration(input: PersistInput): Promise<{
  storageBucket: string;
  storagePath: string;
}> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "character-generations";
  const metadataTable =
    process.env.SUPABASE_METADATA_TABLE ?? "character_generations";

  const supabase = createSupabaseAdminClient();
  const storagePath = `${input.managerUserId}/${input.requestId}.json`;

  const payload = {
    requestId: input.requestId,
    generatedAt: new Date().toISOString(),
    managerUserId: input.managerUserId,
    model: input.model,
    request: input.request,
    character: input.character,
    rawText: input.rawText,
  };

  const upload = await supabase.storage
    .from(bucket)
    .upload(storagePath, JSON.stringify(payload, null, 2), {
      contentType: "application/json; charset=utf-8",
      upsert: true,
    });

  if (upload.error) {
    throw new Error(`Supabase Storage upload failed: ${upload.error.message}`);
  }

  const metadataInsert = await supabase.from(metadataTable).insert({
    request_id: input.requestId,
    manager_user_id: input.managerUserId,
    storage_bucket: bucket,
    storage_path: storagePath,
    character_name: input.character.name,
    source_model: input.model,
    created_at: new Date().toISOString(),
  });

  if (metadataInsert.error) {
    // 메타 테이블은 optional 이므로 저장 성공 자체는 유지한다.
  }

  return { storageBucket: bucket, storagePath };
}
