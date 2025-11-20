"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
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
                Selamat Datang, {user.username}!
              </h1>
              <p className="text-gray-600">
                Ini adalah dashboard Kompas Pacitan. Fitur lengkap akan segera
                hadir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-map-marked-alt text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">Peta Interaktif</h3>
                    <p className="text-sm text-gray-600">
                      Akses penuh peta potensi
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-chart-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">Analitik AI</h3>
                    <p className="text-sm text-gray-600">Rekomendasi cerdas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-download text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">Data Lengkap</h3>
                    <p className="text-sm text-gray-600">
                      Download laporan detail
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
