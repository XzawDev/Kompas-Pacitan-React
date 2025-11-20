// lib/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Location, Desa } from "./types";

export interface AIRecommendation {
  recommendation: string;
  feasibilityScore: number;
  analysis: string;
  suggestions: string[];
  risks: string[];
}

export interface InvestmentRecommendation {
  recommendations: Array<{
    title: string;
    description: string;
    estimatedInvestment: string;
    potentialROI: string;
    timeframe: string;
    riskLevel: "Rendah" | "Sedang" | "Tinggi";
    keyAdvantages: string[];
    challenges: string[];
    targetMarket: string[];
  }>;
}

// Tambahkan interface untuk individual investment recommendation item
export interface InvestmentRecommendationItem {
  title: string;
  description: string;
  estimatedInvestment: string;
  potentialROI: string;
  timeframe: string;
  riskLevel: "Rendah" | "Sedang" | "Tinggi";
  keyAdvantages: string[];
  challenges: string[];
  targetMarket: string[];
}

// Enum untuk jenis analisis yang berbeda
export enum AnalysisType {
  LOCATION_ANALYSIS = "location_analysis",
  INVESTMENT_RECOMMENDATION = "investment_recommendation",
  DESA_OVERVIEW = "desa_overview",
}

class CommandManager {
  private static commands = {
    [AnalysisType.LOCATION_ANALYSIS]: `
ANALISIS LOKASI - KABUPATEN PACITAN
ROLE: AI Analis Potensi Wilayah
TASK: Analisis kelayakan dan rekomendasi pengembangan lokasi
DATA INPUT: Nama, Jenis, Desa, Kecamatan, Deskripsi, Potensi, Fasilitas, Kontak
OUTPUT FORMAT: 
{
  "recommendation": "ringkasan maksimal 2 kalimat",
  "feasibilityScore": 1-100,
  "analysis": "analisis detail maksimal 4 kalimat",
  "suggestions": ["saran 1", "saran 2", "saran 3"],
  "risks": ["risiko 1", "risiko 2"]
}
CONTEXT: Geografis Pacitan berbukit, dekat pantai, potensi wisata alam, pertanian, UMKM
`,

    [AnalysisType.INVESTMENT_RECOMMENDATION]: `
REKOMENDASI INVESTASI DESA - KABUPATEN PACITAN  
ROLE: AI Analis Investasi & Ekonomi Wilayah
TASK: Analisis peluang investasi berbasis data internal & eksternal
DATA SCOPE: 
- Data Internal: Statistik desa, potensi existing, infrastruktur
- Data Eksternal: Tren ekonomi Pacitan, program pemerintah, pasar regional
OUTPUT FORMAT:
{
  "recommendations": [
    {
      "title": "Judul investasi",
      "description": "Deskripsi lengkap maksimal 3 kalimat",
      "estimatedInvestment": "Rp X - Rp Y",
      "potentialROI": "X-Y% per tahun",
      "timeframe": "X-Y tahun",
      "riskLevel": "Rendah/Sedang/Tinggi",
      "keyAdvantages": ["keuntungan 1", "keuntungan 2", "keuntungan 3"],
      "challenges": ["tantangan 1", "tantangan 2"],
      "targetMarket": ["target 1", "target 2"]
    }
  ]
}
FOCUS: Realistic, actionable, measurable recommendations
`,

    [AnalysisType.DESA_OVERVIEW]: `
OVERVIEW PROFIL DESA - KABUPATEN PACITAN
ROLE: AI Analis Profil Wilayah
TASK: Buat ringkasan komprehensif profil desa
OUTPUT FORMAT: {
  "overview": "ringkasan 3-4 kalimat",
  "strengths": ["strength1", "strength2", "strength3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "developmentPriorities": ["priority1", "priority2", "priority3"]
}
`,
  };

  static getCommand(analysisType: AnalysisType, data: any): string {
    const baseCommand = this.commands[analysisType];

    switch (analysisType) {
      case AnalysisType.LOCATION_ANALYSIS:
        return `${baseCommand}
DATA LOKASI:
- NAMA: ${data.title}
- JENIS: ${data.type}
- DESA: ${data.desa}
- KECAMATAN: ${data.kecamatan}
- DESKRIPSI: ${data.description ?? "-"}
- POTENSI: ${data.potential ?? "-"}
- FASILITAS: ${data.fasilitas?.join(", ") ?? "-"}
- KONTAK: ${data.kontak ?? "-"}

INSTRUKSI: Kembalikan hanya JSON valid tanpa penjelasan tambahan.`;

      case AnalysisType.INVESTMENT_RECOMMENDATION:
        return `${baseCommand}
DATA INTERNAL DESA:
- Nama: ${data.nama}
- Kecamatan: ${data.kecamatan}
- Jumlah Penduduk: ${data.statistik?.penduduk || "Data tidak tersedia"}
- Luas Wilayah: ${data.statistik?.luas || "Data tidak tersedia"} Ha
- Jumlah UMKM: ${data.statistik?.umkm || "Data tidak tersedia"}
- Potensi Pertanian: ${data.statistik?.pertanian || "Data tidak tersedia"}
- Destinasi Wisata: ${data.wisata?.length || 0} lokasi
- Produk Unggulan: ${data.produkUnggulan?.join(", ") || "Belum teridentifikasi"}
- Infrastruktur: Jalan (${data.infrastruktur?.jalan}), Air (${
          data.infrastruktur?.air
        }), Internet (${data.infrastruktur?.internet})

KONTEKS EKSTERNAL PACITAN:
- Geografis: Wilayah berbukit dengan akses pantai selatan Jawa
- Sektor Unggulan: Pariwisata alam, pertanian organik, perikanan, UMKM kreatif
- Program Pemerintah: Pengembangan desa wisata, smart farming, ekonomi kreatif
- Tren Pasar: Wisata alam experiential, produk lokal premium, e-commerce UMKM

REQUIREMENTS:
- Berikan 3-4 rekomendasi investasi REALISTIS dan SPESIFIK
- Pertimbangkan data statistik dan kondisi geografis
- Estimasi investasi realistic untuk skala desa
- Fokus pada potensi yang belum tergarap maksimal
- Sertakan analisis risiko dan keuntungan

INSTRUKSI: Kembalikan hanya JSON valid tanpa penjelasan tambahan.`;

      default:
        return baseCommand;
    }
  }
}

export class GeminiAIService {
  private static genAI: GoogleGenerativeAI;
  private static models: Map<AnalysisType, any> = new Map();
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Gemini API key is missing");
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Buat model khusus untuk setiap jenis analisis
    const modelConfigs = {
      [AnalysisType.LOCATION_ANALYSIS]: {
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      },
      [AnalysisType.INVESTMENT_RECOMMENDATION]: {
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.3, // Lebih deterministik untuk rekomendasi investasi
          topP: 0.7,
          maxOutputTokens: 1024, // Lebih panjang untuk analisis kompleks
          responseMimeType: "application/json",
        },
      },
      [AnalysisType.DESA_OVERVIEW]: {
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.5,
          topP: 0.8,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      },
    };

    // Initialize models
    Object.values(AnalysisType).forEach((type) => {
      const config = modelConfigs[type as AnalysisType];
      if (config) {
        this.models.set(
          type as AnalysisType,
          this.genAI.getGenerativeModel(config)
        );
      }
    });

    this.isInitialized = true;
    console.log(
      "✅ Gemini AI Service initialized with multiple analysis types"
    );
  }

  private static async callGemini(
    prompt: string,
    analysisType: AnalysisType
  ): Promise<any> {
    this.initialize();

    const model = this.models.get(analysisType);
    if (!model) {
      throw new Error(`Model for ${analysisType} not initialized`);
    }

    try {
      console.log(`🔍 Executing ${analysisType} analysis...`);

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Clean response - remove markdown code blocks jika ada
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

      return JSON.parse(cleanText);
    } catch (error: any) {
      console.error(`❌ Gemini API error for ${analysisType}:`, error);

      // Enhanced error handling
      if (error.message?.includes("JSON")) {
        throw new Error(`Invalid JSON response from AI for ${analysisType}`);
      }
      if (error.message?.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
      if (error.message?.includes("safety")) {
        throw new Error("Content blocked by safety settings.");
      }

      throw new Error(
        `AI analysis failed for ${analysisType}: ${error.message}`
      );
    }
  }

  // ANALISIS LOKASI - Untuk halaman lokasi
  static async generateLocationRecommendation(
    location: Location
  ): Promise<AIRecommendation> {
    if (
      !location.title ||
      !location.type ||
      !location.desa ||
      !location.kecamatan
    ) {
      console.warn("⚠ Incomplete location data for AI analysis");
      return this.getFallbackLocationRecommendation(location);
    }

    const prompt = CommandManager.getCommand(
      AnalysisType.LOCATION_ANALYSIS,
      location
    );

    try {
      const response = await this.callGemini(
        prompt,
        AnalysisType.LOCATION_ANALYSIS
      );

      // Validasi response structure
      if (!response.recommendation || !response.feasibilityScore) {
        throw new Error("Invalid response structure from AI");
      }

      return {
        recommendation: response.recommendation,
        feasibilityScore: Math.min(Math.max(response.feasibilityScore, 1), 100), // Clamp score 1-100
        analysis: response.analysis,
        suggestions: response.suggestions || [],
        risks: response.risks || [],
      };
    } catch (err) {
      console.error("❌ Location Analysis Error:", err);
      return this.getFallbackLocationRecommendation(location);
    }
  }

  // REKOMENDASI INVESTASI - Untuk halaman desa
  static async generateInvestmentRecommendation(
    desa: Desa
  ): Promise<InvestmentRecommendation> {
    if (!desa.nama || !desa.kecamatan) {
      console.warn("⚠ Data desa tidak lengkap untuk analisis investasi");
      return this.getFallbackInvestmentRecommendation(desa);
    }

    const prompt = CommandManager.getCommand(
      AnalysisType.INVESTMENT_RECOMMENDATION,
      desa
    );

    try {
      const response = await this.callGemini(
        prompt,
        AnalysisType.INVESTMENT_RECOMMENDATION
      );

      // Validasi response structure
      if (
        !response.recommendations ||
        !Array.isArray(response.recommendations)
      ) {
        throw new Error("Invalid recommendations structure from AI");
      }

      // Validasi dan bersihkan setiap rekomendasi dengan tipe yang eksplisit
      const validatedRecommendations = response.recommendations
        .slice(0, 4) // Maksimal 4 rekomendasi
        .map((rec: Partial<InvestmentRecommendationItem>) => ({
          title: rec.title || `Peluang Investasi di ${desa.nama}`,
          description:
            rec.description || `Peluang pengembangan di Desa ${desa.nama}`,
          estimatedInvestment:
            rec.estimatedInvestment || "Rp 50 juta - Rp 500 juta",
          potentialROI: rec.potentialROI || "15-25% per tahun",
          timeframe: rec.timeframe || "1-3 tahun",
          riskLevel: (["Rendah", "Sedang", "Tinggi"].includes(
            rec.riskLevel || ""
          )
            ? rec.riskLevel
            : "Sedang") as "Rendah" | "Sedang" | "Tinggi",
          keyAdvantages: Array.isArray(rec.keyAdvantages)
            ? rec.keyAdvantages.slice(0, 3)
            : [
                "Potensi lokal yang baik",
                "Dukungan masyarakat",
                "Lokasi strategis",
              ],
          challenges: Array.isArray(rec.challenges)
            ? rec.challenges.slice(0, 2)
            : ["Perlu pengembangan infrastruktur", "Pemasaran produk"],
          targetMarket: Array.isArray(rec.targetMarket)
            ? rec.targetMarket.slice(0, 2)
            : ["Pasar lokal", "Wisatawan"],
        }));

      return {
        recommendations: validatedRecommendations,
      };
    } catch (err) {
      console.error("❌ Investment Recommendation Error:", err);
      return this.getFallbackInvestmentRecommendation(desa);
    }
  }

  // Fallback implementations
  private static getFallbackLocationRecommendation(
    location: Location
  ): AIRecommendation {
    return {
      recommendation: `Lokasi ${location.title} memiliki potensi pengembangan di Desa ${location.desa}.`,
      feasibilityScore: 50,
      analysis: `Lokasi ${location.title} berada di Desa ${location.desa}, Kecamatan ${location.kecamatan}. Potensinya dapat dikembangkan sesuai kebutuhan desa.`,
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

  private static getFallbackInvestmentRecommendation(
    desa: Desa
  ): InvestmentRecommendation {
    return {
      recommendations: [
        {
          title: `Pengembangan Wisata Desa ${desa.nama}`,
          description: `Memanfaatkan potensi alam dan budaya Desa ${desa.nama} untuk pengembangan wisata berbasis komunitas.`,
          estimatedInvestment: "Rp 200 juta - Rp 1 miliar",
          potentialROI: "20-35% per tahun",
          timeframe: "2-3 tahun",
          riskLevel: "Sedang",
          keyAdvantages: [
            "Lokasi strategis di Pacitan",
            "Potensi alam yang masih alami",
            "Dukungan program pemerintah desa",
          ],
          challenges: [
            "Perlu pengembangan infrastruktur pendukung",
            "Pemasaran dan branding yang konsisten",
          ],
          targetMarket: [
            "Wisatawan domestik",
            "Komunitas adventure",
            "Family traveler",
          ],
        },
        {
          title: `UMKM Produk Lokal ${desa.nama}`,
          description: `Pengolahan dan pemasaran produk unggulan desa dengan sentuhan modern dan kemasan yang menarik.`,
          estimatedInvestment: "Rp 50 juta - Rp 300 juta",
          potentialROI: "25-40% per tahun",
          timeframe: "1-2 tahun",
          riskLevel: "Rendah",
          keyAdvantages: [
            "Bahan baku lokal tersedia",
            "Nilai budaya yang autentik",
            "Potensi ekspor digital",
          ],
          challenges: ["Akses permodalan", "Skill pemasaran digital"],
          targetMarket: ["Pasar online", "Wisatawan", "Toko oleh-oleh"],
        },
      ],
    };
  }
}
