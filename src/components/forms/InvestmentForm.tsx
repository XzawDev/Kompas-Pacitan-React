"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { addInvestment } from "@/lib/firestoreService";
import { InvestmentFormData, UploadState } from "@/lib/types";

const InvestmentForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [uploadState, setUploadState] = useState<UploadState>({
    mainImage: null,
    additionalImages: [],
    uploading: false,
    uploadProgress: 0,
  });

  const [formData, setFormData] = useState<InvestmentFormData>({
    title: "",
    description: "",
    image: "",
    images: [],
    estimatedCapital: "",
    roi: "",
    tags: [],
    feasibility: 50,
    location: "",
    duration: "",
    kecamatan: "",
    sektor: "",
    potentialProfit: "",
    aiRecommendation: "",
    detail: {
      fullDescription: "",
      contact: "",
      aiAnalysis: {
        feasibility: "",
        estimatedROI: "",
        risk: "",
        opportunity: "",
      },
    },
  });

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk upload gambar ke Vercel Blob
  const uploadToBlob = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/upload?filename=${file.name}`, {
      method: "POST",
      body: file,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const blob = await response.json();
    return blob.url;
  };

  // Handle upload gambar utama
  const handleMainImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file type
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    // Validasi file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploadState((prev) => ({ ...prev, uploading: true, uploadProgress: 0 }));

    try {
      const imageUrl = await uploadToBlob(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      setUploadState((prev) => ({ ...prev, mainImage: file }));

      // Simulasi progress (optional)
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => {
          setUploadState((prev) => ({ ...prev, uploadProgress: i }));
        }, i * 20);
      }
    } catch (error) {
      console.error("Error uploading main image:", error);
      alert("Gagal mengupload gambar utama");
    } finally {
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        uploadProgress: 0,
      }));
    }
  };

  // Handle upload gambar tambahan
  const handleAdditionalImagesUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validasi file type dan size
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} harus berupa gambar`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar (maksimal 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadState((prev) => ({ ...prev, uploading: true }));

    try {
      const uploadPromises = validFiles.map((file) => uploadToBlob(file));
      const imageUrls = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));
      setUploadState((prev) => ({
        ...prev,
        additionalImages: [...prev.additionalImages, ...validFiles],
      }));
    } catch (error) {
      console.error("Error uploading additional images:", error);
      alert("Gagal mengupload gambar tambahan");
    } finally {
      setUploadState((prev) => ({ ...prev, uploading: false }));
    }
  };

  // Hapus gambar utama
  const removeMainImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setUploadState((prev) => ({ ...prev, mainImage: null }));
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = "";
    }
  };

  // Hapus gambar tambahan
  const removeAdditionalImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setUploadState((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Anda harus login terlebih dahulu");
      return;
    }

    // Validasi required fields
    if (!formData.title || !formData.description || !formData.image) {
      alert("Judul, deskripsi, dan gambar utama harus diisi");
      return;
    }

    try {
      setLoading(true);

      // Siapkan data untuk Firestore
      const investmentData = {
        ...formData,
        progress: 0,
        createdBy: user.uid,
        tags: formData.tags.length > 0 ? formData.tags : [formData.sektor],
        // Jika potentialProfit tidak diisi, gunakan ROI
        potentialProfit: formData.potentialProfit || formData.roi,
        // Generate AI recommendation berdasarkan feasibility
        aiRecommendation:
          formData.aiRecommendation ||
          `Tingkat kelayakan: ${formData.feasibility}% - ${
            formData.feasibility >= 80
              ? "Sangat layak untuk investasi"
              : formData.feasibility >= 60
              ? "Cukup layak untuk investasi"
              : "Perlu pertimbangan lebih lanjut"
          }`,
        detail: {
          ...formData.detail,
          aiAnalysis: {
            feasibility: `${formData.feasibility}% ${
              formData.feasibility >= 80
                ? "(Sangat Layak)"
                : formData.feasibility >= 60
                ? "(Cukup Layak)"
                : "(Perlu Evaluasi)"
            }`,
            estimatedROI: formData.duration || "3-5 Tahun",
            risk:
              formData.detail.aiAnalysis.risk ||
              "Risiko sedang - perlu analisis lebih lanjut",
            opportunity:
              formData.detail.aiAnalysis.opportunity ||
              "Potensi pengembangan yang baik di masa depan",
          },
        },
      };

      await addInvestment(investmentData, user.role === "admin");

      alert("Investasi berhasil ditambahkan dan menunggu persetujuan admin");
      router.push("/peluang-investasi");
    } catch (error) {
      console.error("Error adding investment:", error);
      alert("Gagal menambahkan investasi");
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-dark mb-6">
          Tambah Peluang Investasi Baru
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Informasi Dasar</h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Investasi *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contoh: Pengembangan Wisata Pantai Teleng Ria"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Singkat *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Deskripsikan peluang investasi secara singkat..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sektor *
            </label>
            <select
              required
              value={formData.sektor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sektor: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Pilih Sektor</option>
              <option value="Pariwisata">Pariwisata</option>
              <option value="Pertanian">Pertanian</option>
              <option value="Perikanan">Perikanan</option>
              <option value="UMKM">UMKM</option>
              <option value="Properti">Properti</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kecamatan *
            </label>
            <select
              required
              value={formData.kecamatan}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kecamatan: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Pilih Kecamatan</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Detail *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contoh: Desa Sidoharjo, Kec. Pacitan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durasi *
            </label>
            <input
              type="text"
              required
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contoh: 3-4 Tahun"
            />
          </div>

          {/* Financial Information */}
          <div className="md:col-span-2 mt-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Keuangan</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimasi Modal *
            </label>
            <input
              type="text"
              required
              value={formData.estimatedCapital}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedCapital: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contoh: Rp 1.2 Miliar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ROI (Return on Investment) *
            </label>
            <input
              type="text"
              required
              value={formData.roi}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, roi: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contoh: 22% per tahun"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potensi Keuntungan/Tahun
            </label>
            <input
              type="text"
              value={formData.potentialProfit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  potentialProfit: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contoh: Rp 350 Juta/tahun"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tingkat Kelayakan (%) *
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={formData.feasibility}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  feasibility: parseInt(e.target.value),
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formData.feasibility}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formData.feasibility >= 80
                  ? "Sangat Layak"
                  : formData.feasibility >= 60
                  ? "Cukup Layak"
                  : "Perlu Evaluasi"}
              </div>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="md:col-span-2 mt-6">
            <h3 className="text-lg font-semibold mb-4">Upload Gambar</h3>
          </div>

          {/* Upload Gambar Utama */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Utama *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                ref={mainImageInputRef}
                onChange={handleMainImageUpload}
                accept="image/*"
                className="hidden"
                required
              />

              {!formData.image ? (
                <div>
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                  <p className="text-sm text-gray-600 mb-2">
                    Klik untuk upload gambar utama
                  </p>
                  <p className="text-xs text-gray-500">
                    Format: JPG, PNG, WEBP (Maks. 5MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => mainImageInputRef.current?.click()}
                    className="mt-3 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Pilih Gambar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mx-auto h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <i className="fas fa-times text-sm"></i>
                  </button>
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Gambar utama berhasil diupload
                  </p>
                </div>
              )}

              {uploadState.uploading && uploadState.mainImage && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mengupload... {uploadState.uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Gambar Tambahan */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Tambahan (Opsional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                ref={additionalImagesInputRef}
                onChange={handleAdditionalImagesUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              <div className="text-center mb-4">
                <i className="fas fa-images text-gray-400 text-2xl mb-2"></i>
                <p className="text-sm text-gray-600 mb-2">
                  Upload gambar tambahan untuk galeri
                </p>
                <button
                  type="button"
                  onClick={() => additionalImagesInputRef.current?.click()}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                  disabled={uploadState.uploading}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tambah Gambar
                </button>
              </div>

              {/* Preview Gambar Tambahan */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Additional ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deskripsi Lengkap */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Lengkap *
            </label>
            <textarea
              required
              value={formData.detail.fullDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  detail: { ...prev.detail, fullDescription: e.target.value },
                }))
              }
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Jelaskan secara detail tentang peluang investasi ini..."
            />
          </div>

          {/* Informasi Kontak */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informasi Kontak *
            </label>
            <textarea
              required
              value={formData.detail.contact}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  detail: { ...prev.detail, contact: e.target.value },
                }))
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Contoh: Bapak Sutrisno (Kepala Desa)&#10;Telepon: 0812-3456-7890&#10;Email: contoh@desa.id"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading || uploadState.uploading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || uploadState.uploading || !formData.image}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Simpan Investasi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InvestmentForm;
