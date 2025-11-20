"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDesa } from "@/lib/firestoreService";
import { Desa } from "@/lib/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ProfilDesaPage() {
  const [desaData, setDesaData] = useState<Desa[]>([]);
  const [filteredDesa, setFilteredDesa] = useState<Desa[]>([]);
  const [loading, setLoading] = useState(true);
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data desa dari Firestore
  useEffect(() => {
    const fetchDesaData = async () => {
      try {
        const desaList = await getDesa();
        setDesaData(desaList);
        setFilteredDesa(desaList);
      } catch (error) {
        console.error("Error fetching desa data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesaData();
  }, []);

  // Filter data berdasarkan kecamatan dan pencarian
  useEffect(() => {
    let filtered = desaData;

    if (kecamatanFilter) {
      filtered = filtered.filter((desa) => desa.kecamatan === kecamatanFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (desa) =>
          desa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          desa.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDesa(filtered);
  }, [kecamatanFilter, searchTerm, desaData]);

  const kecamatanList = [...new Set(desaData.map((desa) => desa.kecamatan))];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
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
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Page Header */}
          {/* <div className="text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-dark mb-3">
              Profil Desa Kabupaten Pacitan
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
              Jelajahi kekayaan dan potensi {desaData.length} desa di Pacitan.
              Temukan peluang investasi, wisata alam, dan produk unggulan setiap
              desa.
            </p>
          </div> */}

          {/* Hero Section */}
          <div
            className="desa-hero mb-8 rounded-xl overflow-hidden"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')",
              height: "450px",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
            <div className="relative z-10 h-full flex items-end p-6">
              <div className="w-full">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Profil Desa Kabupaten Pacitan
                </h1>
                <p className="text-white text-base md:text-lg mb-4">
                  Jelajahi kekayaan dan potensi {desaData.length} desa di
                  Pacitan. Temukan peluang investasi, wisata alam, dan produk
                  unggulan setiap desa.
                </p>
                <button
                  onClick={() =>
                    document
                      .getElementById("desa-list")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-white text-primary font-semibold py-2 px-4 md:px-6 rounded-lg hover:bg-gray-100 transition text-sm"
                >
                  <i className="fas fa-search mr-2"></i> Jelajahi Desa
                </button>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-dark mb-4">
              <i className="fas fa-filter mr-2 text-primary"></i>Filter Desa
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
                  value={kecamatanFilter}
                  onChange={(e) => setKecamatanFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="">Semua Kecamatan</option>
                  {kecamatanList.map((kecamatan) => (
                    <option key={kecamatan} value={kecamatan}>
                      {kecamatan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="search-desa"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cari Desa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search-desa"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ketik nama desa atau kecamatan..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                </div>
              </div>

              <div className="items-end">
                <button
                  onClick={() => {
                    setKecamatanFilter("");
                    setSearchTerm("");
                  }}
                  className="bg-gray-100 mt-6 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition text-sm w-full md:w-auto"
                >
                  <i className="fas fa-redo-alt mr-1"></i> Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Menampilkan{" "}
              <span className="font-semibold text-primary">
                {filteredDesa.length}
              </span>{" "}
              dari <span className="font-semibold">{desaData.length}</span> desa
              {kecamatanFilter && (
                <span>
                  {" "}
                  di Kecamatan{" "}
                  <span className="font-semibold">{kecamatanFilter}</span>
                </span>
              )}
              {searchTerm && (
                <span>
                  {" "}
                  dengan kata kunci "
                  <span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>

          {/* Desa List Section */}
          <div
            id="desa-list"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8"
          >
            {filteredDesa.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-search text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Desa Tidak Ditemukan
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    Tidak ada desa yang sesuai dengan filter pencarian Anda.
                    Coba ubah kriteria pencarian atau reset filter.
                  </p>
                  <button
                    onClick={() => {
                      setKecamatanFilter("");
                      setSearchTerm("");
                    }}
                    className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm"
                  >
                    Tampilkan Semua Desa
                  </button>
                </div>
              </div>
            ) : (
              filteredDesa.map((desa) => (
                <div
                  key={desa.id}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  {/* Image Container */}
                  <div className="relative h-40 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${
                          desa.gambar || "/assets/images/default-desa.jpg"
                        }')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-primary font-semibold px-2 py-1 rounded-full text-xs">
                        {desa.kecamatan}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-lg font-bold text-white">
                        {desa.nama}
                      </h3>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {desa.deskripsi}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <i className="fas fa-users text-blue-600 text-xs"></i>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {desa.statistik.penduduk.toLocaleString()}
                          </div>
                          <div>Penduduk</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                          <i className="fas fa-store text-green-600 text-xs"></i>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {desa.statistik.umkm}
                          </div>
                          <div>UMKM</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                          <i className="fas fa-tractor text-orange-600 text-xs"></i>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {desa.statistik.pertanian} Ha
                          </div>
                          <div>Pertanian</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                          <i className="fas fa-mountain text-purple-600 text-xs"></i>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {desa.wisata.length}
                          </div>
                          <div>Wisata</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/profil-desa/${desa.id}`}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm flex items-center justify-center space-x-2 group/btn shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
                    >
                      <span>Jelajahi Desa</span>
                      <i className="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform duration-300 text-xs"></i>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
