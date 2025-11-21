//src/app/dashboard/admin/approvals/page.tsx
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
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Approval } from "@/lib/types";

interface ApprovalWithDetails extends Approval {
  userEmail?: string;
}

export default function AdminApprovals() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalInvestments: 0,
    pendingApprovals: 0,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadApprovals();
      loadStats();
    }
  }, [user]);

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
      setSelectedApproval(null);
      loadApprovals();
      loadStats();
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Gagal menolak pengajuan");
    }
  };

  const openRejectModal = (approvalId: string) => {
    setSelectedApproval(approvalId);
    setRejectionReason("");
  };

  const closeRejectModal = () => {
    setSelectedApproval(null);
    setRejectionReason("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">
                Panel Persetujuan Admin
              </h1>
              <p className="text-gray-600">
                Kelola pengajuan lokasi dan investasi dari user
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.pendingApprovals}
                </div>
                <div className="text-gray-600">Menunggu Persetujuan</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {stats.totalLocations}
                </div>
                <div className="text-gray-600">Total Lokasi</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {stats.totalInvestments}
                </div>
                <div className="text-gray-600">Total Investasi</div>
              </div>
            </div>

            {/* Approvals List */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-dark">
                  Pengajuan Menunggu ({approvals.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin"></div>
                  <p className="text-gray-500 mt-2">Memuat data...</p>
                </div>
              ) : approvals.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="fas fa-check-circle text-4xl mb-3 opacity-50"></i>
                  <p>Tidak ada pengajuan yang menunggu persetujuan</p>
                </div>
              ) : (
                <div className="divide-y">
                  {approvals.map((approval) => (
                    <div key={approval.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                approval.type === "location"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {approval.type === "location"
                                ? "Lokasi"
                                : "Investasi"}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              Diajukan:{" "}
                              {new Date(
                                approval.submittedAt
                              ).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-dark mb-1">
                            {approval.targetData.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {approval.targetData.description}
                          </p>

                          {approval.type === "location" && (
                            <div className="text-sm text-gray-500">
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              {approval.targetData.kecamatan} •{" "}
                              {approval.targetData.desa}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(approval)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                          >
                            <i className="fas fa-check mr-1"></i>
                            Setujui
                          </button>
                          <button
                            onClick={() => openRejectModal(approval.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                          >
                            <i className="fas fa-times mr-1"></i>
                            Tolak
                          </button>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="bg-gray-50 rounded-lg p-4 mt-3">
                        <h4 className="font-semibold text-dark mb-2">
                          Detail Pengajuan:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Jenis:</strong> {approval.targetData.type}
                          </div>
                          <div>
                            <strong>Potensi:</strong>{" "}
                            {approval.targetData.potential}
                          </div>
                          <div>
                            <strong>Kelayakan:</strong>{" "}
                            {approval.targetData.feasibility}%
                          </div>
                          {approval.targetData.alamat && (
                            <div>
                              <strong>Alamat:</strong>{" "}
                              {approval.targetData.alamat}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Rejection Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-dark mb-4">
              Alasan Penolakan
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
              placeholder="Berikan alasan penolakan pengajuan ini..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const approval = approvals.find(
                    (a) => a.id === selectedApproval
                  );
                  if (approval) handleReject(approval);
                }}
                disabled={!rejectionReason.trim()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tolak Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
