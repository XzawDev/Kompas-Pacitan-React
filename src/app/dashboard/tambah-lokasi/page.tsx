"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { addLocation, uploadToVercelBlob } from "@/lib/firestoreService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Location } from "@/lib/types";

// Perbaiki tipe form data untuk menghilangkan field yang tidak diinginkan
type LocationFormData = Omit<
  Location,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "approvedBy"
  | "approvedAt"
  | "rejectionReason"
  | "status"
> & {
  potential?: "Sangat Tinggi" | "Tinggi" | "Sedang" | "Rendah";
  feasibility?: number;
};

export default function TambahLokasi() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    title: "",
    type: "Pariwisata",
    kecamatan: "",
    desa: "",
    description: "",
    alamat: "",
    kontak: "",
    fasilitas: [] as string[],
    coords: { lat: 0, lng: 0 },
    image: "",
    createdBy: "",
    // Berikan nilai default untuk field yang dihapus dari UI
    potential: "Sedang",
    feasibility: 50,
  });

  const [coordInputs, setCoordInputs] = useState({
    lat: "",
    lng: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Harap pilih file gambar yang valid");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validCoordRegex = /^-?\d*\.?\d*$/;

    if (value === "" || validCoordRegex.test(value)) {
      setCoordInputs((prev) => ({
        ...prev,
        [name]: value,
      }));

      const numValue = value === "" ? 0 : parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData((prev) => ({
          ...prev,
          coords: {
            ...prev.coords,
            [name]: numValue,
          },
        }));
      }
    }
  };

  const handleFasilitasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, fasilitas: [...prev.fasilitas, value] };
      } else {
        return {
          ...prev,
          fasilitas: prev.fasilitas.filter((item) => item !== value),
        };
      }
    });
  };

  const validateCoords = () => {
    const { lat, lng } = formData.coords;

    if (isNaN(lat) || isNaN(lng)) {
      alert("Koordinat harus berupa angka yang valid");
      return false;
    }

    if (lat < -90 || lat > 90) {
      alert("Latitude harus antara -90 dan 90 derajat");
      return false;
    }

    if (lng < -180 || lng > 180) {
      alert("Longitude harus antara -180 dan 180 derajat");
      return false;
    }

    return true;
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const imageUrl = await uploadToVercelBlob(file);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Anda harus login untuk menambahkan lokasi");
      return;
    }

    if (!validateCoords()) {
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        imageUrl = await uploadImageToStorage(selectedFile);
      }

      // Siapkan data untuk dikirim, termasuk field yang memiliki nilai default
      const locationData = {
        ...formData,
        image: imageUrl,
        createdBy: user.uid,
        coords: formData.coords || { lat: 0, lng: 0 },
        fasilitas: formData.fasilitas || [],
        // Pastikan field yang dihapus dari UI tetap memiliki nilai
        potential: formData.potential || "Sedang",
        feasibility: formData.feasibility || 50,
      };

      const isAdmin = user.role === "admin";
      await addLocation(locationData, isAdmin);

      if (isAdmin) {
        alert("Lokasi berhasil ditambahkan!");
      } else {
        alert("Lokasi berhasil diajukan! Menunggu persetujuan admin.");
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error adding location:", error);
      alert("Gagal menambahkan lokasi");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Tambah Lokasi Baru
                    </h1>
                    <p className="text-blue-100">
                      Isi form berikut untuk menambahkan lokasi potensial baru
                    </p>
                  </div>
                  {user.role === "admin" && (
                    <span className="mt-4 md:mt-0 bg-green-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                      <i className="fas fa-shield-alt mr-2"></i>
                      Mode Admin - Langsung Disetujui
                    </span>
                  )}
                </div>
              </div>

              {/* Admin Notice */}
              {user.role === "admin" && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 mt-6 rounded-lg">
                  <div className="flex items-start">
                    <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                    <div>
                      <h3 className="font-semibold text-blue-800 text-sm">
                        Mode Admin
                      </h3>
                      <p className="text-blue-600 text-sm mt-1">
                        Lokasi yang Anda tambahkan akan langsung disetujui dan
                        muncul di peta tanpa perlu menunggu persetujuan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Informasi Dasar */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Informasi Dasar
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lokasi *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Masukkan nama lokasi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Lokasi *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kecamatan *
                      </label>
                      <input
                        type="text"
                        name="kecamatan"
                        value={formData.kecamatan}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Masukkan nama kecamatan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desa *
                      </label>
                      <input
                        type="text"
                        name="desa"
                        value={formData.desa}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Masukkan nama desa"
                      />
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Deskripsi & Kontak
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Lokasi *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Jelaskan secara detail tentang lokasi ini..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Lengkap
                      </label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Alamat detail lokasi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kontak
                      </label>
                      <input
                        type="text"
                        name="kontak"
                        value={formData.kontak}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Nomor telepon atau kontak lainnya"
                      />
                    </div>
                  </div>
                </div>

                {/* Fasilitas */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Fasilitas
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      "Parkir",
                      "Toilet",
                      "Warung Makan",
                      "Mushola",
                      "Area Bermain",
                      "Penginapan",
                      "WiFi",
                      "Pemandu Wisata",
                      "Spot Foto",
                    ].map((fasilitas) => (
                      <label
                        key={fasilitas}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={fasilitas}
                          checked={formData.fasilitas.includes(fasilitas)}
                          onChange={handleFasilitasChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          {fasilitas}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Koordinat */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Koordinat Lokasi
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude *
                      </label>
                      <input
                        type="text"
                        name="lat"
                        value={coordInputs.lat}
                        onChange={handleCoordChange}
                        placeholder="Contoh: -8.2068"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        <i className="fas fa-info-circle mr-1"></i>
                        Gunakan titik (.) untuk desimal
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude *
                      </label>
                      <input
                        type="text"
                        name="lng"
                        value={coordInputs.lng}
                        onChange={handleCoordChange}
                        placeholder="Contoh: 111.0799"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        <i className="fas fa-info-circle mr-1"></i>
                        Gunakan titik (.) untuk desimal
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gambar */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Gambar Lokasi
                  </h2>

                  <div className="space-y-4">
                    {/* Upload File */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Upload Gambar
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-3"></i>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="text-blue-600 font-semibold">
                              Klik untuk upload
                            </span>{" "}
                            atau drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG (Maks. 5MB)
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Preview Gambar */}
                    {(imagePreview || formData.image) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Preview Gambar
                        </label>
                        <div className="flex flex-wrap gap-4">
                          {imagePreview && (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          {formData.image && !imagePreview && (
                            <div className="relative">
                              <img
                                src={formData.image}
                                alt="Current"
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* URL Gambar (Alternatif) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Atau Masukkan URL Gambar
                      </label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mengupload...
                      </>
                    ) : loading ? (
                      user.role === "admin" ? (
                        "Menambahkan..."
                      ) : (
                        "Mengajukan..."
                      )
                    ) : user.role === "admin" ? (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Tambah Lokasi
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Ajukan Lokasi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
