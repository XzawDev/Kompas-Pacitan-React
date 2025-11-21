// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  getApprovalStats,
  getPendingApprovals,
  getApprovedLocations,
  getUserLocations,
  getDesa,
} from "@/lib/firestoreService";
import { Location, Approval, Desa } from "@/lib/types";

// ==================== INTERFACES ====================

interface DashboardStats {
  totalLocations: number;
  approvedLocations: number;
  pendingLocations: number;
  totalDesa: number;
  totalInvestments: number;
  activeUsers: number;
}

interface Activity {
  id: string;
  type: "location" | "investment" | "desa";
  action: string;
  title: string;
  user: string;
  time: string;
  status: "approved" | "pending" | "completed" | "rejected";
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: "green" | "yellow" | "purple" | "indigo" | "pink";
  description: string;
}

interface ApprovalItem {
  id: string;
  type: "location" | "investment";
  title: string;
  user: string;
  submittedAt: string;
  kecamatan: string;
  desa: string;
}

// ==================== DASHBOARD COMPONENTS ====================

// StatCard Component
const StatCard = ({
  title,
  value,
  icon,
  color,
  description,
}: StatCardProps) => {
  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
  };

  const iconClasses = {
    green: "text-white",
    yellow: "text-white",
    purple: "text-white",
    indigo: "text-white",
    pink: "text-white",
  };

  return (
    <div className="bg-white rounded-xl card-shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
          <i className={`${icon} ${iconClasses[color]} text-lg`}></i>
        </div>
      </div>
      {/* <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorClasses[color]}`}
            style={{ width: `${Math.min((value / 200) * 100, 100)}%` }}
          ></div>
        </div>
      </div> */}
    </div>
  );
};

// RecentActivity Component (Hanya untuk Admin)
const RecentActivity = ({ activities }: { activities: Activity[] }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "location":
        return "fas fa-map-marker-alt";
      case "investment":
        return "fas fa-chart-line";
      case "desa":
        return "fas fa-home";
      default:
        return "fas fa-circle";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <i className="fas fa-history text-primary mr-2"></i>
          Aktivitas Terbaru
        </h3>
        <button className="text-sm text-primary hover:text-blue-700 font-medium">
          Lihat Semua
        </button>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i
                  className={`${getTypeIcon(
                    activity.type
                  )} text-gray-600 text-sm`}
                ></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}{" "}
                  <span className="font-medium">{activity.title}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  activity.status
                )}`}
              >
                {activity.status === "approved" && "Disetujui"}
                {activity.status === "pending" && "Menunggu"}
                {activity.status === "completed" && "Selesai"}
                {activity.status === "rejected" && "Ditolak"}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-inbox text-gray-400 text-2xl mb-2"></i>
            <p className="text-gray-500 text-sm">Tidak ada aktivitas terbaru</p>
          </div>
        )}
      </div>
    </div>
  );
};

// QuickActions Component
const QuickActions = ({ userRole }: { userRole: string }) => {
  const router = useRouter();

  const actions = [
    {
      title: "Tambah Lokasi",
      description: "Tambahkan lokasi potensial baru",
      icon: "fas fa-plus",
      color: "bg-blue-500",
      href: "/dashboard/tambah-lokasi",
      available: true,
    },
    {
      title: "Lihat Peta",
      description: "Eksplor peta interaktif",
      icon: "fas fa-map",
      color: "bg-green-500",
      href: "/peta-potensi",
      available: true,
    },
    {
      title: "Data Saya",
      description: "Kelola data yang Anda ajukan",
      icon: "fas fa-database",
      color: "bg-purple-500",
      href: "/dashboard/data-saya",
      available: true,
    },
    {
      title: "Tambah Investasi",
      description: "Buat peluang investasi baru",
      icon: "fas fa-chart-line",
      color: "bg-orange-500",
      href: "/dashboard/admin/tambah-investasi",
      available: userRole === "admin",
    },
    {
      title: "Kelola Desa",
      description: "Tambah atau edit profil desa",
      icon: "fas fa-home",
      color: "bg-teal-500",
      href: "/dashboard/admin/tambah-desa",
      available: userRole === "admin",
    },
    {
      title: "Persetujuan",
      description: "Review pengajuan user",
      icon: "fas fa-shield-alt",
      color: "bg-red-500",
      href: "/dashboard/admin/approvals",
      available: userRole === "admin",
    },
  ];

  const availableActions = actions.filter((action) => action.available);

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-bolt text-yellow-500 mr-2"></i>
        Akses Cepat
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableActions.map((action, index) => (
          <button
            key={index}
            onClick={() => router.push(action.href)}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div
              className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}
            >
              <i className={`${action.icon} text-white`}></i>
            </div>
            <h4 className="font-semibold text-gray-800 group-hover:text-primary transition">
              {action.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ApprovalQueue Component
const ApprovalQueue = ({ approvals }: { approvals: ApprovalItem[] }) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <i className="fas fa-clock text-yellow-500 mr-2"></i>
          Antrian Persetujuan
        </h3>
        <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
          {approvals.length} menunggu
        </span>
      </div>
      <div className="space-y-3">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="p-3 border border-gray-200 rounded-lg hover:border-yellow-400 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      approval.type === "location"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {approval.type === "location" ? "Lokasi" : "Investasi"}
                  </span>
                </div>
                <h4 className="font-medium text-gray-800 text-sm">
                  {approval.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Oleh: {approval.user} • {approval.kecamatan}, {approval.desa}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(approval.submittedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {approvals.length > 0 && (
        <button
          onClick={() => router.push("/dashboard/admin/approvals")}
          className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition text-sm"
        >
          Kelola Semua Persetujuan
        </button>
      )}
    </div>
  );
};

// ==================== MAIN DASHBOARD PAGE ====================

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalLocations: 0,
    approvedLocations: 0,
    pendingLocations: 0,
    totalDesa: 0,
    totalInvestments: 0,
    activeUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load data dashboard
  useEffect(() => {
    if (user && !loading) {
      loadDashboardData();
    }
  }, [user, loading]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);

      const [statsData, approvalsData, locationsData] = await Promise.all([
        getDashboardStats(),
        user?.role === "admin" ? getPendingApprovals() : Promise.resolve([]),
        getRecentLocations(),
      ]);

      setStats(statsData);
      setPendingApprovals(
        (approvalsData || []).slice(0, 2).map((approval) => ({
          id: approval.id,
          type: approval.type,
          title: approval.targetData?.title || "Untitled",
          user: approval.submittedBy,
          submittedAt: approval.submittedAt,
          kecamatan: approval.targetData?.kecamatan || "-",
          desa: approval.targetData?.desa || "-",
        }))
      );
      setRecentLocations(locationsData);

      // Hanya generate aktivitas untuk admin
      if (user?.role === "admin") {
        generateRecentActivities(locationsData, approvalsData || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
      const approvalStats = await getApprovalStats();

      let userLocations: Location[] = [];
      let desaList: Desa[] = [];

      if (user) {
        if (user.role === "admin") {
          userLocations = await getApprovedLocations();
          desaList = await getDesa();
        } else {
          userLocations = await getUserLocations(user.uid);
        }
      }

      return {
        totalLocations: approvalStats.totalLocations,
        approvedLocations: userLocations.filter(
          (loc) => loc.status === "approved"
        ).length,
        pendingLocations: approvalStats.pendingApprovals,
        totalDesa: desaList.length,
        totalInvestments: approvalStats.totalInvestments,
        activeUsers: 89, // Placeholder
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        totalLocations: 0,
        approvedLocations: 0,
        pendingLocations: 0,
        totalDesa: 0,
        totalInvestments: 0,
        activeUsers: 0,
      };
    }
  };

  const getRecentLocations = async (): Promise<Location[]> => {
    try {
      if (user?.role === "admin") {
        const locations = await getApprovedLocations();
        return locations.slice(0, 3);
      } else if (user) {
        const locations = await getUserLocations(user.uid);
        return locations.slice(0, 3);
      }
      return [];
    } catch (error) {
      console.error("Error getting recent locations:", error);
      return [];
    }
  };

  const generateRecentActivities = (
    locations: Location[],
    approvals: Approval[]
  ) => {
    const activities: Activity[] = [];

    // Add recent locations as activities
    locations.slice(0, 2).forEach((location) => {
      activities.push({
        id: location.id,
        type: "location",
        action: location.status === "approved" ? "ditambahkan" : "diajukan",
        title: location.title,
        user: user?.username || "User",
        time: formatTimeAgo(location.createdAt),
        status: location.status as
          | "approved"
          | "pending"
          | "completed"
          | "rejected",
      });
    });

    // Add pending approvals as activities
    approvals.slice(0, 2).forEach((approval) => {
      activities.push({
        id: approval.id,
        type: approval.type,
        action: "menunggu persetujuan",
        title: approval.targetData?.title || "Item",
        user: "User",
        time: formatTimeAgo(approval.submittedAt),
        status: "pending",
      });
    });

    // Sort by time (newest first) and take max 4
    setRecentActivities(
      activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 4)
    );
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} detik yang lalu`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Selamat Datang, {user.username || user.displayName}!
            </h1>
            <p className="text-gray-600 mt-2">
              {user.role === "admin"
                ? "Kelola semua data dan persetujuan di Kabupaten Pacitan"
                : "Pantau perkembangan dan kelola data yang Anda ajukan"}
            </p>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
          ) : (
            <>
              {/* Stats Grid - Adjust grid columns based on user role */}
              <div
                className={`grid gap-6 mb-8 ${
                  user.role === "admin"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                <StatCard
                  title="Lokasi Disetujui"
                  value={stats.approvedLocations}
                  icon="fas fa-check-circle"
                  color="green"
                  description="Telah diverifikasi"
                />
                <StatCard
                  title="Menunggu Persetujuan"
                  value={stats.pendingLocations}
                  icon="fas fa-clock"
                  color="yellow"
                  description="Perlu review"
                />
                <StatCard
                  title="Total Desa"
                  value={stats.totalDesa}
                  icon="fas fa-home"
                  color="purple"
                  description="Desa terdaftar"
                />
                {user.role === "admin" && (
                  <>
                    <StatCard
                      title="Peluang Investasi"
                      value={stats.totalInvestments}
                      icon="fas fa-chart-line"
                      color="indigo"
                      description="Investasi aktif"
                    />
                    {/* <StatCard
                      title="Pengguna Aktif"
                      value={stats.activeUsers}
                      icon="fas fa-users"
                      color="pink"
                      description="User terdaftar"
                    /> */}
                  </>
                )}
              </div>

              {/* Main Content Grid - Different layouts for admin vs user */}
              {user.role === "admin" ? (
                // Admin Layout (Original)
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                  {/* Left Column - 2/3 width */}
                  <div className="xl:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <QuickActions userRole={user.role} />

                    {/* Recent Activities - Hanya untuk Admin */}
                    <RecentActivity activities={recentActivities} />
                  </div>

                  {/* Right Column - 1/3 width */}
                  <div className="space-y-6">
                    {/* Pending Approvals - Only for Admin */}
                    {pendingApprovals.length > 0 && (
                      <ApprovalQueue approvals={pendingApprovals} />
                    )}

                    {/* Recent Locations */}
                    <div className="bg-white rounded-xl card-shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                        Lokasi Terbaru
                      </h3>
                      <div className="space-y-3">
                        {recentLocations.length > 0 ? (
                          recentLocations.map((location) => (
                            <div
                              key={location.id}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {location.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {location.type}
                                </p>
                              </div>
                              <span className="text-sm text-gray-400">
                                {new Date(
                                  location.createdAt
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <i className="fas fa-inbox text-gray-400 text-2xl mb-2"></i>
                            <p className="text-gray-500 text-sm">
                              Belum ada lokasi
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // User Layout - Optimized for regular users
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Left Column - Quick Actions */}
                  <div className="space-y-6">
                    <QuickActions userRole={user.role} />
                  </div>

                  {/* Right Column - Recent Locations and User-specific content */}
                  <div className="space-y-6">
                    {/* Recent Locations untuk user */}
                    <div className="bg-white rounded-xl card-shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                        Lokasi Terbaru Anda
                      </h3>
                      <div className="space-y-3">
                        {recentLocations.length > 0 ? (
                          recentLocations.map((location) => (
                            <div
                              key={location.id}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                  {location.title}
                                </p>
                                <div className="flex items-center mt-1">
                                  <p className="text-sm text-gray-500 mr-3">
                                    {location.type}
                                  </p>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      location.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : location.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {location.status === "approved"
                                      ? "Disetujui"
                                      : location.status === "pending"
                                      ? "Menunggu"
                                      : "Ditolak"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-400 flex-shrink-0 ml-4">
                                {new Date(
                                  location.createdAt
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <i className="fas fa-inbox text-gray-400 text-2xl mb-2"></i>
                            <p className="text-gray-500 text-sm">
                              Belum ada lokasi
                            </p>
                            <button
                              onClick={() =>
                                router.push("/dashboard/tambah-lokasi")
                              }
                              className="mt-2 text-primary hover:text-blue-700 font-medium text-sm"
                            >
                              Tambah Lokasi Pertama
                            </button>
                          </div>
                        )}
                      </div>
                      {recentLocations.length > 0 && (
                        <button
                          onClick={() => router.push("/dashboard/data-saya")}
                          className="w-full mt-4 bg-primary hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition text-sm"
                        >
                          Lihat Semua Data Saya
                        </button>
                      )}
                    </div>

                    {/* Additional User Info or Stats */}
                    <div className="bg-white rounded-xl card-shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-chart-bar text-primary mr-2"></i>
                        Ringkasan Anda
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {stats.approvedLocations}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Lokasi Disetujui
                          </p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">
                            {stats.pendingLocations}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Menunggu Review
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
