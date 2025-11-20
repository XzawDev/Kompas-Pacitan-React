// lib/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Location } from "./types";

export interface AIRecommendation {
  recommendation: string;
  feasibilityScore: number;
  analysis: string;
  suggestions: string[];
  risks: string[];
}

export class GeminiAIService {
  private static genAI: GoogleGenerativeAI;
  private static model: any;

  static initialize() {
    if (!this.genAI) {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        console.error("❌ Gemini API key is missing");
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);

      // FIX: Gunakan model gratis yang stabil
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash", // free-tier friendly
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      });

      console.log("✅ Using Gemini model: gemini-2.0-flash");
    }
  }

  private static async callGemini(prompt: string): Promise<any> {
    this.initialize();
    if (!this.model) throw new Error("Gemini model not initialized");

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      return JSON.parse(text); // langsung JSON, tidak parsing panjang
    } catch (error: any) {
      console.error("❌ Gemini API error:", error);
      throw new Error(error.message || "Gemini API failed");
    }
  }

  static async generateRecommendation(
    location: Location
  ): Promise<AIRecommendation> {
    if (
      !location.title ||
      !location.type ||
      !location.desa ||
      !location.kecamatan
    ) {
      console.warn("⚠ Incomplete location data for AI analysis");
      return this.getFallbackRecommendation(location);
    }

    const prompt = `
Anda adalah AI analis potensi wilayah Kabupaten Pacitan.

Buat analisis lokasi berdasarkan data berikut:

NAMA: ${location.title}
JENIS: ${location.type}
DESA: ${location.desa}
KECAMATAN: ${location.kecamatan}
DESKRIPSI: ${location.description ?? "-"}
POTENSI: ${location.potential ?? "-"}
FASILITAS: ${location.fasilitas?.join(", ") ?? "-"}
KONTAK: ${location.kontak ?? "-"}

Kembalikan data dalam format JSON PERSIS seperti ini:

{
  "recommendation": "ringkasan maksimal 2 kalimat",
  "feasibilityScore": 1-100,
  "analysis": "analisis detail maksimal 4 kalimat",
  "suggestions": ["saran 1", "saran 2", "saran 3"],
  "risks": ["risiko 1", "risiko 2"]
}

KETENTUAN:
- Jangan berikan penjelasan di luar JSON.
- Gunakan konteks Pacitan: geografis berbukit, dekat pantai, potensi wisata alam, pertanian, UMKM.
- Pastikan JSON valid sepenuhnya.
`;

    try {
      const response = await this.callGemini(prompt);

      return {
        recommendation: response.recommendation,
        feasibilityScore: response.feasibilityScore,
        analysis: response.analysis,
        suggestions: response.suggestions,
        risks: response.risks,
      };
    } catch (err) {
      console.error("❌ AI Error:", err);
      return this.getFallbackRecommendation(location);
    }
  }

  private static getFallbackRecommendation(
    location: Location
  ): AIRecommendation {
    return {
      recommendation: `Lokasi ${location.title} memiliki potensi pengembangan di Desa ${location.desa}.`,
      feasibilityScore: 50,
      analysis:
        `Lokasi ${location.title} berada di Desa ${location.desa}, Kecamatan ${location.kecamatan}. ` +
        `Potensinya dapat dikembangkan sesuai kebutuhan desa.`,
      suggestions: [
        "Koordinasi dengan pemerintah desa",
        "Lakukan survei lapangan tambahan",
        "Susun rencana pengembangan bertahap",
      ],
      risks: [
        "Data lokasi belum lengkap",
        "Kondisi lapangan perlu diverifikasi",
      ],
    };
  }
}
