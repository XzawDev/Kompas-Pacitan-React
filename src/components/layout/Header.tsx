"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: "Beranda", href: "/", current: pathname === "/" },
    {
      name: "Peta Potensi",
      href: "/peta-potensi",
      current: pathname === "/peta-potensi",
    },
    {
      name: "Profil Desa",
      href: "/profil-desa",
      current: pathname === "/profil-desa",
    },
    {
      name: "Peluang Investasi",
      href: "/peluang-investasi",
      current: pathname === "/peluang-investasi",
    },
    { name: "Tentang", href: "/tentang", current: pathname === "/tentang" },
  ];

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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img
                src="/assets/images/logo.PNG"
                alt="Kompas Pacitan Logo"
                className="w-10 h-10"
              />
            </div>
            <div>
              <span className="text-xl font-bold text-dark">
                KOMPAS<span className="text-primary"> PACITAN</span>
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link ${
                  item.current
                    ? "text-primary font-semibold active"
                    : "text-gray-600 hover:text-primary font-medium"
                } text-sm`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

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
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-tachometer-alt mr-2"></i>
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-user mr-2"></i>
                      Profil Saya
                    </Link>
                    <Link
                      href="/dashboard/tambah-lokasi"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Tambah Lokasi
                    </Link>
                    {user.role === "admin" && (
                      <div className="border-t border-gray-100">
                        {/* <Link
                          href="/dashboard/admin/approvals"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-shield-alt mr-2"></i>
                          Persetujuan Lokasi
                        </Link> */}
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
                        </Link>
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-600"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mobile-menu bg-white py-5 px-6 border-t shadow-lg">
          <div className="flex flex-col space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? "text-primary font-semibold border-l-4 border-primary pl-3"
                    : "text-gray-600 pl-3"
                } text-base`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <>
                <div className="pt-3 border-t">
                  <Link
                    href="/dashboard"
                    className="text-gray-600 pl-3 text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-red-600 pl-3 text-base text-left"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="pt-3 border-t">
                <Link
                  href="/login"
                  className="block w-full btn-primary text-white text-center font-semibold py-2.5 rounded-xl text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login / Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
