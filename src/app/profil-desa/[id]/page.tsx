"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDesaById } from "@/lib/firestoreService";
import { Desa } from "@/lib/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DetailDesaPage() {
  const params = useParams();
  const id = params.id as string;

  const [desa, setDesa] = useState<Desa | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDesaDetail = async () => {
      try {
        if (id) {
          const desaData = await getDesaById(id);
          setDesa(desaData);
        }
      } catch (error) {
        console.error("Error fetching desa detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesaDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data desa...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!desa) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Desa Tidak Ditemukan
            </h3>
            <p className="text-gray-500 mb-6">
              Data desa yang Anda cari tidak ditemukan.
            </p>
            <Link
              href="/profil-desa"
              className="bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all duration-300"
            >
              Kembali ke Daftar Desa
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        {/* Hero Section */}
        <div className="relative h-80 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('${
                desa.gambar || "/assets/images/default-desa.jpg"
              }')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {desa.nama}
                  </h1>
                  <p className="text-lg text-blue-100">
                    Kecamatan {desa.kecamatan}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link
                    href="/profil-desa"
                    className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all"
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>Kembali</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl -mt-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {desa.statistik.penduduk.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Penduduk</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {desa.statistik.luas} Ha
              </div>
              <div className="text-sm text-gray-600">Luas Wilayah</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {desa.statistik.umkm}
              </div>
              <div className="text-sm text-gray-600">UMKM</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {desa.wisata.length}
              </div>
              <div className="text-sm text-gray-600">Destinasi Wisata</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {[
                  { id: "overview", label: "Overview", icon: "info-circle" },
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
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Tentang Desa {desa.nama}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {desa.deskripsi}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        📊 Statistik Desa
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Jumlah Penduduk</span>
                          <span className="font-semibold">
                            {desa.statistik.penduduk.toLocaleString()} jiwa
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Luas Wilayah</span>
                          <span className="font-semibold">
                            {desa.statistik.luas} Ha
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">UMKM Aktif</span>
                          <span className="font-semibold">
                            {desa.statistik.umkm} unit
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Lahan Pertanian</span>
                          <span className="font-semibold">
                            {desa.statistik.pertanian} Ha
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        🏗️ Infrastruktur
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Kondisi Jalan</span>
                          <span className="font-semibold">
                            {desa.infrastruktur?.jalan || "Baik"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Akses Air Bersih
                          </span>
                          <span className="font-semibold">
                            {desa.infrastruktur?.air || "Tersedia"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Akses Internet</span>
                          <span className="font-semibold">
                            {desa.infrastruktur?.internet || "4G"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Fasilitas Kesehatan
                          </span>
                          <span className="font-semibold">
                            {desa.infrastruktur?.kesehatan ||
                              "Puskesmas Pembantu"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Potensi Tab */}
              {activeTab === "potensi" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    🎯 Potensi Desa
                  </h3>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Aset Tanah */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-landmark text-blue-600"></i>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Aset Tanah
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {desa.asetTanah && desa.asetTanah.length > 0 ? (
                          desa.asetTanah.map((aset, index) => (
                            <li key={index}>• {aset}</li>
                          ))
                        ) : (
                          <li className="text-gray-400">Belum ada data</li>
                        )}
                      </ul>
                    </div>

                    {/* BUMDes */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-building text-green-600"></i>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        BUMDes
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {desa.bumdes && desa.bumdes.length > 0 ? (
                          desa.bumdes.map((bumdes, index) => (
                            <li key={index}>• {bumdes}</li>
                          ))
                        ) : (
                          <li className="text-gray-400">Belum ada data</li>
                        )}
                      </ul>
                    </div>

                    {/* Sektor Unggulan */}
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-star text-orange-600"></i>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Sektor Unggulan
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pertanian</span>
                          <span className="font-semibold text-green-600">
                            {desa.statistik.pertanian > 100
                              ? "Sangat Potensial"
                              : "Potensial"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Wisata</span>
                          <span className="font-semibold text-blue-600">
                            {desa.wisata.length > 3
                              ? "Sangat Potensial"
                              : "Potensial"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">UMKM</span>
                          <span className="font-semibold text-purple-600">
                            {desa.statistik.umkm > 20
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
                    🏞️ Destinasi Wisata
                  </h3>

                  {desa.wisata && desa.wisata.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {desa.wisata.map((wisata, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="h-40 bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-image text-gray-400 text-2xl"></i>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {wisata}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              Destinasi wisata alam yang menarik di Desa{" "}
                              {desa.nama}
                            </p>
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
                    🛍️ Produk Unggulan Desa
                  </h3>

                  {desa.produkUnggulan && desa.produkUnggulan.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {desa.produkUnggulan.map((produk, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                            <i className="fas fa-box text-primary"></i>
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {produk}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Produk unggulan khas Desa {desa.nama} yang
                            berkualitas
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

              {/* Peluang Investasi Tab */}
              {activeTab === "investasi" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    💼 Peluang Investasi
                  </h3>

                  {desa.peluangInvestasi && desa.peluangInvestasi.length > 0 ? (
                    <div className="space-y-4">
                      {desa.peluangInvestasi.map((investasi, index) => (
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
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-chart-bar text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-gray-500">
                        Belum ada data peluang investasi
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Hubungi pemerintah desa untuk informasi lebih lanjut
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
