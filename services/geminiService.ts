
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

const API_KEY = process.env.API_KEY || '';

export async function extractWebContent(url: string): Promise<ExtractionResult> {
  if (!API_KEY) {
    throw new Error("API Anahtarı eksik.");
  }

  // Her istekte yeni instance oluşturarak güncel anahtarı aldığından emin oluyoruz
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  /**
   * Hız için gemini-3-flash-preview modelini seçiyoruz. 
   * 'thinkingBudget: 0' ile düşünme süresini minimize ediyoruz.
   */
  const systemInstruction = `
    Sen bir web metin çıkarıcısısın. 
    Görevin: Verilen URL'yi googleSearch aracıyla ziyaret etmek ve metni BİREBİR (verbatim) kopyalamak.
    
    KURALLAR:
    1. Özetleme, yorumlama veya kendi bilgini ekleme. Sadece kopyala.
    2. Reklam, navigasyon ve footer gibi gereksiz kısımları atla.
    3. Sayfadaki ana başlığı ve altındaki asıl içerik metinlerini çıkar.
    4. Sadece JSON formatında yanıt ver.
    5. Eğer içeriğe erişemezsen uydurma, boş sonuç dön.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // En hızlı model
      contents: `Şu URL'yi ziyaret et ve metni birebir çıkar: ${url}`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0, // En az yaratıcılık, en çok sadakat ve hız
        thinkingConfig: { thinkingBudget: 0 }, // Düşünme süresini kapatıyoruz (hız için)
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Orijinal ana başlık" },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING, description: "Bölüm başlığı" },
                  content: { type: Type.STRING, description: "Birebir metin içeriği" }
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

    if (!parsed.sections || parsed.sections.length === 0) {
      throw new Error("İçerik çekilemedi veya sayfa boş döndü.");
    }
    
    return {
      title: parsed.title || "Çıkarılan Metin",
      sections: parsed.sections,
      sourceUrl: url
    };
  } catch (error: any) {
    console.error("Hızlı çıkarma hatası:", error);
    throw new Error("Hızlı işlem sırasında bir sorun oluştu. URL erişilebilir olmayabilir.");
  }
}
