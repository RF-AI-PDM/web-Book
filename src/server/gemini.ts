import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface MentorRequest {
  bookTitle: string;
  author: string;
  category: string;
  chapterTitle?: string;
  highlightedText?: string;
  userQuery: string;
  annotationsContext?: string[];
}

export interface MentorResponse {
  analysis: string;
  thoughts?: string;
  model: string;
}

export async function askGeminiMentor(data: MentorRequest): Promise<MentorResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `
Anda adalah Mentor Buku Cerdas & Mitra Berpikir Tingkat Tinggi di F15 Library.
Buku: "${data.bookTitle}" oleh ${data.author} (${data.category})
${data.chapterTitle ? `Bab Saat Ini: "${data.chapterTitle}"` : ''}
${data.highlightedText ? `Kutipan/Teks yang Disorot Pembaca: "${data.highlightedText}"` : ''}
${data.annotationsContext && data.annotationsContext.length > 0 ? `Catatan/Refleksi Pengguna Sebelumnya:\n${data.annotationsContext.join('\n')}` : ''}

Pertanyaan / Topik dari Pembaca:
"${data.userQuery}"

Tugas Anda:
1. Lakukan penalaran mendalam dan analisis konseptual terhadap pertanyaan pembaca dalam konteks intisari buku ini.
2. Jelaskan implikasi nyata, studi kasus, atau analogi lintas disiplin ilmu.
3. Berikan sintesis terstruktur dan langkah tindakan konkret (Actionable Takeaways) dalam Bahasa Indonesia yang elegan, lugas, dan berbobot akademis/profesional.
`;

  if (!apiKey) {
    // Elegant fallback simulation if API key is not yet set in environment
    return {
      model: 'gemini-3.1-pro-preview',
      analysis: `### Analisis Konseptual: ${data.bookTitle}\n\nDalam konteks bab **${data.chapterTitle || 'Intisari'}**, konsep yang diangkat memiliki relevansi mendalam terhadap dinamika modern.\n\n1. **Pembedahan Argumen:**\nKarya ${data.author} menggarisbawahi bahwa pergeseran paradigma terjadi ketika efisiensi marjinal menekan friksi konvensional. Dalam skenario ini, pelaku yang lambat beradaptasi akan menghadapi kerentanan struktural.\n\n2. **Konteks Implementasi:**\nUntuk menerapkan intisari ini secara praktis, fokuskan pada pembangunan *feedback loop* terdesentralisasi dan hindari ilusi kepastian linier.\n\n3. **Langkah Aksi Rekomendasi:**\n- Lakukan audit terhadap proses manual yang rentan terhadap bias persepsi.\n- Bangun penyangga risiko untuk menghadapi volatilitas pasar.\n\n*(Catatan: Konfigurasi API Key di panel AI Studio untuk mengaktifkan penalaran dinamis real-time penuh).*`,
      thoughts: 'Menganalisis premis utama buku... Mengevaluasi argumen bab... Menghubungkan variabel dengan dinamika industri... Menyintesis rekomendasi tindakan nyata.'
    };
  }

  try {
    const ai = getAiClient();
    // Use gemini-3.1-pro-preview with ThinkingLevel.HIGH and NO maxOutputTokens as strictly instructed
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah seorang pemikir strategis, cendekiawan sastra, dan mentor eksekutif tingkat dunia. Berikan wawasan mendalam, tajam, dan aplikatif.',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = response.text || 'Maaf, tidak dapat menghasilkan analisis saat ini.';
    
    // Extract thoughts if available from candidate parts
    let thoughtsText = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if ((part as any).thought) {
          thoughtsText += (part as any).thought + '\n';
        }
      }
    }

    return {
      model: 'gemini-3.1-pro-preview',
      analysis: text,
      thoughts: thoughtsText.trim() || undefined,
    };
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    // Graceful fallback with error notification
    return {
      model: 'gemini-3.1-pro-preview',
      analysis: `Terjadi kendala teknis saat memanggil model: ${error.message || 'Unknown error'}. Silakan pastikan kuota dan izin model terpenuhi.`,
    };
  }
}
