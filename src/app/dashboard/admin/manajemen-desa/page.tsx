"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDesa, deleteDesa } from "@/lib/firestoreService";
import { Desa } from "@/lib/types";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function ManajemenDesa() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    loadDesa();
  }, [user, authLoading, router]);

  const loadDesa = async () => {
    try {
      setLoading(true);
      const desaData = await getDesa();
      setDesaList(desaData);
    } catch (error) {
      console.error("Error loading desa:", error);
      alert("Gagal memuat data desa");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (desaId: string) => {
    router.push(`/dashboard/admin/tambah-desa?edit=${desaId}`);
  };

  const handleDelete = async (desaId: string, desaName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus desa "${desaName}"?`)) {
      return;
    }

    try {
      await deleteDesa(desaId);
      alert("Desa berhasil dihapus");
      loadDesa();
    } catch (error) {
      console.error("Error deleting desa:", error);
      alert("Gagal menghapus desa");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter desa berdasarkan search term
  const filteredDesa = desaList.filter(
    (desa) =>
      desa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desa.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
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
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Manajemen Desa
                    </h1>
                    <p className="text-green-100">
                      Kelola semua data desa yang terdaftar dalam sistem
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Total: {desaList.length} Desa
                    </span>
                    <button
                      onClick={() =>
                        router.push("/dashboard/admin/tambah-desa")
                      }
                      className="bg-white text-green-600 text-sm font-medium px-4 py-1 rounded-full hover:bg-green-50 transition-colors"
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Tambah Desa
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="Cari nama desa atau kecamatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desa Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kecamatan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statistik
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wisata & UMKM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDesa.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {loading
                            ? "Memuat data..."
                            : "Tidak ada data desa yang ditemukan"}
                        </td>
                      </tr>
                    ) : (
                      filteredDesa.map((desa) => (
                        <tr key={desa.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={
                                    desa.gambar ||
                                    "/assets/images/default-village.jpg"
                                  }
                                  alt={desa.nama}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {desa.nama}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                                  {desa.deskripsi}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {desa.kecamatan}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              Penduduk:{" "}
                              {desa.statistik?.penduduk?.toLocaleString() || 0}
                            </div>
                            <div>Luas: {desa.statistik?.luas || 0} Ha</div>
                            <div>UMKM: {desa.statistik?.umkm || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>Wisata: {desa.wisata?.length || 0}</div>
                            <div>
                              Produk: {desa.produkUnggulan?.length || 0}
                            </div>
                            <div>BUMDes: {desa.bumdes?.length || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {desa.createdAt
                              ? new Date(desa.createdAt).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(desa.id)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(desa.id, desa.nama)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Info hasil filter */}
              {filteredDesa.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      Menampilkan{" "}
                      <span className="font-medium">{filteredDesa.length}</span>{" "}
                      dari{" "}
                      <span className="font-medium">{desaList.length}</span>{" "}
                      desa
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Hapus filter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
