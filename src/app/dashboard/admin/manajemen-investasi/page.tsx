"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getApprovedInvestments,
  deleteInvestment,
} from "@/lib/firestoreService";
import { InvestmentOpportunity } from "@/lib/types";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

// Komponen terpisah untuk konten utama
function ManajemenInvestasiContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<InvestmentOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    loadInvestments();
  }, [user, authLoading, router]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const investmentsData = await getApprovedInvestments();
      setInvestments(investmentsData);
    } catch (error) {
      console.error("Error loading investments:", error);
      alert("Gagal memuat data investasi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (investmentId: string) => {
    router.push(`/dashboard/admin/tambah-investasi?edit=${investmentId}`);
  };

  const handleDelete = async (investmentId: string, investmentName: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus peluang investasi "${investmentName}"?`
      )
    ) {
      return;
    }

    try {
      await deleteInvestment(investmentId);
      alert("Peluang investasi berhasil dihapus");
      loadInvestments();
    } catch (error) {
      console.error("Error deleting investment:", error);
      alert("Gagal menghapus peluang investasi");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter investments berdasarkan search term dan status
  const filteredInvestments = investments.filter((investment) => {
    const matchesSearch =
      investment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.sektor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || investment.status === statusFilter;

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
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Manajemen Peluang Investasi
                    </h1>
                    <p className="text-purple-100">
                      Kelola semua peluang investasi yang terdaftar dalam sistem
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <span className="bg-purple-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Total: {investments.length} Investasi
                    </span>
                    <button
                      onClick={() =>
                        router.push("/dashboard/admin/tambah-investasi")
                      }
                      className="bg-white text-purple-600 text-sm font-medium px-4 py-1 rounded-full hover:bg-purple-50 transition-colors"
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Tambah Investasi
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
                        placeholder="Cari judul investasi, lokasi, atau sektor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Semua Status</option>
                      <option value="approved">Disetujui</option>
                      <option value="pending">Menunggu</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Investments Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Investasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sektor & Lokasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimasi & ROI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {filteredInvestments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {loading
                            ? "Memuat data..."
                            : "Tidak ada data investasi yang ditemukan"}
                        </td>
                      </tr>
                    ) : (
                      filteredInvestments.map((investment) => (
                        <tr key={investment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={
                                    investment.image ||
                                    "/assets/images/default-investment.jpg"
                                  }
                                  alt={investment.title}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {investment.title}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                                  {investment.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-1">
                                {investment.sektor || "Umum"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {investment.location}
                            </div>
                            <div className="text-sm text-gray-500">
                              {investment.kecamatan}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium text-gray-900">
                              {investment.estimatedCapital}
                            </div>
                            <div>ROI: {investment.roi}</div>
                            <div>Durasi: {investment.duration}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(investment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(investment.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(investment.id)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(investment.id, investment.title)
                                }
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
              {filteredInvestments.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      Menampilkan{" "}
                      <span className="font-medium">
                        {filteredInvestments.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium">{investments.length}</span>{" "}
                      peluang investasi
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-sm text-purple-600 hover:text-purple-800"
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

// Komponen utama dengan Suspense boundary
export default function ManajemenInvestasi() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ManajemenInvestasiContent />
    </Suspense>
  );
}
