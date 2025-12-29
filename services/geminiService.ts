
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

const API_KEY = process.env.API_KEY || '';

export async function extractWebContent(url: string): Promise<ExtractionResult> {
  if (!API_KEY) {
    throw new Error("API Anahtarı eksik.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    // 1. ADIM: Açık kaynak Jina Reader ile sayfa içeriğini ham metin olarak çek (Çok hızlıdır)
    // Bu servis CORS destekler ve sayfayı temiz Markdown'a çevirir.
    const readerResponse = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!readerResponse.ok) {
      throw new Error("Sayfa içeriği okunamadı (Jina Reader hatası).");
    }

    const readerData = await readerResponse.json();
    const rawContent = readerData.data.content;

    // 2. ADIM: Ham metni Gemini'ye ver ve sadece yapılandırmasını iste
    const systemInstruction = `
      Sen bir metin yapılandırma asistanısın. 
      Sana gelen ham metni (Markdown/Text), hiçbir kelimeyi değiştirmeden, ekleme yapmadan ve özetlemeden sadece "Başlıklar ve Metinler" şeklinde ayır.
      Gereksiz (reklam, menü vb.) kısımlar zaten temizlenmiş olarak gelecek, sen sadece JSON formatına uygun hale getir.
      KESİN KURAL: Metne sadık kal, uydurma yapma.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Şu ham metni başlık ve içerik bölümlerine ayır:\n\n${rawContent.substring(0, 15000)}`, // Limit aşımını önlemek için kırpma
      config: {
        systemInstruction,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["heading", "content"]
              }
            }
          },
          required: ["title", "sections"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);
    
    return {
      title: parsed.title || readerData.data.title || "Çıkarılan Metin",
      sections: parsed.sections,
      sourceUrl: url
    };
  } catch (error: any) {
    console.error("Hibrit çıkarma hatası:", error);
    throw new Error("Sayfa içeriği alınırken bir sorun oluştu. URL korumalı veya erişilemez olabilir.");
  }
}
