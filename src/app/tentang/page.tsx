// app/tentang/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Tentang() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = [
    {
      number: "166",
      label: "Desa",
      description: "Tersebar di seluruh Pacitan",
    },
    { number: "12", label: "Kecamatan", description: "Wilayah administratif" },
    {
      number: "845+",
      label: "Aset Tercatat",
      description: "Potensi dan sumber daya",
    },
    {
      number: "4",
      label: "Sektor Unggulan",
      description: "Pariwisata, Pertanian, Perikanan, UMKM",
    },
  ];

  const tujuanItems = [
    {
      icon: "fas fa-globe",
      title: "Platform Interaktif",
      description:
        "Menyediakan platform interaktif berbasis teknologi yang dapat diakses secara gratis oleh masyarakat, investor, dan pemerintah daerah Pacitan.",
    },
    {
      icon: "fas fa-chart-line",
      title: "Perencanaan Pembangunan",
      description:
        "Membantu pemerintah daerah dalam merencanakan pembangunan yang relevan dengan kebutuhan dan potensi riil di setiap desa.",
    },
    {
      icon: "fas fa-brain",
      title: "Analisis Berbasis AI",
      description:
        "Memberikan fasilitas analisis data geospasial berbasis AI untuk mendukung pengambilan keputusan yang strategis, efisien, dan berbasis data.",
    },
    {
      icon: "fas fa-hand-holding-usd",
      title: "Daya Tarik Investasi",
      description:
        "Meningkatkan daya tarik investasi dengan menyediakan informasi potensi dan aset desa yang akurat, transparan, dan mudah diakses.",
    },
    {
      icon: "fas fa-chart-pie",
      title: "Tata Kelola Aset",
      description:
        "Mendorong peningkatan kualitas perencanaan dan tata kelola aset di tingkat desa supaya lebih kompetitif dan berdaya saing.",
    },
    {
      icon: "fas fa-users",
      title: "Pertumbuhan Ekonomi",
      description:
        "Memberikan kontribusi nyata bagi akselerasi pertumbuhan ekonomi daerah yang inklusif dan berkelanjutan, serta berbasis potensi lokal di Kabupaten Pacitan.",
    },
  ];

  const fiturItems = [
    {
      icon: "fas fa-map-marked-alt",
      title: "Peta Potensi Interaktif",
      description:
        "Fitur ini menyediakan peta digital Kabupaten Pacitan yang berisi lapisan-lapisan data aset dan potensi. Pengguna dapat mengakses peta tematik sesuai sektor dan memfilter data berdasarkan kecamatan, desa, atau jenis aset.",
    },
    {
      icon: "fas fa-house",
      title: "Profil Digital Desa",
      description:
        "Fitur ini menghadirkan profil lengkap untuk setiap desa secara virtual. Memungkinkan pengguna untuk melihat data demografi, infrastruktur, dan kelembagaan desa, serta mengeksplorasi narasi potensi unggulan.",
    },
    {
      icon: "fas fa-chart-bar",
      title: "Dasbor Analitik Pembangunan",
      description:
        "Fitur ini menyediakan alat analisis sederhana bagi pengambil keputusan, termasuk Analisis Kelayakan Lokasi dan Analisis Kesenjangan (Gap Analysis) yang memberikan visualisasi kesenjangan antara potensi sebuah wilayah dengan infrastruktur pendukungnya.",
    },
    {
      icon: "fas fa-robot",
      title: "AI Rekomendasi",
      description:
        "Sistem AI akan memberikan rekomendasi area dengan potensi tumpang tindih yang strategis dan memberikan umpan balik otomatis terkait area prioritas pembangunan dan potensi risiko investasi.",
    },
  ];

  const manfaatItems = [
    {
      icon: "fas fa-landmark",
      title: "Bagi Pemerintah Daerah",
      color: "#1a73e8",
      bgColor: "rgba(26, 115, 232, 0.1)",
      items: [
        "Menjadi instrument strategis dalam menurunkan angka pengangguran dan meningkatkan kesejahteraan masyarakat",
        "Mengoptimalkan bonus demografi sebagai modal pembangunan ekonomi jangka panjang",
        "Memperkuat daya tarik investasi dengan ketersediaan tenaga kerja lokal yang berkualitas",
      ],
    },
    {
      icon: "fas fa-building",
      title: "Bagi Dunia Usaha & Industri",
      color: "#34a853",
      bgColor: "rgba(52, 168, 83, 0.1)",
      items: [
        "Menyediakan informasi akurat untuk analisis kelayakan investasi",
        "Mengurangi biaya dan waktu survei awal ke lokasi",
        "Membuka peluang kemitraan dengan BUMDes dan UMKM lokal yang potensial",
      ],
    },
    {
      icon: "fas fa-chart-line",
      title: "Bagi Ekonomi Lokal",
      color: "#fbbc05",
      bgColor: "rgba(251, 188, 5, 0.1)",
      items: [
        "Mempercepat penyerapan tenaga kerja pada sektor-sektor unggulan daerah",
        "Meningkatkan kapasitas konsumsi rumah tangga yang berdampak pada perputaran ekonomi lokal",
        "Mengurangi arus urbanisasi dengan menyediakan peluang kerja yang layak di daerah",
      ],
    },
  ];

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-20 md:py-28 text-white"
        style={{
          background:
            'linear-gradient(135deg, rgba(26, 115, 232, 0.85) 0%, rgba(102, 126, 234, 0.85) 100%), url("https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute top-10 left-5 w-40 h-40 bg-white/10 backdrop-blur-md rounded-full animate-float"></div>

        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div
          className="absolute top-40 right-15 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full animate-float"
          style={{ animationDelay: "4s" }}
        ></div>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
              Tentang <span className="text-accent">Kompas Pacitan</span>
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90 max-w-3xl mx-auto">
              Platform digital inovatif untuk pemetaan potensi dan aset desa
              menuju pembangunan cerdas di Kabupaten Pacitan
            </p>
            <div className="mt-10">
              <a
                href="#tujuan"
                className="inline-flex items-center font-semibold px-6 py-3 rounded-xl text-base shadow-lg transition duration-300 bg-accent text-dark hover:bg-yellow-500"
              >
                Jelajahi Lebih Lanjut
                <i className="fas fa-arrow-down ml-2 text-xs"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center transition duration-300 hover:shadow-xl"
              >
                <div className="text-4xl font-bold mb-2 text-primary">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold mb-1 text-dark">
                  {stat.label}
                </div>
                <p className="text-gray-500 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Intro Section */}
      <section className="py-20 relative overflow-hidden bg-light">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
                Inovasi Digital untuk{" "}
                <span className="text-primary">Pembangunan Cerdas</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                KOMPAS PACITAN hadir sebagai solusi strategis dengan fitur peta
                interaktif, profil digital desa, dan alat analisis berbasis AI
                yang dirancang untuk menjadi panduan bagi seluruh pemangku
                kepentingan.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Kabupaten Pacitan, Jawa Timur, dianugerahi potensi sumber daya
                yang luar biasa, mulai dari sektor pariwisata berkelanjutan,
                perikanan modern, hingga pertanian ramah lingkungan. Potensi ini
                tersebar di 166 desa dan menjadi modal fundamental untuk
                akselerasi pertumbuhan ekonomi daerah.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-blue-50">
                      <i className="fas fa-bullseye text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">Visi</h4>
                      <p className="text-sm text-gray-600">
                        Platform digital terdepan untuk pembangunan ekonomi
                        inklusif
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-green-50">
                      <i className="fas fa-tasks text-secondary"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">Misi</h4>
                      <p className="text-sm text-gray-600">
                        Menyediakan akses informasi yang akurat dan transparan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold mb-6 text-center text-dark">
                    Mengapa Kompas Pacitan?
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="p-3 rounded-lg mr-4 bg-blue-50">
                        <i className="fas fa-database text-xl text-primary"></i>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-dark">
                          Data Terintegrasi
                        </h4>
                        <p className="text-gray-600">
                          Mengintegrasikan data potensi dari 166 desa dalam satu
                          platform terpusat
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="p-3 rounded-lg mr-4 bg-green-50">
                        <i className="fas fa-robot text-xl text-secondary"></i>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-dark">
                          Analisis AI
                        </h4>
                        <p className="text-gray-600">
                          Memanfaatkan kecerdasan buatan untuk analisis
                          kelayakan dan rekomendasi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="p-3 rounded-lg mr-4 bg-yellow-50">
                        <i className="fas fa-chart-line text-xl text-accent"></i>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2 text-dark">
                          Visualisasi Interaktif
                        </h4>
                        <p className="text-gray-600">
                          Menampilkan data dalam bentuk peta dan dashboard yang
                          mudah dipahami
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl animate-float bg-linear-to-r from-primary to-secondary">
                  <i className="fas fa-star"></i>
                </div>
                <div
                  className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full flex items-center justify-center text-white text-xl animate-float"
                  style={{
                    background: "linear-gradient(135deg, #fbbc05, #ea4335)",
                    animationDelay: "2s",
                  }}
                >
                  <i className="fas fa-lightbulb"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tujuan Section */}
      <section id="tujuan" className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-dark">
              Tujuan <span className="text-primary">Pengembangan</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              KOMPAS PACITAN dikembangkan dengan tujuan strategis untuk
              mendukung pembangunan daerah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tujuanItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-500 transition duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
                  }}
                >
                  <i className={`${item.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center text-dark">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur Utama Section */}
      <section className="py-20 text-white relative overflow-hidden bg-gradient-to-r from-[#667de9] to-[#764ca3]">
        <div className="absolute top-10 left-5 w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full animate-float"></div>

        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Fitur <span className="text-accent">Unggulan</span>
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Jelajahi berbagai fitur inovatif yang akan membantu Anda menemukan
              dan menganalisis potensi Pacitan
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fiturItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-start mb-4">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-lg mr-4">
                      <i className={`${item.icon} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="opacity-90">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manfaat Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-dark">
              Manfaat <span className="text-primary">Inovasi</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              KOMPAS PACITAN memberikan manfaat nyata bagi berbagai pemangku
              kepentingan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {manfaatItems.map((manfaat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl"
              >
                <div className="text-center mb-6">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: manfaat.bgColor }}
                  >
                    <i
                      className={`${manfaat.icon} text-2xl`}
                      style={{ color: manfaat.color }}
                    ></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-dark">
                    {manfaat.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {manfaat.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <i
                        className="fas fa-check mt-1 mr-3"
                        style={{ color: manfaat.color }}
                      ></i>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 text-white bg-primary">
        {/* Floating Bubbles (simple glass) */}
        <div className="absolute top-10 left-5 w-40 h-40 bg-white/10 backdrop-blur-md rounded-full"></div>
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Menemukan Potensi Pacitan?
          </h2>

          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Bergabunglah dengan Kompas Pacitan sekarang dan akses informasi
            lengkap tentang potensi desa serta peluang investasi.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="font-semibold px-8 py-4 rounded-xl text-lg bg-accent text-dark hover:bg-yellow-500 transition"
            >
              Daftar Sekarang
            </Link>

            <Link
              href="/login"
              className="border border-white/70 px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-primary transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
