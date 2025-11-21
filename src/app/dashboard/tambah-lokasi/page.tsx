// src/app/dashboard/tambah-lokasi/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  addLocation,
  updateLocation,
  getLocationById,
  uploadToVercelBlob,
} from "@/lib/firestoreService";
import { Location } from "@/lib/types";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

// Komponen terpisah yang menggunakan useSearchParams
function TambahLokasiContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Pariwisata" as Location["type"],
    kecamatan: "",
    desa: "",
    description: "",
    image: "",
    potential: "Sedang" as Location["potential"],
    feasibility: 50,
    kontak: "",
    fasilitas: [] as string[],
    alamat: "",
    coords: {
      lat: -8.2065,
      lng: 111.046,
    },
  });

  const [tempFasilitas, setTempFasilitas] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (editId) {
      loadLocationData(editId);
    }
  }, [user, authLoading, router, editId]);

  const loadLocationData = async (locationId: string) => {
    try {
      setLoading(true);
      const locationData = await getLocationById(locationId);
      if (locationData) {
        setFormData({
          title: locationData.title,
          type: locationData.type,
          kecamatan: locationData.kecamatan,
          desa: locationData.desa,
          description: locationData.description,
          image: locationData.image,
          potential: locationData.potential,
          feasibility: locationData.feasibility,
          kontak: locationData.kontak,
          fasilitas: locationData.fasilitas || [],
          alamat: locationData.alamat || "",
          coords: locationData.coords,
        });
        setIsEdit(true);
      }
    } catch (error) {
      console.error("Error loading location data:", error);
      alert("Gagal memuat data lokasi");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("coords.")) {
      const coordField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        coords: {
          ...prev.coords,
          [coordField]: parseFloat(value) || 0,
        },
      }));
    } else if (name === "feasibility") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFasilitasAdd = () => {
    if (tempFasilitas.trim() === "") return;

    setFormData((prev) => ({
      ...prev,
      fasilitas: [...prev.fasilitas, tempFasilitas.trim()],
    }));
    setTempFasilitas("");
  };

  const handleFasilitasRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fasilitas: prev.fasilitas.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadToVercelBlob(file);
      setFormData((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal mengupload gambar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.kecamatan ||
      !formData.desa ||
      !formData.description
    ) {
      alert("Judul, Kecamatan, Desa, dan Deskripsi harus diisi");
      return;
    }

    try {
      setLoading(true);

      const locationData = {
        ...formData,
        createdBy: user?.uid || "",
        status: (user?.role === "admin" ? "approved" : "pending") as
          | "approved"
          | "pending",
      };

      if (isEdit && editId) {
        // Untuk update, hapus status karena kita tidak ingin mengubah status saat edit
        const { status, ...updateData } = locationData;
        await updateLocation(editId, updateData);
      } else {
        await addLocation(locationData, user?.role === "admin");
      }

      router.push("/dashboard/admin/manajemen-lokasi");
    } catch (error) {
      console.error("Error saving location:", error);
      alert(`Gagal ${isEdit ? "mengupdate" : "menambahkan"} lokasi`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <DashboardHeader onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      {isEdit ? "Edit Lokasi" : "Tambah Lokasi Baru"}
                    </h1>
                    <p className="text-blue-100">
                      {isEdit
                        ? "Perbarui data lokasi yang sudah ada"
                        : "Tambahkan data lokasi potensial baru"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      router.push("/dashboard/admin/manajemen-lokasi")
                    }
                    className="mt-4 md:mt-0 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Kembali
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Data Umum */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Data Umum
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Lokasi *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama lokasi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Lokasi *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Pariwisata">Pariwisata</option>
                        <option value="Pertanian">Pertanian</option>
                        <option value="Perikanan">Perikanan</option>
                        <option value="UMKM">UMKM</option>
                        <option value="Infrastruktur">Infrastruktur</option>
                        <option value="Aset Desa">Aset Desa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kecamatan *
                      </label>
                      <select
                        name="kecamatan"
                        value={formData.kecamatan}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Kecamatan</option>
                        {kecamatanList.map((kec) => (
                          <option key={kec} value={kec}>
                            {kec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desa *
                      </label>
                      <input
                        type="text"
                        name="desa"
                        value={formData.desa}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama desa"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Alamat detail lokasi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Deskripsikan lokasi secara detail"
                    />
                  </div>
                </div>

                {/* Gambar */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Gambar Lokasi
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.image ? (
                      <div className="mb-4">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="mx-auto h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, image: "" }))
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
                          Upload gambar lokasi
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                    >
                      {loading ? "Uploading..." : "Pilih Gambar"}
                    </label>
                  </div>
                </div>

                {/* Potensi & Kelayakan */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Analisis Potensi
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tingkat Potensi
                      </label>
                      <select
                        name="potential"
                        value={formData.potential}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Sangat Tinggi">Sangat Tinggi</option>
                        <option value="Tinggi">Tinggi</option>
                        <option value="Sedang">Sedang</option>
                        <option value="Rendah">Rendah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tingkat Kelayakan: {formData.feasibility}%
                      </label>
                      <input
                        type="range"
                        name="feasibility"
                        min="0"
                        max="100"
                        value={formData.feasibility}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Fasilitas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Fasilitas
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempFasilitas}
                      onChange={(e) => setTempFasilitas(e.target.value)}
                      placeholder="Tambah fasilitas"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleFasilitasAdd}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Tambah
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.fasilitas.map((fasilitas, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {fasilitas}
                        <button
                          type="button"
                          onClick={() => handleFasilitasRemove(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Kontak & Koordinat */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Kontak & Koordinat
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kontak
                      </label>
                      <input
                        type="text"
                        name="kontak"
                        value={formData.kontak}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nomor telepon/email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="coords.lat"
                        value={formData.coords.lat}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        name="coords.lng"
                        value={formData.coords.lng}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/dashboard/admin/manajemen-lokasi")
                    }
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        {isEdit ? "Update Lokasi" : "Simpan Lokasi"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Komponen utama dengan Suspense boundary
export default function TambahLokasi() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <TambahLokasiContent />
    </Suspense>
  );
}
