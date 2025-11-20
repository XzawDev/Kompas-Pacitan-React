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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data desa...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header Section dengan Gradient */}
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white shadow-xl">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-bold mb-3">
                Profil Desa Kabupaten Pacitan
              </h1>
              <p className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Jelajahi kekayaan dan potensi {desaData.length} desa di Pacitan.
                Temukan peluang investasi, wisata alam, dan produk unggulan
                setiap desa.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-4">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex-1">
                <label
                  htmlFor="kecamatan-filter"
                  className="block text-sm font-semibold text-gray-800 mb-1"
                >
                  📍 Filter Kecamatan
                </label>
                <select
                  id="kecamatan-filter"
                  value={kecamatanFilter}
                  onChange={(e) => setKecamatanFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white hover:border-gray-300"
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
                  className="block text-sm font-semibold text-gray-800 mb-1"
                >
                  🔍 Cari Desa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search-desa"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ketik nama desa atau kecamatan..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white hover:border-gray-300"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <i className="fas fa-search text-sm"></i>
                  </div>
                </div>
              </div>

              <div className="flex lg:items-end">
                <button
                  onClick={() => {
                    setKecamatanFilter("");
                    setSearchTerm("");
                  }}
                  className="w-full lg:w-auto bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm border border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-1"
                >
                  <i className="fas fa-redo-alt text-xs"></i>
                  <span>Reset Filter</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
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
        </div>
      </main>
      <Footer />
    </>
  );
}
