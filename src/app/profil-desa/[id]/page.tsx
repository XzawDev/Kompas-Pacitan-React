// app/profil-desa/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDesaById,
  updateDesaAIRecommendations,
} from "@/lib/firestoreService";
import { Desa, WisataItem, InvestmentRecommendation } from "@/lib/types";
import { GeminiAIService } from "@/lib/geminiServices";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Import Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";

export default function DetailDesaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [desa, setDesa] = useState<Desa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // State untuk AI Recommendations
  const [investmentRecommendations, setInvestmentRecommendations] =
    useState<InvestmentRecommendation | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchDesaDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          const desaData = await getDesaById(id);
          if (desaData) {
            setDesa(desaData);
            // Jika sudah ada rekomendasi AI yang disimpan, gunakan itu
            if (desaData.aiInvestmentRecommendations) {
              setInvestmentRecommendations(
                desaData.aiInvestmentRecommendations
              );
            }
          } else {
            setError("Data desa tidak ditemukan.");
          }
        }
      } catch (error) {
        console.error("Error fetching desa detail:", error);
        setError("Gagal memuat detail desa. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchDesaDetail();
  }, [id]);

  // Fungsi untuk generate rekomendasi AI
  const generateAIRecommendations = async () => {
    if (!desa) return;

    setLoadingAI(true);
    setAiError(null);

    try {
      const recommendations =
        await GeminiAIService.generateInvestmentRecommendation(desa);
      setInvestmentRecommendations(recommendations);
      setLastGenerated(new Date());

      // Simpan ke Firestore untuk caching
      try {
        await updateDesaAIRecommendations(desa.id, recommendations);
        console.log("✅ AI recommendations saved to database");
      } catch (dbError) {
        console.warn("Gagal menyimpan rekomendasi ke database:", dbError);
        // Lanjutkan tanpa menyimpan, data tetap ditampilkan
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      setAiError("Gagal menghasilkan rekomendasi AI. Silakan coba lagi.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Helper function untuk mendapatkan gambar
  const getImages = (desaData: Desa) => {
    if (desaData?.galeri && desaData.galeri.length > 0) {
      return desaData.galeri;
    }
    return desaData?.gambar
      ? [desaData.gambar]
      : ["/assets/images/default-desa.jpg"];
  };

  // Helper function untuk mendapatkan badge sektor unggulan
  const getSectorBadge = (desaData: Desa) => {
    const sectors = [];
    if ((desaData?.statistik?.pertanian ?? 0) > 100) sectors.push("Pertanian");
    if ((desaData?.wisata?.length ?? 0) > 0) sectors.push("Pariwisata");
    if ((desaData?.statistik?.umkm ?? 0) > 20) sectors.push("UMKM");

    return sectors.length > 0 ? sectors : ["Beragam"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !desa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-10">
            <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
            <p className="text-gray-500 mb-4">
              {error || "Data desa tidak ditemukan."}
            </p>
            <button
              onClick={() => router.push("/profil-desa")}
              className="inline-block bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Kembali ke Daftar Desa
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getImages(desa);
  const sectorBadges = getSectorBadge(desa);

  // Safe access untuk data yang mungkin undefined
  const statistik = desa.statistik || {
    penduduk: 0,
    luas: 0,
    umkm: 0,
    pertanian: 0,
  };
  const wisata: WisataItem[] = desa.wisata || [];
  const asetTanah = desa.asetTanah || [];
  const bumdes = desa.bumdes || [];
  const produkUnggulan = desa.produkUnggulan || [];
  const peluangInvestasi = desa.peluangInvestasi || [];
  const infrastruktur = desa.infrastruktur || {
    jalan: "Baik",
    air: "Tersedia",
    internet: "4G",
    kesehatan: "Puskesmas Pembantu",
    listrik: "PLN",
    sekolah: "SD/SMP",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/profil-desa")}
            className="inline-flex items-center text-primary hover:text-blue-700 transition"
          >
            <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar Desa
          </button>
        </div>

        {/* Desa Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Desa Info */}
          <div className="desa-info mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-dark mb-3">
              Desa {desa.nama}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Kecamatan {desa.kecamatan}
            </p>
            <div className="desa-badges flex flex-wrap gap-2">
              {sectorBadges.map((sector, index) => (
                <span
                  key={index}
                  className={`sector-badge px-3 py-1 rounded-full text-sm font-semibold ${
                    sector === "Pertanian"
                      ? "bg-green-100 text-green-800"
                      : sector === "Pariwisata"
                      ? "bg-blue-100 text-blue-800"
                      : sector === "UMKM"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          {/* Image Carousel dengan Swiper */}
          <div className="project-header relative rounded-xl overflow-hidden mb-6">
            <Swiper
              modules={[Navigation, Pagination, EffectFade, Autoplay]}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination",
                type: "bullets",
              }}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              loop={images.length > 1}
              className="h-64 md:h-80 rounded-xl"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full">
                    <img
                      src={image}
                      alt={`Desa ${desa.nama} - Gambar ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {index + 1} / {images.length}
                    </div>
                  </div>
                </SwiperSlide>
              ))}

              {/* Custom Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <div className="swiper-button-prev w-12! h-12! bg-white/80! rounded-full! text-primary! hover:bg-white! transition-all after:text-xl! after:font-bold!"></div>
                  <div className="swiper-button-next w-12! h-12! bg-white/80! rounded-full! text-primary! hover:bg-white! transition-all after:text-xl! after:font-bold!"></div>
                  <div className="swiper-pagination bottom-4!"></div>
                </>
              )}
            </Swiper>
          </div>
        </div>

        {/* Grid Layout Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Kolom Kiri */}
          <div className="space-y-6">
            {/* Informasi Geografis*/}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                Informasi Geografis
              </h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">Desa</h4>
                  <p className="text-gray-600 text-sm mt-1">{desa.nama}</p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Kecamatan
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">{desa.kecamatan}</p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Kabupaten
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">Pacitan</p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Latitude
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {desa.koordinat?.lat || "-8.2065"}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Longitude
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {desa.koordinat?.lng || "111.1403"}
                  </p>
                </div>
              </div>
            </div>

            {/* Deskripsi Desa */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                Tentang Desa {desa.nama}
              </h3>
              <p className="text-gray-700 leading-relaxed">{desa.deskripsi}</p>
            </div>

            {/* Statistik Desa */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-chart-bar text-primary mr-2"></i>
                Statistik Desa
              </h3>
              <div className="stats-grid grid grid-cols-2 gap-4">
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value text-primary font-bold text-lg">
                    {statistik.penduduk.toLocaleString()}
                  </div>
                  <div className="stat-label text-gray-500 text-sm mt-1">
                    Penduduk
                  </div>
                </div>
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value text-green-500 font-bold text-lg">
                    {statistik.luas} Ha
                  </div>
                  <div className="stat-label text-gray-500 text-sm mt-1">
                    Luas Wilayah
                  </div>
                </div>
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value text-purple-500 font-bold text-lg">
                    {statistik.umkm}
                  </div>
                  <div className="stat-label text-gray-500 text-sm mt-1">
                    UMKM
                  </div>
                </div>
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value text-orange-500 font-bold text-lg">
                    {wisata.length}
                  </div>
                  <div className="stat-label text-gray-500 text-sm mt-1">
                    Destinasi Wisata
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-6">
            {/* Infrastruktur */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-road text-primary mr-2"></i>
                Infrastruktur
              </h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Kondisi Jalan
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {infrastruktur.jalan}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Akses Air Bersih
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {infrastruktur.air}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Akses Internet
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {infrastruktur.internet}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Fasilitas Kesehatan
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {infrastruktur.kesehatan}
                  </p>
                </div>
              </div>
            </div>

            {/* Potensi Unggulan */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-star text-green-500 mr-2"></i>
                Potensi Unggulan
              </h3>
              <div className="space-y-3">
                {statistik.pertanian > 100 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Pertanian</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Sangat Potensial
                    </span>
                  </div>
                )}
                {wisata.length > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Pariwisata</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Potensial
                    </span>
                  </div>
                )}
                {statistik.umkm > 20 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">UMKM</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Sangat Potensial
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Koordinat */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-map-pin text-primary mr-2"></i>
                Koordinat
              </h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Latitude
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {desa.koordinat?.lat || "-8.2065"}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Longitude
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {desa.koordinat?.lng || "111.1403"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Detail dengan Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                { id: "potensi", label: "Potensi", icon: "chart-line" },
                { id: "wisata", label: "Wisata", icon: "mountain" },
                {
                  id: "produk",
                  label: "Produk Unggulan",
                  icon: "shopping-bag",
                },
                {
                  id: "investasi",
                  label: "Peluang Investasi",
                  icon: "chart-bar",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <i className={`fas fa-${tab.icon}`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Potensi Tab */}
            {activeTab === "potensi" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Potensi Desa
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Aset Tanah */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-landmark text-blue-600 text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Aset Tanah
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {asetTanah.length > 0 ? (
                        asetTanah.map((aset, index) => (
                          <li key={index} className="flex items-start">
                            <i className="fas fa-circle text-blue-500 text-xs mt-1 mr-2"></i>
                            <span>{aset}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">Belum ada data</li>
                      )}
                    </ul>
                  </div>

                  {/* BUMDes */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-building text-green-600 text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-3">BUMDes</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {bumdes.length > 0 ? (
                        bumdes.map((bumdesItem, index) => (
                          <li key={index} className="flex items-start">
                            <i className="fas fa-circle text-green-500 text-xs mt-1 mr-2"></i>
                            <span>{bumdesItem}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">Belum ada data</li>
                      )}
                    </ul>
                  </div>

                  {/* Sektor Unggulan */}
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-star text-orange-600 text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Sektor Unggulan
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pertanian</span>
                        <span
                          className={`font-semibold ${
                            statistik.pertanian > 100
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {statistik.pertanian > 100
                            ? "Sangat Potensial"
                            : "Potensial"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Wisata</span>
                        <span
                          className={`font-semibold ${
                            wisata.length > 3
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {wisata.length > 3 ? "Sangat Potensial" : "Potensial"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">UMKM</span>
                        <span
                          className={`font-semibold ${
                            statistik.umkm > 20
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {statistik.umkm > 20
                            ? "Sangat Potensial"
                            : "Potensial"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wisata Tab */}
            {activeTab === "wisata" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Destinasi Wisata
                </h3>

                {wisata.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wisata.map((wisataItem: WisataItem, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                          {wisataItem.gambar ? (
                            <img
                              src={wisataItem.gambar}
                              alt={wisataItem.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="bg-gradient-to-br from-blue-400 to-green-400 w-full h-full flex items-center justify-center">
                              <i className="fas fa-mountain text-white text-3xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {wisataItem.nama}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {wisataItem.deskripsi}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            <span>Desa {desa.nama}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-mountain text-gray-400 text-xl"></i>
                    </div>
                    <p className="text-gray-500">
                      Belum ada data destinasi wisata
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Produk Unggulan Tab */}
            {activeTab === "produk" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Produk Unggulan Desa
                </h3>

                {produkUnggulan.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {produkUnggulan.map((produk, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all text-center"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <i className="fas fa-box text-primary text-xl"></i>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-3">
                          {produk}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Produk unggulan khas Desa {desa.nama} yang berkualitas
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-shopping-bag text-gray-400 text-xl"></i>
                    </div>
                    <p className="text-gray-500">
                      Belum ada data produk unggulan
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Peluang Investasi Tab dengan AI */}
            {activeTab === "investasi" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Peluang Investasi
                  </h3>

                  {/* Tombol Generate AI Recommendations */}
                  {!investmentRecommendations && !loadingAI && (
                    <button
                      onClick={generateAIRecommendations}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center"
                    >
                      <i className="fas fa-robot mr-2"></i>
                      Dapatkan Rekomendasi AI
                    </button>
                  )}
                </div>

                {/* Timestamp untuk rekomendasi terakhir */}
                {lastGenerated && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    <i className="fas fa-info-circle mr-2"></i>
                    Rekomendasi terakhir dihasilkan:{" "}
                    {lastGenerated.toLocaleString("id-ID")}
                  </div>
                )}

                {/* Loading State */}
                {loadingAI && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                      AI sedang menganalisis peluang investasi...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Menggunakan data internal dan eksternal untuk rekomendasi
                      terbaik
                    </p>
                  </div>
                )}

                {/* Error State */}
                {aiError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-3"></i>
                    <p className="text-red-700 mb-4">{aiError}</p>
                    <button
                      onClick={generateAIRecommendations}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}

                {/* AI Recommendations */}
                {investmentRecommendations && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <i className="fas fa-robot text-blue-600 text-xl mr-3"></i>
                        <div>
                          <h4 className="font-semibold text-blue-800">
                            Rekomendasi AI Cerdas
                          </h4>
                          <p className="text-blue-600 text-sm">
                            Dianalisis berdasarkan data desa dan tren terkini di
                            Pacitan
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {investmentRecommendations.recommendations.map(
                        (rec, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="text-lg font-semibold text-gray-800">
                                    {rec.title}
                                  </h4>
                                  <span
                                    className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                                      rec.riskLevel === "Rendah"
                                        ? "bg-green-100 text-green-800"
                                        : rec.riskLevel === "Sedang"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    Risiko {rec.riskLevel}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                  {rec.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-500">
                                      Estimasi Investasi
                                    </div>
                                    <div className="font-semibold text-gray-800">
                                      {rec.estimatedInvestment}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-500">
                                      Potensi ROI
                                    </div>
                                    <div className="font-semibold text-green-600">
                                      {rec.potentialROI}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-500">
                                      Timeframe
                                    </div>
                                    <div className="font-semibold text-gray-800">
                                      {rec.timeframe}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-gray-200 pt-4">
                              {/* Keuntungan */}
                              <div>
                                <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                  Keuntungan Utama
                                </h5>
                                <ul className="space-y-1">
                                  {rec.keyAdvantages.map((advantage, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start text-sm text-gray-600"
                                    >
                                      <i className="fas fa-chevron-right text-green-500 text-xs mt-1 mr-2"></i>
                                      {advantage}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Tantangan */}
                              <div>
                                <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                                  <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                                  Tantangan
                                </h5>
                                <ul className="space-y-1">
                                  {rec.challenges.map((challenge, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start text-sm text-gray-600"
                                    >
                                      <i className="fas fa-chevron-right text-yellow-500 text-xs mt-1 mr-2"></i>
                                      {challenge}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Target Pasar */}
                              <div>
                                <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                                  <i className="fas fa-bullseye text-blue-500 mr-2"></i>
                                  Target Pasar
                                </h5>
                                <ul className="space-y-1">
                                  {rec.targetMarket.map((market, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start text-sm text-gray-600"
                                    >
                                      <i className="fas fa-chevron-right text-blue-500 text-xs mt-1 mr-2"></i>
                                      {market}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback ke data manual jika AI tidak aktif */}
                {!investmentRecommendations &&
                  !loadingAI &&
                  peluangInvestasi.length > 0 && (
                    <div className="space-y-4">
                      {peluangInvestasi.map((investasi, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                {investasi.judul}
                              </h4>
                              <p className="text-gray-600 mb-4">
                                {investasi.deskripsi}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  Estimasi: {investasi.estimasiBiaya}
                                </span>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                  ROI Potensial
                                </span>
                              </div>
                            </div>
                            <div className="md:ml-6 mt-4 md:mt-0">
                              <button className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all font-semibold">
                                Hubungi
                              </button>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <i className="fas fa-phone mr-2"></i>
                              <span>Kontak: {investasi.kontak}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Empty State */}
                {!investmentRecommendations &&
                  !loadingAI &&
                  peluangInvestasi.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-chart-bar text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-gray-500">
                        Belum ada data peluang investasi
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Klik "Dapatkan Rekomendasi AI" untuk analisis otomatis
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        /* Swiper custom styles */
        :global(.swiper-button-prev),
        :global(.swiper-button-next) {
          width: 3rem;
          height: 3rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          color: #1a73e8;
          transition: all 0.3s ease;
        }

        :global(.swiper-button-prev):hover,
        :global(.swiper-button-next):hover {
          background: white;
          transform: scale(1.1);
        }

        :global(.swiper-button-prev):after,
        :global(.swiper-button-next):after {
          font-size: 1.25rem;
          font-weight: bold;
        }

        :global(.swiper-pagination-bullet) {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.6);
          opacity: 1;
        }

        :global(.swiper-pagination-bullet-active) {
          background: white;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
