//src/app/dashboard/admin/tambah-desa/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { addDesa, uploadToVercelBlob } from "@/lib/firestoreService";
import { Desa, WisataItem } from "@/lib/types"; // Import WisataItem
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TambahProfilDesa() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploadingWisata, setUploadingWisata] = useState<string | null>(null);
  const [formData, setFormData] = useState<
    Omit<Desa, "id" | "createdAt" | "updatedAt">
  >({
    nama: "",
    kecamatan: "",
    deskripsi: "",
    gambar: "",
    koordinat: {
      lat: -8.2065,
      lng: 111.046,
    },
    statistik: {
      penduduk: 0,
      luas: 0,
      umkm: 0,
      pertanian: 0,
    },
    asetTanah: [],
    wisata: [], // Sekarang ini adalah WisataItem[]
    bumdes: [],
    produkUnggulan: [],
    infrastruktur: {
      jalan: "Baik",
      air: "Tersedia",
      internet: "4G",
      sekolah: "SD/SMP",
      kesehatan: "Puskesmas Pembantu",
      listrik: "PLN",
    },
    peluangInvestasi: [],
    galeri: [],
  });

  const [tempAsetTanah, setTempAsetTanah] = useState("");
  const [tempWisata, setTempWisata] = useState<WisataItem>({
    nama: "",
    gambar: "",
    deskripsi: "",
  });
  const [tempBumdes, setTempBumdes] = useState("");
  const [tempProduk, setTempProduk] = useState("");
  const [tempPeluang, setTempPeluang] = useState({
    judul: "",
    deskripsi: "",
    estimasiBiaya: "",
    kontak: "",
  });
  const [tempGaleri, setTempGaleri] = useState<File[]>([]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (tempWisata.gambar.startsWith("blob:")) {
        URL.revokeObjectURL(tempWisata.gambar);
      }
    };
  }, [tempWisata.gambar]);

  // Cek apakah user adalah admin
  if (user?.role !== "admin") {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-4">
              Akses Ditolak
            </h3>
            <p className="text-gray-600 mb-6">
              Hanya administrator yang dapat mengakses halaman ini.
            </p>
            <button
              onClick={() => router.push("/profil-desa")}
              className="bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all duration-300"
            >
              Kembali ke Profil Desa
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("statistik.")) {
      const statField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        statistik: {
          ...prev.statistik,
          [statField]:
            statField === "penduduk" || statField === "umkm"
              ? Number(value)
              : value,
        },
      }));
    } else if (name.startsWith("infrastruktur.")) {
      const infraField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        infrastruktur: {
          ...prev.infrastruktur,
          [infraField]: value,
        },
      }));
    } else if (name.startsWith("koordinat.")) {
      const coordField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        koordinat: {
          ...prev.koordinat,
          [coordField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Fungsi untuk mengonversi string ke number dengan handle simbol
  const parseNumberWithSymbols = (value: string): number => {
    const cleaned = value.replace(",", ".").replace(/[^\d.-]/g, "");
    return parseFloat(cleaned) || 0;
  };

  const handleArrayAdd = (
    field: "asetTanah" | "bumdes" | "produkUnggulan",
    value: string,
    setTemp: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim() === "") return;

    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    setTemp("");
  };

  const handleArrayRemove = (
    field: "asetTanah" | "bumdes" | "produkUnggulan",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Handle untuk wisata
  const handleWisataChange = (field: keyof WisataItem, value: string) => {
    setTempWisata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWisataImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar tidak boleh lebih dari 5MB");
      return;
    }

    try {
      setUploadingWisata("wisata");
      const imageUrl = await uploadToVercelBlob(file);
      setTempWisata((prev) => ({
        ...prev,
        gambar: imageUrl,
      }));
    } catch (error) {
      console.error("Error uploading wisata image:", error);
      alert("Gagal mengupload gambar wisata");
    } finally {
      setUploadingWisata(null);
    }
  };

  const handleWisataAdd = () => {
    if (!tempWisata.nama.trim() || !tempWisata.deskripsi.trim()) {
      alert("Nama dan deskripsi wisata harus diisi");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      wisata: [...prev.wisata, { ...tempWisata }],
    }));

    setTempWisata({
      nama: "",
      gambar: "",
      deskripsi: "",
    });
  };

  const handleWisataRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      wisata: prev.wisata.filter((_, i) => i !== index),
    }));
  };

  const handlePeluangAdd = () => {
    if (!tempPeluang.judul.trim() || !tempPeluang.deskripsi.trim()) return;

    setFormData((prev) => ({
      ...prev,
      peluangInvestasi: [...prev.peluangInvestasi, { ...tempPeluang }],
    }));

    setTempPeluang({
      judul: "",
      deskripsi: "",
      estimasiBiaya: "",
      kontak: "",
    });
  };

  const handlePeluangRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      peluangInvestasi: prev.peluangInvestasi.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar tidak boleh lebih dari 5MB");
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadToVercelBlob(file);
      setFormData((prev) => ({
        ...prev,
        gambar: imageUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal mengupload gambar");
    } finally {
      setLoading(false);
    }
  };

  const handleGaleriUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("Semua file harus berupa gambar");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar tidak boleh lebih dari 5MB");
        return;
      }
    }

    try {
      setLoading(true);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const imageUrl = await uploadToVercelBlob(file);
        uploadedUrls.push(imageUrl);
      }

      setFormData((prev) => ({
        ...prev,
        galeri: [...prev.galeri, ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Error uploading gallery images:", error);
      alert("Gagal mengupload gambar galeri");
    } finally {
      setLoading(false);
    }
  };

  const handleGaleriRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galeri: prev.galeri.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama || !formData.kecamatan || !formData.deskripsi) {
      alert("Nama, Kecamatan, dan Deskripsi harus diisi");
      return;
    }

    // Konversi nilai string ke number untuk statistik
    const dataToSubmit = {
      ...formData,
      statistik: {
        penduduk: Number(formData.statistik.penduduk) || 0,
        luas: parseNumberWithSymbols(formData.statistik.luas as any),
        umkm: Number(formData.statistik.umkm) || 0,
        pertanian: parseNumberWithSymbols(formData.statistik.pertanian as any),
      },
      koordinat: {
        lat: parseNumberWithSymbols(formData.koordinat.lat as any),
        lng: parseNumberWithSymbols(formData.koordinat.lng as any),
      },
      asetTanah: formData.asetTanah || [],
      wisata: formData.wisata || [],
      bumdes: formData.bumdes || [],
      produkUnggulan: formData.produkUnggulan || [],
      peluangInvestasi: formData.peluangInvestasi || [],
      galeri: formData.galeri || [],
      infrastruktur: {
        jalan: formData.infrastruktur?.jalan || "Baik",
        air: formData.infrastruktur?.air || "Tersedia",
        internet: formData.infrastruktur?.internet || "4G",
        sekolah: formData.infrastruktur?.sekolah || "SD/SMP",
        kesehatan: formData.infrastruktur?.kesehatan || "Puskesmas Pembantu",
        listrik: formData.infrastruktur?.listrik || "PLN",
      },
    };

    try {
      setLoading(true);
      await addDesa(dataToSubmit);
      alert("Profil desa berhasil ditambahkan!");
      router.push("/profil-desa");
    } catch (error) {
      console.error("Error adding desa:", error);
      alert("Gagal menambahkan profil desa");
    } finally {
      setLoading(false);
    }
  };

  const kecamatanList = [
    "Pacitan",
    "Kebonagung",
    "Arjosari",
    "Nawangan",
    "Bandar",
    "Tegalombo",
    "Tulakan",
    "Ngadirojo",
    "Sudimoro",
    "Pringkuku",
    "Punung",
    "Donorojo",
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Tambah Profil Desa
                </h1>
                <p className="text-gray-600 mt-2">
                  Tambahkan data profil desa baru ke dalam sistem
                </p>
              </div>
              <button
                onClick={() => router.push("/profil-desa")}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all font-semibold"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Kembali
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Data Umum */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-info-circle text-primary mr-3"></i>
                Data Umum Desa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Desa *
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Masukkan nama desa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan *
                  </label>
                  <select
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Pilih Kecamatan</option>
                    {kecamatanList.map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Desa *
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Deskripsikan potensi dan karakteristik desa"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Utama
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    {formData.gambar ? (
                      <div className="mb-4">
                        <img
                          src={formData.gambar}
                          alt="Preview"
                          className="mx-auto h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, gambar: "" }))
                          }
                          className="text-red-600 text-sm mt-2"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-cloud-upload-alt text-gray-400 text-4xl mb-3"></i>
                        <p className="text-gray-600 mb-2">
                          Upload gambar utama desa
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="gambar-upload"
                    />
                    <label
                      htmlFor="gambar-upload"
                      className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all cursor-pointer inline-block"
                    >
                      {loading ? "Uploading..." : "Pilih Gambar"}
                    </label>
                  </div>
                </div>

                {/* Upload Galeri */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Galeri Desa (Multiple Images)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <div className="text-center mb-4">
                      <i className="fas fa-images text-gray-400 text-4xl mb-3"></i>
                      <p className="text-gray-600 mb-2">
                        Upload gambar untuk galeri desa
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGaleriUpload}
                      className="hidden"
                      id="galeri-upload"
                    />
                    <label
                      htmlFor="galeri-upload"
                      className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-all cursor-pointer inline-block"
                    >
                      {loading ? "Uploading..." : "Pilih Multiple Gambar"}
                    </label>

                    {/* Preview Galeri */}
                    {formData.galeri.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Gambar Galeri:
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {formData.galeri.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Galeri ${index + 1}`}
                                className="h-24 w-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => handleGaleriRemove(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Koordinat */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-3"></i>
                Koordinat Geografis
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="koordinat.lat"
                    value={formData.koordinat.lat}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="-8.2065"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contoh: -8.2065 (bisa menggunakan titik dan minus)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="koordinat.lng"
                    value={formData.koordinat.lng}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="111.046"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contoh: 111.046 (bisa menggunakan titik)
                  </p>
                </div>
              </div>
            </div>

            {/* Statistik */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-chart-bar text-primary mr-3"></i>
                Data Statistik
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Penduduk
                  </label>
                  <input
                    type="number"
                    name="statistik.penduduk"
                    value={formData.statistik.penduduk}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luas Wilayah (Ha)
                  </label>
                  <input
                    type="text"
                    name="statistik.luas"
                    value={formData.statistik.luas}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contoh: 125.50 atau 125,50
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah UMKM
                  </label>
                  <input
                    type="number"
                    name="statistik.umkm"
                    value={formData.statistik.umkm}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luas Pertanian (Ha)
                  </label>
                  <input
                    type="text"
                    name="statistik.pertanian"
                    value={formData.statistik.pertanian}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contoh: 75.25 atau 75,25
                  </p>
                </div>
              </div>
            </div>

            {/* Aset Tanah */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-landmark text-primary mr-3"></i>
                Aset Tanah
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={tempAsetTanah}
                    onChange={(e) => setTempAsetTanah(e.target.value)}
                    placeholder="Tambahkan aset tanah"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleArrayAdd(
                        "asetTanah",
                        tempAsetTanah,
                        setTempAsetTanah
                      )
                    }
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-semibold"
                  >
                    Tambah
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.asetTanah.map((aset, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span>{aset}</span>
                      <button
                        type="button"
                        onClick={() => handleArrayRemove("asetTanah", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Destinasi Wisata */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-mountain text-primary mr-3"></i>
                Destinasi Wisata
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Wisata
                    </label>
                    <input
                      type="text"
                      value={tempWisata.nama}
                      onChange={(e) =>
                        handleWisataChange("nama", e.target.value)
                      }
                      placeholder="Nama destinasi wisata"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar Wisata
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                      {tempWisata.gambar ? (
                        <div className="mb-3">
                          <img
                            src={tempWisata.gambar}
                            alt="Preview"
                            className="mx-auto h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleWisataChange("gambar", "")}
                            className="text-red-600 text-sm mt-1"
                          >
                            Hapus Gambar
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <i className="fas fa-camera text-gray-400 text-2xl mb-2"></i>
                          <p className="text-gray-600 text-sm">
                            Upload gambar wisata
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleWisataImageUpload}
                        className="hidden"
                        id="wisata-image-upload"
                      />
                      <label
                        htmlFor="wisata-image-upload"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all cursor-pointer inline-block text-sm"
                      >
                        {uploadingWisata === "wisata"
                          ? "Uploading..."
                          : "Pilih Gambar"}
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Singkat
                    </label>
                    <textarea
                      value={tempWisata.deskripsi}
                      onChange={(e) =>
                        handleWisataChange("deskripsi", e.target.value)
                      }
                      rows={3}
                      placeholder="Deskripsi singkat tentang wisata ini"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleWisataAdd}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  Tambah Wisata
                </button>

                {/* Daftar Wisata yang sudah ditambahkan */}
                <div className="space-y-4">
                  {formData.wisata.map((wisata, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {wisata.nama}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {wisata.deskripsi}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleWisataRemove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      {wisata.gambar && (
                        <img
                          src={wisata.gambar}
                          alt={wisata.nama}
                          className="h-48 w-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BUMDes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-building text-primary mr-3"></i>
                BUMDes (Badan Usaha Milik Desa)
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={tempBumdes}
                    onChange={(e) => setTempBumdes(e.target.value)}
                    placeholder="Tambahkan BUMDes"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleArrayAdd("bumdes", tempBumdes, setTempBumdes)
                    }
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-semibold"
                  >
                    Tambah
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.bumdes.map((bumdes, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span>{bumdes}</span>
                      <button
                        type="button"
                        onClick={() => handleArrayRemove("bumdes", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Produk Unggulan */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-shopping-bag text-primary mr-3"></i>
                Produk Unggulan
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={tempProduk}
                    onChange={(e) => setTempProduk(e.target.value)}
                    placeholder="Tambahkan produk unggulan"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleArrayAdd(
                        "produkUnggulan",
                        tempProduk,
                        setTempProduk
                      )
                    }
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-semibold"
                  >
                    Tambah
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.produkUnggulan.map((produk, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span>{produk}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleArrayRemove("produkUnggulan", index)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Infrastruktur */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-road text-primary mr-3"></i>
                Infrastruktur
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kondisi Jalan
                  </label>
                  <select
                    name="infrastruktur.jalan"
                    value={formData.infrastruktur.jalan}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akses Air Bersih
                  </label>
                  <select
                    name="infrastruktur.air"
                    value={formData.infrastruktur.air}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Terbatas">Terbatas</option>
                    <option value="Tidak Tersedia">Tidak Tersedia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akses Internet
                  </label>
                  <select
                    name="infrastruktur.internet"
                    value={formData.infrastruktur.internet}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="4G">4G</option>
                    <option value="3G">3G</option>
                    <option value="2G">2G</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fasilitas Kesehatan
                  </label>
                  <select
                    name="infrastruktur.kesehatan"
                    value={formData.infrastruktur.kesehatan}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="Puskesmas Pembantu">
                      Puskesmas Pembantu
                    </option>
                    <option value="Puskesmas">Puskesmas</option>
                    <option value="Klinik">Klinik</option>
                    <option value="Posyandu">Posyandu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Peluang Investasi */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-chart-line text-primary mr-3"></i>
                Peluang Investasi
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Peluang
                    </label>
                    <input
                      type="text"
                      value={tempPeluang.judul}
                      onChange={(e) =>
                        setTempPeluang((prev) => ({
                          ...prev,
                          judul: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimasi Biaya
                    </label>
                    <input
                      type="text"
                      value={tempPeluang.estimasiBiaya}
                      onChange={(e) =>
                        setTempPeluang((prev) => ({
                          ...prev,
                          estimasiBiaya: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={tempPeluang.deskripsi}
                      onChange={(e) =>
                        setTempPeluang((prev) => ({
                          ...prev,
                          deskripsi: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kontak
                    </label>
                    <input
                      type="text"
                      value={tempPeluang.kontak}
                      onChange={(e) =>
                        setTempPeluang((prev) => ({
                          ...prev,
                          kontak: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePeluangAdd}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  Tambah Peluang Investasi
                </button>

                <div className="space-y-4">
                  {formData.peluangInvestasi.map((peluang, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">
                          {peluang.judul}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handlePeluangRemove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <p className="text-gray-600 mb-2">{peluang.deskripsi}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Estimasi: {peluang.estimasiBiaya}</span>
                        <span>Kontak: {peluang.kontak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/profil-desa")}
                className="bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Simpan Profil Desa
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
