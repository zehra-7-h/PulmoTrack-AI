import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Lazy initialization of the AI client
let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function analyzeSymptoms(symptoms: string, aqi: number, condition: string): Promise<AIAnalysisResult> {
  const client = getAI();
  
  const response = await client.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Kullanıcı Semptomları: ${symptoms}
      Mevcut Hava Kalitesi (AQI): ${aqi}
      Bilinen Hastalık: ${condition}

      Lütfen aşağıdaki klinik perspektiflere göre bir analiz yap ve sonucu JSON formatında döndür:
      {
        "analysis": "Klinik analiz metni...",
        "riskLevel": "high" | "medium" | "low",
        "rehabRecommendation": "Egzersizlere devam edebilir" | "Egzersizleri durdurmalı" | "Hafif egzersiz",
        "psychologicalNote": "Psikolojik destek notu..."
      }

      Kriterler:
      1. Diferansiyel Tanı: Bu semptomlar hava kirliliği kaynaklı mı, ilaç yan etkisi mi yoksa hastalığın alevlenmesi mi olabilir?
      2. Sistem Bazlı Yaklaşım: Sadece semptoma değil, akciğer sisteminin genel durumuna odaklan.
      3. Risk Seviyesi: Eğer göğüs ağrısı, şiddetli nefes darlığı gibi acil durumlar varsa riskLevel "high" olmalı.
      4. Tanı Hassasiyeti: Eğer kullanıcı "Bilinmiyor / Sağlıklı" olarak işaretlenmişse, direkt bir hastalık (KOAH, Astım vb.) tanısı koyma. Bunun yerine semptomların olası nedenlerini (enfeksiyon, kirlilik, yorgunluk vb.) tartış ve doktora yönlendir.
    `,
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ["high", "medium", "low"] },
          rehabRecommendation: { type: Type.STRING },
          psychologicalNote: { type: Type.STRING }
        },
        required: ["analysis", "riskLevel", "rehabRecommendation"]
      }
    },
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error", e);
    return {
      analysis: response.text || "Analiz yapılamadı.",
      riskLevel: "medium",
      rehabRecommendation: "Doktorunuza danışın",
      psychologicalNote: ""
    };
  }
}
