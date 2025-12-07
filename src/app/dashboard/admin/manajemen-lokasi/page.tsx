"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getLocations, deleteLocation } from "@/lib/firestoreService";
import { Location } from "@/lib/types";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function ManajemenLokasi() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin" && user?.role !== "owner") {
      router.push("/dashboard");
      return;
    }

    loadLocations();
  }, [user, authLoading, router]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const allLocations = await getLocations();
      setLocations(allLocations);
    } catch (error) {
      console.error("Error loading locations:", error);
      alert("Gagal memuat data lokasi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (locationId: string) => {
    router.push(`/dashboard/tambah-lokasi?edit=${locationId}`);
  };

  const handleDelete = async (locationId: string, locationName: string) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus lokasi "${locationName}"?`)
    ) {
      return;
    }

    try {
      await deleteLocation(locationId);
      alert("Lokasi berhasil dihapus");
      loadLocations();
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Gagal menghapus lokasi");
    }
  };

  const handleAddNew = () => {
    router.push("/dashboard/tambah-lokasi");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter locations berdasarkan search term dan status
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.kecamatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || location.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { color: "bg-green-100 text-green-800", label: "Disetujui" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Menunggu" },
      rejected: { color: "bg-red-100 text-red-800", label: "Ditolak" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
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
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Manajemen Lokasi
                    </h1>
                    <p className="text-blue-100">
                      Kelola semua data lokasi yang terdaftar dalam sistem
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Total: {locations.length} Lokasi
                    </span>
                    <button
                      onClick={handleAddNew}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Tambah Lokasi
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
                        placeholder="Cari lokasi, desa, atau kecamatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Semua Status</option>
                      <option value="approved">Disetujui</option>
                      <option value="pending">Menunggu</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat data lokasi...</p>
                </div>
              )}

              {/* Locations Table */}
              {!loading && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Jenis
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Desa/Kecamatan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLocations.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                              <p className="text-lg font-medium text-gray-500 mb-1">
                                Tidak ada data lokasi
                              </p>
                              <p className="text-sm text-gray-400 mb-4">
                                {searchTerm || statusFilter !== "all"
                                  ? "Coba ubah filter pencarian Anda"
                                  : "Tambahkan lokasi pertama Anda"}
                              </p>
                              {!searchTerm && statusFilter === "all" && (
                                <button
                                  onClick={handleAddNew}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <i className="fas fa-plus mr-2"></i>
                                  Tambah Lokasi Pertama
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredLocations.map((location) => (
                          <tr key={location.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover"
                                    src={
                                      location.image ||
                                      "/assets/images/default-location.jpg"
                                    }
                                    alt={location.title}
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/assets/images/default-location.jpg";
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {location.title}
                                  </div>
                                  <div className="text-sm text-gray-500 line-clamp-2">
                                    {location.description}
                                  </div>
                                  <div className="md:hidden mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {location.type}
                                    </span>
                                  </div>
                                  <div className="lg:hidden mt-1 text-xs text-gray-500">
                                    {location.desa}, {location.kecamatan}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 hidden md:table-cell">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {location.type}
                              </span>
                            </td>
                            <td className="px-4 py-4 hidden lg:table-cell">
                              <div className="text-sm text-gray-900">
                                {location.desa}
                              </div>
                              <div className="text-sm text-gray-500">
                                {location.kecamatan}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {getStatusBadge(location.status)}
                            </td>
                            <td className="px-4 py-4 hidden md:table-cell">
                              <div className="text-sm text-gray-900">
                                {new Date(
                                  location.createdAt
                                ).toLocaleDateString("id-ID")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(
                                  location.createdAt
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                                <button
                                  onClick={() => handleEdit(location.id)}
                                  className="inline-flex items-center justify-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm transition-colors"
                                >
                                  <i className="fas fa-edit mr-1"></i>
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(location.id, location.title)
                                  }
                                  className="inline-flex items-center justify-center text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm transition-colors"
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
              )}

              {/* Pagination atau info hasil filter */}
              {!loading && filteredLocations.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-gray-700">
                      Menampilkan{" "}
                      <span className="font-medium">
                        {filteredLocations.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium">{locations.length}</span>{" "}
                      lokasi
                    </p>
                    {(searchTerm || statusFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <i className="fas fa-times mr-1"></i>
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
