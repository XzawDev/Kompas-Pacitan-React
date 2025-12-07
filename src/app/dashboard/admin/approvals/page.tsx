// src/app/dashboard/admin/approvals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPendingApprovals,
  updateLocationStatus,
  updateInvestmentStatus,
  getApprovalStats,
} from "@/lib/firestoreService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Approval } from "@/lib/types";

interface ApprovalWithDetails extends Approval {
  userEmail?: string;
}

type FilterType = "all" | "location" | "investment";

export default function AdminApprovals() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalWithDetails[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<
    ApprovalWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalInvestments: 0,
    pendingApprovals: 0,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalWithDetails | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | "">("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "owner"))
    ) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "owner") {
      loadApprovals();
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    filterAndSearchApprovals();
  }, [approvals, activeFilter, searchTerm]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const pendingApprovals = await getPendingApprovals();
      setApprovals(pendingApprovals as ApprovalWithDetails[]);
    } catch (error) {
      console.error("Error loading approvals:", error);
      alert("Gagal memuat data persetujuan");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getApprovalStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const filterAndSearchApprovals = () => {
    let filtered = approvals;

    // Apply type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((approval) => approval.type === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (approval) =>
          approval.targetData.title?.toLowerCase().includes(term) ||
          approval.targetData.description?.toLowerCase().includes(term) ||
          approval.targetData.desa?.toLowerCase().includes(term) ||
          approval.targetData.kecamatan?.toLowerCase().includes(term)
      );
    }

    setFilteredApprovals(filtered);
  };

  const handleApprove = async (approval: ApprovalWithDetails) => {
    if (!user) return;

    try {
      if (approval.type === "location") {
        await updateLocationStatus(approval.targetId, "approved", user.uid);
      } else {
        await updateInvestmentStatus(approval.targetId, "approved", user.uid);
      }

      alert("Berhasil disetujui!");
      loadApprovals();
      loadStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error approving:", error);
      alert("Gagal menyetujui pengajuan");
    }
  };

  const handleReject = async (approval: ApprovalWithDetails) => {
    if (!user || !rejectionReason.trim()) {
      alert("Harap berikan alasan penolakan");
      return;
    }

    try {
      if (approval.type === "location") {
        await updateLocationStatus(
          approval.targetId,
          "rejected",
          user.uid,
          rejectionReason
        );
      } else {
        await updateInvestmentStatus(
          approval.targetId,
          "rejected",
          user.uid,
          rejectionReason
        );
      }

      alert("Pengajuan ditolak!");
      setRejectionReason("");
      setShowRejectModal(false);
      setShowDetailModal(false);
      loadApprovals();
      loadStats();
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Gagal menolak pengajuan");
    }
  };

  const openDetailModal = (approval: ApprovalWithDetails) => {
    setSelectedApproval(approval);
    setShowDetailModal(true);
  };

  const openRejectModal = (approval: ApprovalWithDetails) => {
    setSelectedApproval(approval);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const closeModals = () => {
    setShowDetailModal(false);
    setShowRejectModal(false);
    setSelectedApproval(null);
    setRejectionReason("");
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredApprovals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredApprovals.map((item) => item.id));
    }
  };

  const handleBulkAction = async () => {
    if (!user || !bulkAction || selectedItems.length === 0) return;

    try {
      for (const itemId of selectedItems) {
        const approval = approvals.find((a) => a.id === itemId);
        if (!approval) continue;

        if (bulkAction === "approve") {
          if (approval.type === "location") {
            await updateLocationStatus(approval.targetId, "approved", user.uid);
          } else {
            await updateInvestmentStatus(
              approval.targetId,
              "approved",
              user.uid
            );
          }
        } else if (bulkAction === "reject" && rejectionReason) {
          if (approval.type === "location") {
            await updateLocationStatus(
              approval.targetId,
              "rejected",
              user.uid,
              rejectionReason
            );
          } else {
            await updateInvestmentStatus(
              approval.targetId,
              "rejected",
              user.uid,
              rejectionReason
            );
          }
        }
      }

      alert(
        `Berhasil ${bulkAction === "approve" ? "menyetujui" : "menolak"} ${
          selectedItems.length
        } pengajuan!`
      );
      setSelectedItems([]);
      setBulkAction("");
      setRejectionReason("");
      loadApprovals();
      loadStats();
    } catch (error) {
      console.error("Error processing bulk action:", error);
      alert("Gagal memproses aksi bulk");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            {/* Header Section */}
            <div className="bg-white rounded-xl card-shadow p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Manajemen Persetujuan
                  </h1>
                  <p className="text-gray-600">
                    Kelola pengajuan lokasi dan investasi dari user
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {stats.pendingApprovals}
                    </div>
                    <div className="text-sm text-gray-500">Menunggu Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold mb-2">
                      {stats.pendingApprovals}
                    </div>
                    <div className="text-blue-100">Menunggu Persetujuan</div>
                  </div>
                  <div className="text-3xl opacity-80">
                    <i className="fas fa-clock"></i>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold mb-2">
                      {stats.totalLocations}
                    </div>
                    <div className="text-green-100">Total Lokasi</div>
                  </div>
                  <div className="text-3xl opacity-80">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold mb-2">
                      {stats.totalInvestments}
                    </div>
                    <div className="text-purple-100">Total Investasi</div>
                  </div>
                  <div className="text-3xl opacity-80">
                    <i className="fas fa-chart-line"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white rounded-xl card-shadow p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Cari pengajuan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center space-x-2">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeFilter === "all"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setActiveFilter("location")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeFilter === "location"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Lokasi
                  </button>
                  <button
                    onClick={() => setActiveFilter("investment")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeFilter === "investment"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <i className="fas fa-chart-line mr-2"></i>
                    Investasi
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="text-yellow-800">
                      <i className="fas fa-bullhorn mr-2"></i>
                      <span className="font-medium">
                        {selectedItems.length} item dipilih
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Pilih Aksi</option>
                        <option value="approve">Setujui Semua</option>
                        <option value="reject">Tolak Semua</option>
                      </select>

                      {bulkAction === "reject" && (
                        <input
                          type="text"
                          placeholder="Alasan penolakan..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-0"
                        />
                      )}

                      <button
                        onClick={handleBulkAction}
                        disabled={
                          !bulkAction ||
                          (bulkAction === "reject" && !rejectionReason.trim())
                        }
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition"
                      >
                        Terapkan
                      </button>

                      <button
                        onClick={() => setSelectedItems([])}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Approvals List */}
            <div className="bg-white rounded-xl card-shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pengajuan Menunggu ({filteredApprovals.length})
                  </h2>
                  {filteredApprovals.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-primary hover:text-primary-dark font-medium"
                    >
                      {selectedItems.length === filteredApprovals.length
                        ? "Batal pilih semua"
                        : "Pilih semua"}
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-500 mt-4">Memuat data pengajuan...</p>
                </div>
              ) : filteredApprovals.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check-circle text-4xl text-green-500"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tidak ada pengajuan
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || activeFilter !== "all"
                      ? "Tidak ditemukan pengajuan yang sesuai dengan filter"
                      : "Semua pengajuan telah diproses"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className={`p-6 hover:bg-gray-50 transition ${
                        selectedItems.includes(approval.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox for bulk selection */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(approval.id)}
                            onChange={() => toggleSelectItem(approval.id)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  approval.type === "location"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                <i
                                  className={`mr-1 ${
                                    approval.type === "location"
                                      ? "fas fa-map-marker-alt"
                                      : "fas fa-chart-line"
                                  }`}
                                ></i>
                                {approval.type === "location"
                                  ? "Lokasi"
                                  : "Investasi"}
                              </span>
                              <span className="text-sm text-gray-500">
                                <i className="far fa-clock mr-1"></i>
                                {new Date(
                                  approval.submittedAt
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {approval.targetData.title}
                          </h3>

                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {approval.targetData.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                            {approval.type === "location" && (
                              <>
                                <div className="flex items-center">
                                  <i className="fas fa-map-marker-alt mr-2"></i>
                                  {approval.targetData.desa},{" "}
                                  {approval.targetData.kecamatan}
                                </div>
                                <div className="flex items-center">
                                  <i className="fas fa-tag mr-2"></i>
                                  {approval.targetData.type}
                                </div>
                                <div className="flex items-center">
                                  <i className="fas fa-bolt mr-2"></i>
                                  Potensi: {approval.targetData.potential}
                                </div>
                              </>
                            )}
                            {approval.type === "investment" && (
                              <>
                                <div className="flex items-center">
                                  <i className="fas fa-wallet mr-2"></i>
                                  {approval.targetData.estimatedCapital}
                                </div>
                                <div className="flex items-center">
                                  <i className="fas fa-chart-line mr-2"></i>
                                  ROI: {approval.targetData.roi}
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => openDetailModal(approval)}
                              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
                            >
                              <i className="fas fa-eye mr-2"></i>
                              Lihat Detail
                            </button>

                            <button
                              onClick={() => handleApprove(approval)}
                              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                            >
                              <i className="fas fa-check mr-2"></i>
                              Setujui
                            </button>

                            <button
                              onClick={() => openRejectModal(approval)}
                              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                            >
                              <i className="fas fa-times mr-2"></i>
                              Tolak
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detail Pengajuan
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Header Info */}
              <div className="flex items-center space-x-4 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedApproval.type === "location"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedApproval.type === "location"
                    ? "Lokasi"
                    : "Investasi"}
                </span>
                <span className="text-sm text-gray-500">
                  Diajukan:{" "}
                  {new Date(selectedApproval.submittedAt).toLocaleDateString(
                    "id-ID"
                  )}
                </span>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Informasi Utama
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">Judul</label>
                        <p className="font-medium">
                          {selectedApproval.targetData.title}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Deskripsi
                        </label>
                        <p className="text-gray-700">
                          {selectedApproval.targetData.description}
                        </p>
                      </div>
                      {selectedApproval.targetData.alamat && (
                        <div>
                          <label className="text-sm text-gray-500">
                            Alamat Lengkap
                          </label>
                          <p className="text-gray-700">
                            {selectedApproval.targetData.alamat}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Specific Details */}
                  {selectedApproval.type === "location" && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Detail Lokasi
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">
                              Desa
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.desa}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">
                              Kecamatan
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.kecamatan}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">
                              Jenis
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.type}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">
                              Potensi
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.potential}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">
                              Kelayakan
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.feasibility}%
                            </p>
                          </div>
                          {selectedApproval.targetData.kontak && (
                            <div>
                              <label className="text-sm text-gray-500">
                                Kontak
                              </label>
                              <p className="font-medium">
                                {selectedApproval.targetData.kontak}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Investment Specific Details */}
                  {selectedApproval.type === "investment" && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Detail Investasi
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">
                              Estimasi Modal
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.estimatedCapital}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">ROI</label>
                            <p className="font-medium">
                              {selectedApproval.targetData.roi}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">
                              Durasi
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.duration}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">
                              Kelayakan
                            </label>
                            <p className="font-medium">
                              {selectedApproval.targetData.feasibility}%
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Lokasi
                          </label>
                          <p className="font-medium">
                            {selectedApproval.targetData.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  {/* Facilities/Tags */}
                  {(selectedApproval.targetData.fasilitas?.length > 0 ||
                    selectedApproval.targetData.tags?.length > 0) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {selectedApproval.type === "location"
                          ? "Fasilitas"
                          : "Tags"}
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex flex-wrap gap-2">
                          {(
                            selectedApproval.targetData.fasilitas ||
                            selectedApproval.targetData.tags ||
                            []
                          ).map((item: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {selectedApproval.targetData.image && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Gambar
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <img
                          src={selectedApproval.targetData.image}
                          alt={selectedApproval.targetData.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Images */}
                  {selectedApproval.targetData.images?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Gambar Tambahan
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {selectedApproval.targetData.images.map(
                            (image: string, index: number) => (
                              <img
                                key={index}
                                src={image}
                                alt={`${selectedApproval.targetData.title} ${
                                  index + 1
                                }`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={closeModals}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
                >
                  Tutup
                </button>
                <button
                  onClick={() => openRejectModal(selectedApproval)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                >
                  <i className="fas fa-times mr-2"></i>
                  Tolak
                </button>
                <button
                  onClick={() => handleApprove(selectedApproval)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                >
                  <i className="fas fa-check mr-2"></i>
                  Setujui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tolak Pengajuan
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Anda akan menolak pengajuan:{" "}
                <strong>{selectedApproval.targetData.title}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Berikan alasan penolakan untuk memberikan feedback kepada
                pengaju.
              </p>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4 resize-none"
              placeholder="Tuliskan alasan penolakan pengajuan ini..."
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleReject(selectedApproval)}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Tolak Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
