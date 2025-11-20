"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { InvestmentOpportunity } from "@/lib/types";
import { getInvestmentById } from "@/lib/firestoreService";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";

const DetailInvestasiPage = () => {
  const params = useParams();
  const router = useRouter();
  const [investment, setInvestment] = useState<InvestmentOpportunity | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvestmentDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const investmentId = params.id as string;
        const investmentData = await getInvestmentById(investmentId);

        if (investmentData) {
          setInvestment(investmentData);
        } else {
          setError("Data investasi tidak ditemukan.");
          setInvestment(null);
        }
      } catch (error) {
        console.error("Error loading investment detail:", error);
        setError("Gagal memuat detail investasi. Silakan coba lagi.");
        setInvestment(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadInvestmentDetail();
    }
  }, [params.id]);

  const getFeasibilityBadge = (feasibility: number) => {
    if (feasibility >= 85)
      return { label: "Tinggi", class: "bg-green-500 text-white" };
    if (feasibility >= 70)
      return { label: "Sedang", class: "bg-yellow-500 text-dark" };
    return { label: "Rendah", class: "bg-red-500 text-white" };
  };

  const getSectorBadge = (investment: InvestmentOpportunity) => {
    const mainSector = investment.sektor || investment.tags[0] || "Lainnya";
    const sectorClasses: { [key: string]: string } = {
      Pariwisata: "pariwisata",
      Pertanian: "pertanian",
      Perikanan: "perikanan",
      UMKM: "umkm",
      Properti: "properti",
    };

    return {
      label: mainSector,
      class: sectorClasses[mainSector] || "bg-gray-100 text-gray-800",
    };
  };

  // Helper function untuk mendapatkan images
  const getImages = () => {
    if (investment?.images && investment.images.length > 0) {
      return investment.images;
    }
    return investment?.image ? [investment.image] : [];
  };

  // Helper function untuk mendapatkan detail data
  const getDetailData = () => {
    if (investment?.detail) {
      return investment.detail;
    }

    // Fallback data jika detail tidak ada
    return {
      fullDescription:
        investment?.description || "Deskripsi lengkap tidak tersedia.",
      contact: "Kontak tidak tersedia. Silakan hubungi admin.",
      aiAnalysis: {
        feasibility: `${investment?.feasibility || 0}%`,
        estimatedROI: investment?.duration || "Tidak tersedia",
        risk: "Analisis risiko tidak tersedia",
        opportunity: "Analisis peluang tidak tersedia",
      },
    };
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

  if (error || !investment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-10">
            <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
            <p className="text-gray-500 mb-4">
              {error || "Data investasi tidak ditemukan."}
            </p>
            <button
              onClick={() => router.push("/peluang-investasi")}
              className="inline-block bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Kembali ke Daftar Investasi
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const feasibilityBadge = getFeasibilityBadge(investment.feasibility);
  const sectorBadge = getSectorBadge(investment);
  const images = getImages();
  const detailData = getDetailData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <button
            onClick={() => router.push("/peluang-investasi")}
            className="inline-flex items-center text-primary hover:text-blue-700 transition"
          >
            <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
            Investasi
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Project Info */}
          <div className="project-info mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-dark mb-3">
              {investment.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {investment.description}
            </p>
            <div className="project-badges flex flex-wrap gap-2">
              <span
                className={`sector-badge px-3 py-1 rounded-full text-sm font-semibold ${sectorBadge.class}`}
              >
                {sectorBadge.label}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${feasibilityBadge.class}`}
              >
                {feasibilityBadge.label}
              </span>
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
              className="h-64 md:h-96 rounded-xl"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full">
                    <img
                      src={image}
                      alt={`${investment.title} - Gambar ${index + 1}`}
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

        {/* Informasi Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            {/* Deskripsi Lengkap */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                Deskripsi Lengkap
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {detailData.fullDescription}
              </p>
            </div>

            {/* Statistik Investasi - Diperbaiki untuk Mobile */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-chart-bar text-primary mr-2"></i>
                Statistik Investasi
              </h3>
              <div className="stats-grid grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value text-primary font-bold text-lg sm:text-xl">
                    {investment.estimatedCapital}
                  </div>
                  <div className="stat-label text-gray-500 text-xs sm:text-sm mt-1">
                    Estimasi Modal
                  </div>
                </div>
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value text-green-500 font-bold text-lg sm:text-xl">
                    {investment.roi}
                  </div>
                  <div className="stat-label text-gray-500 text-xs sm:text-sm mt-1">
                    Potensi Keuntungan/Tahun
                  </div>
                </div>
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value font-bold text-lg sm:text-xl">
                    {investment.feasibility}%
                  </div>
                  <div className="stat-label text-gray-500 text-xs sm:text-sm mt-1">
                    Tingkat Kelayakan
                  </div>
                </div>
                <div className="stat-item bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="stat-value font-bold text-lg sm:text-xl">
                    {investment.duration}
                  </div>
                  <div className="stat-label text-gray-500 text-xs sm:text-sm mt-1">
                    Durasi
                  </div>
                </div>
              </div>

              {/* Progress Bar untuk Kelayakan */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Tingkat Kelayakan
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {investment.feasibility}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      investment.feasibility >= 80
                        ? "bg-green-500"
                        : investment.feasibility >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${investment.feasibility}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Rendah</span>
                  <span>Sedang</span>
                  <span>Tinggi</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Kontak */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-address-book text-primary mr-2"></i>
                Kontak
              </h3>
              <div className="contact-info bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div
                  className="text-gray-700 space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: detailData.contact.replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            </div>

            {/* Analisis AI */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
                <i className="fas fa-robot text-green-500 mr-2"></i>
                Analisis AI Mendalam
              </h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Tingkat Kelayakan
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {detailData.aiAnalysis.feasibility}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <h4 className="font-medium text-gray-700 text-sm">
                    Perkiraan ROI
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {detailData.aiAnalysis.estimatedROI}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <h4 className="font-medium text-gray-700 text-sm">Risiko</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {detailData.aiAnalysis.risk}
                  </p>
                </div>
                <div className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <h4 className="font-medium text-gray-700 text-sm">Peluang</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {detailData.aiAnalysis.opportunity}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rekomendasi AI */}
        {investment.aiRecommendation && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
            <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
              <i className="fas fa-lightbulb text-green-500 mr-2"></i>
              Rekomendasi AI
            </h3>
            <div className="ai-recommendation bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <i className="fas fa-brain text-green-500 text-xl mt-1 mr-3"></i>
                <p className="text-gray-700 leading-relaxed">
                  {investment.aiRecommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .pariwisata {
          background-color: #e8f6f3;
          color: #16a085;
        }
        .pertanian {
          background-color: #fef9e7;
          color: #f39c12;
        }
        .perikanan {
          background-color: #eaf2f8;
          color: #3498db;
        }
        .umkm {
          background-color: #fdedec;
          color: #e74c3c;
        }
        .properti {
          background-color: #f4ecf7;
          color: #8e44ad;
        }

        /* Custom breakpoint untuk statistik grid */
        @media (min-width: 475px) {
          .xs\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

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
        :global(.swiper-button-next):after) {
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
};

export default DetailInvestasiPage;
