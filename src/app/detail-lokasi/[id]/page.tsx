// app/lokasi/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Location, AIRecommendation } from "@/lib/types";
import {
  getLocationById,
  updateLocationAIRecommendation,
} from "@/lib/firestoreService";
import { GeminiAIService } from "@/lib/geminiServices";

// Custom pin colors
const pinColors: { [key: string]: string } = {
  Pariwisata: "#3b82f6",
  Pertanian: "#10b981",
  Perikanan: "#f59e0b",
  UMKM: "#8b5cf6",
  "Aset Desa": "#ef4444",
  Infrastruktur: "#06b6d4",
};

export default function DetailLokasi() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] =
    useState<AIRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState("detail");

  useEffect(() => {
    loadLocation();
  }, [locationId]);

  const loadLocation = async () => {
    try {
      setLoading(true);
      const locationData = await getLocationById(locationId);

      if (!locationData) {
        throw new Error("Lokasi tidak ditemukan");
      }

      setLocation(locationData);

      // Jika sudah ada rekomendasi AI, gunakan yang ada
      if (locationData.aiRecommendation) {
        setAiRecommendation(locationData.aiRecommendation);
      }
    } catch (error) {
      console.error("Error loading location:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendation = async () => {
    if (!location) return;

    setAiLoading(true);
    setAiError(null);

    try {
      // PERBAIKAN: Gunakan generateLocationRecommendation bukan generateRecommendation
      const recommendation =
        await GeminiAIService.generateLocationRecommendation(location);

      setAiRecommendation(recommendation);

      // Save to Firestore
      try {
        await updateLocationAIRecommendation(location.id, recommendation);
      } catch (error) {
        console.error("Failed to save AI recommendation to Firestore:", error);
      }
    } catch (error: any) {
      console.error("Error generating AI recommendation:", error);
      setAiError(
        error.message || "Terjadi kesalahan saat memproses rekomendasi AI"
      );
    } finally {
      setAiLoading(false);
    }
  };

  const getFeasibilityText = (percentage: number) => {
    if (percentage >= 80) return "Sangat Layak";
    if (percentage >= 60) return "Layak";
    if (percentage >= 40) return "Cukup Layak";
    return "Kurang Layak";
  };

  const getFeasibilityColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: location?.title,
          text: location?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin ke clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="text-center py-12">
            <i className="fas fa-map-marker-alt text-gray-300 text-6xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Lokasi Tidak Ditemukan
            </h2>
            <p className="text-gray-500 mb-6">
              Lokasi yang Anda cari tidak ditemukan atau mungkin telah dihapus.
            </p>
            <button
              onClick={handleBack}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Kembali ke Peta
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 pt-24">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:text-blue-700 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Kembali ke Peta
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Detail Lokasi</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 md:h-80">
            <img
              src={location.image}
              alt={location.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {location.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: pinColors[location.type] }}
                    >
                      {location.type}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {location.desa}, {location.kecamatan}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleShare}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                  >
                    <i className="fas fa-share-alt"></i>
                  </button>
                  <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i className="fas fa-heart mr-2"></i>
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
              <h3 className="font-bold text-lg text-dark mb-4 flex items-center">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                Informasi Singkat
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Kategori</span>
                  <span className="font-semibold">{location.type}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Kecamatan</span>
                  <span className="font-semibold">{location.kecamatan}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Desa</span>
                  <span className="font-semibold">{location.desa}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Nilai Potensi</span>
                  <span className="font-semibold text-primary">
                    {getFeasibilityText(
                      aiRecommendation?.feasibilityScore ?? location.feasibility
                    )}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tingkat Kelayakan</span>
                    <span className="font-semibold">
                      {aiRecommendation?.feasibilityScore ??
                        location.feasibility}
                      /100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getFeasibilityColor(
                        aiRecommendation?.feasibilityScore ??
                          location.feasibility
                      )}`}
                      style={{
                        width: `${
                          aiRecommendation?.feasibilityScore ??
                          location.feasibility
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getFeasibilityText(
                      aiRecommendation?.feasibilityScore ?? location.feasibility
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {location.kontak && (
              <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
                <h3 className="font-bold text-lg text-dark mb-4 flex items-center">
                  <i className="fas fa-phone text-primary mr-2"></i>
                  Kontak
                </h3>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <i className="fas fa-phone text-white"></i>
                  </div>
                  <div>
                    <p className="font-semibold">{location.kontak}</p>
                    <p className="text-sm text-gray-500">Narahubung</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center shadow-md hover:shadow-lg">
                  <i className="fas fa-chart-bar mr-2"></i>
                  Laporan Analisis
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("detail")}
                    className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "detail"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <i className="fas fa-info-circle mr-2"></i>
                    Detail Lokasi
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "ai"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <i className="fas fa-robot mr-2"></i>
                    Analisis AI
                  </button>
                  <button
                    onClick={() => setActiveTab("location")}
                    className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "location"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <i className="fas fa-map mr-2"></i>
                    Peta & Lokasi
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Detail Tab */}
                {activeTab === "detail" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-xl text-dark mb-4 flex items-center">
                        <i className="fas fa-align-left text-primary mr-2"></i>
                        Deskripsi Lokasi
                      </h3>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {location.description}
                      </p>
                    </div>

                    {/* Facilities */}
                    {location.fasilitas && location.fasilitas.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl text-dark mb-4 flex items-center">
                          <i className="fas fa-list-check text-primary mr-2"></i>
                          Fasilitas Tersedia
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {location.fasilitas.map((fasilitas, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg border border-green-100"
                            >
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <i className="fas fa-check text-white text-xs"></i>
                              </div>
                              <span className="font-medium">{fasilitas}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold text-xl text-dark mb-4 flex items-center">
                          <i className="fas fa-location-dot text-primary mr-2"></i>
                          Koordinat
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex flex-col space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Latitude</p>
                              <p className="font-mono font-medium text-lg">
                                {location.coords.lat.toFixed(6)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Longitude</p>
                              <p className="font-mono font-medium text-lg">
                                {location.coords.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          <button className="w-full mt-4 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center">
                            <i className="fas fa-copy mr-2"></i>
                            Salin Koordinat
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-xl text-dark mb-4 flex items-center">
                          <i className="fas fa-clipboard-check text-primary mr-2"></i>
                          Status
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">
                              Status Persetujuan
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Disetujui
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">
                              Tanggal Dibuat
                            </span>
                            <span className="font-medium">
                              {new Date(location.createdAt).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          {location.approvedAt && (
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">
                                Tanggal Disetujui
                              </span>
                              <span className="font-medium">
                                {new Date(
                                  location.approvedAt
                                ).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis Tab */}
                {activeTab === "ai" && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="font-bold text-xl text-dark flex items-center">
                        <i className="fas fa-robot text-primary mr-2"></i>
                        Analisis AI
                      </h3>
                      {!aiRecommendation && (
                        <button
                          onClick={generateAIRecommendation}
                          disabled={aiLoading}
                          className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
                        >
                          {aiLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Memproses...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-robot mr-2"></i>
                              Generate Analisis AI
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {aiError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center text-red-800">
                          <i className="fas fa-exclamation-triangle mr-3"></i>
                          <span className="font-medium">Error: {aiError}</span>
                        </div>
                      </div>
                    )}

                    {aiLoading ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">
                          Gemini AI sedang menganalisis lokasi...
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Ini mungkin membutuhkan beberapa detik
                        </p>
                      </div>
                    ) : aiRecommendation ? (
                      <div className="space-y-6">
                        {/* Feasibility Score */}
                        <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <h4 className="font-bold text-blue-800 text-lg">
                              Skor Kelayakan AI
                            </h4>
                            <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium mt-2 md:mt-0">
                              {aiRecommendation.feasibilityScore}/100
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                            <div
                              className={`h-3 rounded-full ${getFeasibilityColor(
                                aiRecommendation.feasibilityScore
                              )}`}
                              style={{
                                width: `${aiRecommendation.feasibilityScore}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-blue-700 font-medium">
                            {getFeasibilityText(
                              aiRecommendation.feasibilityScore
                            )}
                          </p>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-white border-l-4 border-primary p-5 rounded-r-xl shadow-sm">
                          <h4 className="font-bold text-lg text-dark mb-3">
                            Rekomendasi Utama
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {aiRecommendation.recommendation}
                          </p>
                        </div>

                        {/* Analysis */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                          <h4 className="font-bold text-lg text-dark mb-3">
                            Analisis Detail
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {aiRecommendation.analysis}
                          </p>
                        </div>

                        {/* Suggestions */}
                        {aiRecommendation.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-bold text-lg text-dark mb-4">
                              Saran Pengembangan
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {aiRecommendation.suggestions.map(
                                (suggestion, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3 bg-green-50 p-4 rounded-lg border border-green-100"
                                  >
                                    <i className="fas fa-lightbulb text-green-500 mt-1"></i>
                                    <p className="text-gray-700">
                                      {suggestion}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Risks */}
                        {aiRecommendation.risks.length > 0 && (
                          <div>
                            <h4 className="font-bold text-lg text-dark mb-4">
                              Potensi Resiko
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {aiRecommendation.risks.map((risk, index) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3 bg-red-50 p-4 rounded-lg border border-red-100"
                                >
                                  <i className="fas fa-exclamation-triangle text-red-500 mt-1"></i>
                                  <p className="text-gray-700">{risk}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <i className="fas fa-robot text-5xl text-gray-300 mb-4"></i>
                        <h4 className="font-bold text-gray-700 text-xl mb-2">
                          Belum Ada Analisis AI
                        </h4>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Generate analisis AI untuk mendapatkan rekomendasi
                          pengembangan lokasi ini.
                        </p>
                        <button
                          onClick={generateAIRecommendation}
                          className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center mx-auto shadow-md hover:shadow-lg"
                        >
                          <i className="fas fa-robot mr-2"></i>
                          Generate Analisis AI
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Location Tab */}
                {activeTab === "location" && (
                  <div className="space-y-6">
                    <h3 className="font-bold text-xl text-dark flex items-center">
                      <i className="fas fa-map-location-dot text-primary mr-2"></i>
                      Peta & Lokasi
                    </h3>

                    <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-map-marked-alt text-gray-400 text-5xl mb-4"></i>
                        <p className="text-gray-500 font-medium">
                          Peta interaktif akan ditampilkan di sini
                        </p>
                        <button className="mt-4 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center mx-auto shadow-md hover:shadow-lg">
                          <i className="fas fa-external-link-alt mr-2"></i>
                          Buka di Google Maps
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg text-dark mb-4">
                          Aksesibilitas
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">
                              Jalan Menuju Lokasi
                            </span>
                            <span className="font-medium text-green-600">
                              Dapat Diakses
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">
                              Transportasi Umum
                            </span>
                            <span className="font-medium text-green-600">
                              Tersedia
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Parkir</span>
                            <span className="font-medium text-green-600">
                              Tersedia
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg text-dark mb-4">
                          Koordinat GPS
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="font-mono text-sm space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Latitude:</span>
                              <span className="font-medium">
                                {location.coords.lat.toFixed(6)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Longitude:</span>
                              <span className="font-medium">
                                {location.coords.lng.toFixed(6)}
                              </span>
                            </div>
                          </div>
                          <button className="w-full mt-4 bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center">
                            <i className="fas fa-directions mr-2"></i>
                            Dapatkan Petunjuk Arah
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
