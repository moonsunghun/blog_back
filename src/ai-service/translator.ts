import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI 클라이언트 초기화
const openAiClient = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

/**
 * HTML에서 텍스트 부분과 구조를 분리하는 함수
 * @param html HTML 문자열
 * @returns 텍스트 조각들과 HTML 구조 정보
 */
function parseHtmlStructure(html: string): {
  textSegments: string[];
  structure: Array<{ type: 'text' | 'image' | 'tag'; content: string; index?: number }>;
} {
  const textSegments: string[] = [];
  const structure: Array<{ type: 'text' | 'image' | 'tag'; content: string; index?: number }> = [];

  // HTML을 파싱하여 텍스트와 태그를 분리
  let textIndex = 0;

  // 간단한 HTML 파서 (정규표현식 기반)
  const htmlPattern = /<[^>]+>|[^<]+/g;
  let match;

  while ((match = htmlPattern.exec(html)) !== null) {
    const content = match[0];

    if (content.startsWith('<')) {
      // HTML 태그
      if (content.toLowerCase().startsWith('<img')) {
        structure.push({ type: 'image', content });
      } else {
        structure.push({ type: 'tag', content });
      }
    } else {
      // 텍스트 내용
      const cleanText = content.trim();
      if (cleanText) {
        textSegments.push(cleanText);
        structure.push({ type: 'text', content: cleanText, index: textIndex });
        textIndex++;
      }
    }
  }

  return { textSegments, structure };
}

/**
 * 번역된 텍스트 조각들을 원본 HTML 구조에 다시 삽입하는 함수
 * @param structure HTML 구조 정보
 * @param translatedSegments 번역된 텍스트 조각들
 * @returns 번역된 HTML
 */
function reconstructHtmlWithTranslatedText(
  structure: Array<{ type: 'text' | 'image' | 'tag'; content: string; index?: number }>,
  translatedSegments: string[]
): string {
  let result = '';

  for (const item of structure) {
    switch (item.type) {
      case 'text':
        // 텍스트는 번역된 것으로 교체
        if (item.index !== undefined && translatedSegments[item.index]) {
          result += translatedSegments[item.index];
        } else {
          result += item.content;
        }
        break;
      case 'image':
      case 'tag':
        // 태그는 그대로 유지
        result += item.content;
        break;
    }
  }

  return result;
}

/**
 * JSON 안전한 문자열로 변환하는 함수 (HTML 태그 보존)
 * @param text 처리할 텍스트
 * @returns JSON 안전한 텍스트
 */
function sanitizeForJson(text: string): string {
  // HTML 태그는 보존하고 줄바꿈과 제어 문자만 처리
  return text
    .replace(/\r\n/g, '\\n') // Windows 줄바꿈
    .replace(/\n/g, '\\n') // Unix 줄바꿈
    .replace(/\r/g, '\\r') // Mac 줄바꿈
    .replace(/\t/g, '\\t'); // 탭 문자
}

/**
 * 텍스트를 영어로 번역하는 함수
 * @param text 번역할 텍스트
 * @returns 번역된 텍스트
 */
export async function translateTextToEnglish(text: string): Promise<string> {
  console.log('🔄 번역 시작:', {
    textLength: text.length,
    textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
  });

  const openAiApiKey = process.env.OPEN_AI_API_KEY;
  if (!openAiApiKey) {
    console.error('❌ 번역 실패: OPEN_AI_API_KEY 환경변수가 없습니다.');
    throw new Error('OPEN_AI_API_KEY 환경변수가 필요합니다.');
  }

  try {
    // HTML 구조 파싱하여 텍스트 조각들 추출
    const { textSegments, structure } = parseHtmlStructure(text);

    console.log('📝 HTML 구조 파싱 완료:', {
      originalLength: text.length,
      textSegmentsCount: textSegments.length,
      totalTextLength: textSegments.join(' ').length,
    });

    // 텍스트가 없으면 원본 반환
    if (textSegments.length === 0) {
      console.log('⚠️ 번역할 텍스트가 없습니다.');
      return sanitizeForJson(text);
    }

    // 각 텍스트 조각별로 번역 (Promise.all로 병렬 처리)
    const translatedSegments: string[] = await Promise.all(
      textSegments.map(async (segment, idx) => {
        if (!segment.trim()) return segment;
        const prompt = `Translate the following Korean text to English. Only return the translation, no explanation.\n\n${segment}`;
        try {
          const response = await openAiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          });
          const translated = response.choices[0]?.message?.content?.trim() || segment;
          console.log(`[${idx}] 번역 성공:`, translated.substring(0, 80));
          return translated;
        } catch (e) {
          console.error(`[${idx}] 번역 실패, 원본 반환:`, e);
          return segment;
        }
      })
    );

    // HTML 구조에 번역된 텍스트 재삽입
    const finalHtml = reconstructHtmlWithTranslatedText(structure, translatedSegments);

    // JSON 파싱 에러를 방지하기 위해 안전한 문자열로 변환
    const sanitizedText = sanitizeForJson(finalHtml);

    console.log('🔧 HTML 재구성 및 JSON 안전화 완료:', {
      finalHtmlLength: finalHtml.length,
      sanitizedLength: sanitizedText.length,
    });

    return sanitizedText;
  } catch (error) {
    console.error('❌ 번역 중 오류 발생:', error);
    console.log('🔄 원본 텍스트 반환 (JSON 안전화 적용)');
    // 번역 실패 시 원본 텍스트 반환 (JSON 안전하게 처리)
    return sanitizeForJson(text);
  }
}
