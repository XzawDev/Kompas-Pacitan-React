// components/dashboard/DashboardHeader.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm z-10 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo, Title, Subtitle */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 focus:outline-none mr-4"
              onClick={onToggleSidebar}
            >
              <i className="fas fa-bars text-lg"></i>
            </button>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <img
                  src="/assets/images/logo.PNG"
                  alt="Logo Kompas Pacitan"
                  className="w-9 h-9 rounded"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  KOMPAS PACITAN
                </h1>
              </div>
            </div>
          </div>

          {/* Right: User Info - Konsisten dengan Header.tsx */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 transition"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.username?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-dark hidden md:block">
                    {user.username || user.displayName}
                  </span>
                  <i className="fas fa-chevron-down text-gray-500 text-xs"></i>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-dark">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-home-alt mr-2"></i>
                      Beranda
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-user mr-2"></i>
                      Profil Saya
                    </Link>
                    {/* <Link
                      href="/dashboard/tambah-lokasi"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Tambah Lokasi
                    </Link> */}
                    {user.role === "admin" && (
                      <div className="border-t border-gray-100">
                        {/* <Link
                          href="/dashboard/admin/approvals"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-shield-alt mr-2"></i>
                          Persetujuan Lokasi
                        </Link>
                        <Link
                          href="/dashboard/admin/tambah-investasi"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Tambah Investasi
                        </Link>
                        <Link
                          href="/dashboard/admin/tambah-desa"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Tambah Desa
                        </Link> */}
                      </div>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-block btn-primary text-white px-4 py-2 rounded-xl font-semibold shadow text-sm"
              >
                Login / Daftar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
