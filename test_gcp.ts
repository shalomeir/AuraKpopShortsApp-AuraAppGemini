import { VertexAI } from '@google-cloud/vertexai';

async function testGCPIntegration() {
  try {
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;
    console.log(`Testing GCP Project: ${projectId}, Location: ${location}`);

    // Vertex AI 초기화 시도
    const vertexAI = new VertexAI({ project: projectId, location: location as string });

    // 간단한 모델 생성 시도 (API 접근 테스트용)
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    console.log('✅ Vertex AI SDK Initialized successfully!');
    
    // 로컬 gcloud 로그인 권한으로 API 통신이 가능한지 실제 프롬프트 전송
    const prompt = '한국어로 아주 짧게 인사해줘.';
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };
    
    console.log('Sending test request to Gemini 1.5 Flash...');
    const result = await generativeModel.generateContent(request);
    console.log('✅ Response:', result.response.candidates?.[0]?.content?.parts?.[0]?.text);
    console.log('🎉 GCP & Vertex AI setup is fully working!');

  } catch (error) {
    console.error('❌ GCP Integration Test Failed:', error);
  }
}

testGCPIntegration();
