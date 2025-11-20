"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { InvestmentOpportunity } from "@/lib/types";
import { getApprovedInvestments } from "@/lib/firestoreService";

const PeluangInvestasiPage = () => {
  const router = useRouter();
  const [investments, setInvestments] = useState<InvestmentOpportunity[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<
    InvestmentOpportunity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    kecamatan: "",
    sektor: "",
    search: "",
  });

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        setLoading(true);
        setError(null);
        const investmentsData = await getApprovedInvestments();
        setInvestments(investmentsData);
        setFilteredInvestments(investmentsData);
      } catch (error) {
        console.error("Error loading investments:", error);
        setError("Gagal memuat data investasi. Silakan coba lagi.");
        setInvestments([]);
        setFilteredInvestments([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvestments();
  }, []);

  useEffect(() => {
    const filtered = investments.filter((investment) => {
      const matchesKecamatan =
        !filters.kecamatan ||
        (investment.kecamatan &&
          investment.kecamatan
            .toLowerCase()
            .includes(filters.kecamatan.toLowerCase())) ||
        investment.location
          .toLowerCase()
          .includes(filters.kecamatan.toLowerCase());

      const matchesSektor =
        !filters.sektor ||
        (investment.sektor &&
          investment.sektor
            .toLowerCase()
            .includes(filters.sektor.toLowerCase())) ||
        investment.tags.some((tag) =>
          tag.toLowerCase().includes(filters.sektor.toLowerCase())
        );

      const matchesSearch =
        !filters.search ||
        investment.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        investment.description
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        investment.location
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      return matchesKecamatan && matchesSektor && matchesSearch;
    });

    setFilteredInvestments(filtered);
  }, [filters, investments]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      kecamatan: "",
      sektor: "",
      search: "",
    });
  };

  const handleViewDetail = (id: string) => {
    router.push(`/peluang-investasi/${id}`);
  };

  const getFeasibilityBadge = (
    feasibility: number
  ): { label: string; class: string } => {
    if (feasibility >= 85)
      return { label: "Tinggi", class: "bg-green-500 text-white" };
    if (feasibility >= 70)
      return { label: "Sedang", class: "bg-yellow-500 text-dark" };
    return { label: "Rendah", class: "bg-red-500 text-white" };
  };

  const getSectorBadge = (investment: InvestmentOpportunity) => {
    const mainSector = investment.sektor || investment.tags[0] || "Lainnya";
    const sectorClasses: { [key: string]: string } = {
      Pariwisata: "bg-blue-100 text-blue-800",
      Pertanian: "bg-green-100 text-green-800",
      Perikanan: "bg-cyan-100 text-cyan-800",
      UMKM: "bg-purple-100 text-purple-800",
      Properti: "bg-orange-100 text-orange-800",
    };

    return {
      label: mainSector,
      class: sectorClasses[mainSector] || "bg-gray-100 text-gray-800",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-dark mb-3">
            Peluang Investasi di Kabupaten Pacitan
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            Temukan berbagai peluang investasi menarik di 166 desa Pacitan. Dari
            sektor pariwisata, pertanian, perikanan, hingga UMKM.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div
          className="investasi-hero mb-8 rounded-xl overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')",
            height: "450px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/60"></div>
          <div className="relative z-10 h-full flex items-end p-6">
            <div className="w-full">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Investasi Masa Depan di Pacitan
              </h1>
              <p className="text-white text-base md:text-lg mb-4">
                Raih peluang bisnis dengan potensi keuntungan tinggi di berbagai
                sektor unggulan
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("investasi-list")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white text-primary font-semibold py-2 px-4 md:px-6 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                <i className="fas fa-search mr-2"></i> Jelajahi Peluang
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-dark mb-4">
            <i className="fas fa-filter mr-2 text-primary"></i>Filter Peluang
            Investasi
          </h3>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <label
                htmlFor="kecamatan-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kecamatan
              </label>
              <select
                id="kecamatan-filter"
                value={filters.kecamatan}
                onChange={(e) =>
                  handleFilterChange("kecamatan", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="">Semua Kecamatan</option>
                <option value="Arjosari">Arjosari</option>
                <option value="Bandar">Bandar</option>
                <option value="Donorojo">Donorojo</option>
                <option value="Kebonagung">Kebonagung</option>
                <option value="Pacitan">Pacitan</option>
                <option value="Pringkuku">Pringkuku</option>
                <option value="Punung">Punung</option>
                <option value="Sudimoro">Sudimoro</option>
                <option value="Tegalombo">Tegalombo</option>
                <option value="Tulakan">Tulakan</option>
                <option value="Nawangan">Nawangan</option>
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="sektor-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sektor
              </label>
              <select
                id="sektor-filter"
                value={filters.sektor}
                onChange={(e) => handleFilterChange("sektor", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="">Semua Sektor</option>
                <option value="Pariwisata">Pariwisata</option>
                <option value="Pertanian">Pertanian</option>
                <option value="Perikanan">Perikanan</option>
                <option value="UMKM">UMKM</option>
                <option value="Properti">Properti</option>
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="investasi-search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cari Peluang Investasi
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="investasi-search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Masukkan kata kunci..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
              </div>
            </div>

            <div className="items-end">
              <button
                onClick={resetFilters}
                className="bg-gray-100 mt-6 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition text-sm w-full md:w-auto"
              >
                <i className="fas fa-redo-alt mr-1"></i> Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Investasi List Section */}
        <div
          id="investasi-list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10"
        >
          {filteredInvestments.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <i className="fas fa-search text-gray-300 text-4xl mb-3"></i>
              <p className="text-gray-500">
                {investments.length === 0
                  ? "Belum ada peluang investasi yang tersedia."
                  : "Tidak ada peluang investasi yang sesuai dengan filter pencarian."}
              </p>
            </div>
          ) : (
            filteredInvestments.map((investment) => {
              const feasibilityBadge = getFeasibilityBadge(
                investment.feasibility
              );
              const sectorBadge = getSectorBadge(investment);

              return (
                <div
                  key={investment.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden card-hover flex flex-col h-full transition-all duration-400 hover:translate-y-[-5px] hover:shadow-xl"
                >
                  <div className="relative">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url('${investment.image}')` }}
                    ></div>
                    <span
                      className={`investment-badge absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${feasibilityBadge.class}`}
                    >
                      {feasibilityBadge.label}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col grow">
                    <div className="grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-dark line-clamp-2">
                          {investment.title}
                        </h3>
                      </div>

                      <span
                        className={`sector-badge inline-block px-3 py-1 rounded-full text-xs font-semibold ${sectorBadge.class} mb-2`}
                      >
                        {sectorBadge.label}
                      </span>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {investment.description}
                      </p>

                      <div className="mb-2">
                        <small className="text-gray-500">
                          <i className="fas fa-map-marker-alt me-1"></i>{" "}
                          {investment.location}
                        </small>
                      </div>

                      <div className="flex justify-between mb-3">
                        <div>
                          <div className="text-gray-500 text-xs">
                            Estimasi Modal
                          </div>
                          <div className="text-primary font-bold text-sm">
                            {investment.estimatedCapital}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">
                            Potensi Keuntungan
                          </div>
                          <div className="text-green-500 font-bold text-sm">
                            {investment.roi}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => handleViewDetail(investment.id)}
                        className="block w-full text-center bg-primary text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        <i className="fas fa-eye mr-1"></i> Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .card-hover {
          transition: all 0.4s ease;
        }

        .gradient-bg {
          background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
        }

        .gradient-bg-light {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PeluangInvestasiPage;
