// src/components/forms/InvestmentForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  addInvestment,
  updateInvestment,
  getInvestmentById,
  uploadToVercelBlob,
} from "@/lib/firestoreService";
import { InvestmentFormData } from "@/lib/types";

interface InvestmentFormProps {
  editId?: string | null;
}

export default function InvestmentForm({ editId }: InvestmentFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

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
    sektor: "Pariwisata",
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

  const [tempTag, setTempTag] = useState("");

  useEffect(() => {
    if (editId) {
      loadInvestmentData(editId);
    }
  }, [editId]);

  const loadInvestmentData = async (investmentId: string) => {
    try {
      setLoading(true);
      const investmentData = await getInvestmentById(investmentId);
      if (investmentData) {
        setFormData({
          title: investmentData.title,
          description: investmentData.description,
          image: investmentData.image,
          images: investmentData.images || [],
          estimatedCapital: investmentData.estimatedCapital,
          roi: investmentData.roi,
          tags: investmentData.tags || [],
          feasibility: investmentData.feasibility,
          location: investmentData.location,
          duration: investmentData.duration,
          kecamatan: investmentData.kecamatan || "",
          sektor: investmentData.sektor || "Pariwisata",
          potentialProfit: investmentData.potentialProfit || "",
          aiRecommendation: investmentData.aiRecommendation || "",
          detail: investmentData.detail || {
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
        setIsEdit(true);
      }
    } catch (error) {
      console.error("Error loading investment data:", error);
      alert("Gagal memuat data investasi");
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

    if (name.startsWith("detail.")) {
      const detailField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        detail: {
          ...prev.detail,
          [detailField]: value,
        },
      }));
    } else if (name.startsWith("detail.aiAnalysis.")) {
      const analysisField = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        detail: {
          ...prev.detail,
          aiAnalysis: {
            ...prev.detail.aiAnalysis,
            [analysisField]: value,
          },
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

  const handleTagAdd = () => {
    if (tempTag.trim() === "") return;

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tempTag.trim()],
    }));
    setTempTag("");
  };

  const handleTagRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    if (!formData.title || !formData.description || !formData.location) {
      alert("Judul, Deskripsi, dan Lokasi harus diisi");
      return;
    }

    try {
      setLoading(true);

      const investmentData = {
        ...formData,
        createdBy: user?.uid || "",
        status: "approved" as "approved", // Type assertion
        progress: 0,
      };

      if (isEdit && editId) {
        // Untuk update, hapus status karena kita tidak ingin mengubah status saat edit
        const { status, ...updateData } = investmentData;
        await updateInvestment(editId, updateData);
      } else {
        await addInvestment(investmentData, true);
      }

      router.push("/dashboard/admin/manajemen-investasi");
    } catch (error) {
      console.error("Error saving investment:", error);
      alert(`Gagal ${isEdit ? "mengupdate" : "menambahkan"} investasi`);
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

  const sektorList = [
    "Pariwisata",
    "Pertanian",
    "Perikanan",
    "UMKM",
    "Peternakan",
    "Perkebunan",
    "Industri Kreatif",
    "Energi Terbarukan",
    "Lainnya",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {isEdit ? "Edit Peluang Investasi" : "Tambah Peluang Investasi"}
              </h1>
              <p className="text-purple-100">
                {isEdit
                  ? "Perbarui data peluang investasi"
                  : "Tambahkan peluang investasi baru"}
              </p>
            </div>
            <button
              onClick={() =>
                router.push("/dashboard/admin/manajemen-investasi")
              }
              className="mt-4 md:mt-0 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Kembali
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informasi Dasar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Informasi Dasar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Investasi *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nama peluang investasi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sektor *
                </label>
                <select
                  name="sektor"
                  value={formData.sektor}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {sektorList.map((sektor) => (
                    <option key={sektor} value={sektor}>
                      {sektor}
                    </option>
                  ))}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  Lokasi Detail *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Desa/Jalan dan detail lokasi"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Singkat *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Deskripsi singkat tentang peluang investasi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Lengkap
              </label>
              <textarea
                name="detail.fullDescription"
                value={formData.detail.fullDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Deskripsi lengkap dan detail investasi"
              />
            </div>
          </div>

          {/* Gambar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Gambar Investasi
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
                  <p className="text-gray-600 mb-2">Upload gambar investasi</p>
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
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block"
              >
                {loading ? "Uploading..." : "Pilih Gambar"}
              </label>
            </div>
          </div>

          {/* Analisis Keuangan */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Analisis Keuangan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Modal
                </label>
                <input
                  type="text"
                  name="estimatedCapital"
                  value={formData.estimatedCapital}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Rp 100.000.000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ROI (Return on Investment)
                </label>
                <input
                  type="text"
                  name="roi"
                  value={formData.roi}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="15% per tahun"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi Investasi
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="5 tahun"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potensi Keuntungan
              </label>
              <input
                type="text"
                name="potentialProfit"
                value={formData.potentialProfit}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Deskripsi potensi keuntungan"
              />
            </div>
          </div>

          {/* Analisis AI */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Analisis AI</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rekomendasi AI
                </label>
                <textarea
                  name="aiRecommendation"
                  value={formData.aiRecommendation}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Rekomendasi dari analisis AI"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analisis Kelayakan
                </label>
                <input
                  type="text"
                  name="detail.aiAnalysis.feasibility"
                  value={formData.detail.aiAnalysis.feasibility}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Analisis kelayakan investasi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi ROI
                </label>
                <input
                  type="text"
                  name="detail.aiAnalysis.estimatedROI"
                  value={formData.detail.aiAnalysis.estimatedROI}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Estimasi ROI dari AI"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analisis Risiko
                </label>
                <input
                  type="text"
                  name="detail.aiAnalysis.risk"
                  value={formData.detail.aiAnalysis.risk}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Analisis risiko investasi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peluang
                </label>
                <input
                  type="text"
                  name="detail.aiAnalysis.opportunity"
                  value={formData.detail.aiAnalysis.opportunity}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Peluang yang tersedia"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Tags</h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={tempTag}
                onChange={(e) => setTempTag(e.target.value)}
                placeholder="Tambah tag"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Tambah
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Kontak</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informasi Kontak
              </label>
              <input
                type="text"
                name="detail.contact"
                value={formData.detail.contact}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nomor telepon/email kontak person"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/admin/manajemen-investasi")
              }
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {isEdit ? "Update Investasi" : "Simpan Investasi"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
