"use client";

import { Location } from "@/lib/types";
import dynamic from "next/dynamic";

// Dynamic import untuk InteractiveMap dengan loading state
const InteractiveMap = dynamic(() => import("../maps/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="map-container">
      <div className="h-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Memuat peta...</div>
      </div>
    </div>
  ),
});

interface MapSectionProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
}

const MapSection = ({ locations, onLocationSelect }: MapSectionProps) => {
  const handleLocationSelect = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    } else {
      // Default behavior - redirect to location detail
      //   window.location.href = `/lokasi/${location.id}`;
    }
  };

  return (
    <section className="py-16 gradient-bg-light">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <div className="lg:w-2/5" data-aos="fade-right">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Peta Interaktif Potensi Pacitan
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Jelajahi berbagai layer data untuk menemukan informasi tentang
              pariwisata, pertanian, perikanan, UMKM, aset desa, dan
              infrastruktur di Pacitan.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-blue-700 rounded-full mr-3"></div>
                <span className="font-medium text-sm">
                  Pariwisata - Objek wisata dan destinasi
                </span>
              </div>
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-green-700 rounded-full mr-3"></div>
                <span className="font-medium text-sm">
                  Pertanian - Lahan dan komoditas
                </span>
              </div>
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="font-medium text-sm">
                  UMKM - Usaha dan produk lokal
                </span>
              </div>
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="font-medium text-sm">
                  Perikanan - Potensi kelautan
                </span>
              </div>
            </div>

            <a
              href="/peta-potensi"
              className="inline-flex items-center btn-primary text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg text-sm"
            >
              Buka Peta Lengkap
              <i className="fas fa-arrow-right ml-2 text-xs"></i>
            </a>
          </div>

          <div className="lg:w-3/5" data-aos="fade-left" data-aos-delay="300">
            <InteractiveMap
              locations={locations}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
