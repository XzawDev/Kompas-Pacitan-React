// components/dashboard/DashboardSidebar.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Menu untuk semua user
  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "fas fa-home",
      current: pathname === "/dashboard",
    },
    {
      name: "Tambah Lokasi",
      href: "/dashboard/tambah-lokasi",
      icon: "fas fa-map-marker-alt",
      current: pathname === "/dashboard/tambah-lokasi",
    },
    // {
    //   name: "Data Saya",
    //   href: "/dashboard/data-saya",
    //   icon: "fas fa-database",
    //   current: pathname === "/dashboard/data-saya",
    // },
  ];

  // Menu untuk admin - Tambah Data
  //   const adminAddNavigation = [
  //     {
  //       name: "Tambah Desa",
  //       href: "/dashboard/admin/tambah-desa",
  //       icon: "fas fa-village",
  //       current: pathname === "/dashboard/admin/tambah-desa",
  //     },
  //     {
  //       name: "Tambah Investasi",
  //       href: "/dashboard/admin/tambah-investasi",
  //       icon: "fas fa-chart-line",
  //       current: pathname === "/dashboard/admin/tambah-investasi",
  //     },
  //   ];

  // Menu untuk admin - Manajemen Data
  const adminManagementNavigation = [
    {
      name: "Manajemen Pengajuan",
      href: "/dashboard/admin/approvals",
      icon: "fas fa-shield-alt",
      current: pathname === "/dashboard/admin/approvals",
    },
    {
      name: "Manajemen Lokasi",
      href: "/dashboard/admin/manajemen-lokasi",
      icon: "fas fa-map-marked-alt",
      current: pathname === "/dashboard/admin/manajemen-lokasi",
    },
    {
      name: "Manajemen Desa",
      href: "/dashboard/admin/manajemen-desa",
      icon: "fas fa-home",
      current: pathname === "/dashboard/admin/manajemen-desa",
    },
    {
      name: "Manajemen Investasi",
      href: "/dashboard/admin/manajemen-investasi",
      icon: "fas fa-business-time",
      current: pathname === "/dashboard/admin/manajemen-investasi",
    },
    {
      name: "Manajemen User",
      href: "/dashboard/admin/manajemen-user",
      icon: "fas fa-users-cog",
      current: pathname === "/dashboard/admin/manajemen-user",
    },
    // {
    //   name: "Manajemen User",
    //   href: "/dashboard/admin/manajemen-user",
    //   icon: "fas fa-users-cog",
    //   current: pathname === "/dashboard/admin/manajemen-user",
    // },
  ];

  const navigation = [
    ...baseNavigation,
    // ...(user?.role === "admin" ? adminAddNavigation : []),
    ...(user?.role === "admin" ? adminManagementNavigation : []),
    ...(user?.role === "owner" ? adminManagementNavigation : []),
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 bg-white flex flex-col shadow-lg">
          {/* User Profile Section - Konsisten dengan Header.tsx */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.username || user?.displayName || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user?.role || "User"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`nav-item flex items-center px-3 py-2 text-gray-700 rounded-lg text-sm ${
                        item.current
                          ? "active bg-blue-50 border-l-4 border-primary text-primary font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <i className={`${item.icon} mr-3 w-4 text-center`}></i>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Button - Fixed to bottom */}
            <div className="mt-auto p-3 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm w-full text-left transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg md:hidden transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section - Konsisten dengan Header.tsx */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user?.username || user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {user?.role || "User"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <i className="fas fa-times text-gray-600"></i>
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`nav-item flex items-center px-3 py-2 text-gray-700 rounded-lg text-sm ${
                      item.current
                        ? "active bg-blue-50 border-l-4 border-primary text-primary font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={onClose}
                  >
                    <i className={`${item.icon} mr-3 w-4 text-center`}></i>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button - Fixed to bottom */}
          <div className="mt-auto p-3 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm w-full text-left transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-3"></i>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
