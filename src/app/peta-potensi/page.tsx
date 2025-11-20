// app/peta-potensi/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Location } from "@/lib/types";
import {
  getApprovedLocations,
  updateLocationAIRecommendation,
} from "@/lib/firestoreService";
import { GeminiAIService, AIRecommendation } from "@/lib/geminiServices";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// Dynamic imports for leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Custom pin colors
const pinColors: { [key: string]: string } = {
  Pariwisata: "#3b82f6",
  Pertanian: "#10b981",
  Perikanan: "#f59e0b",
  UMKM: "#8b5cf6",
  "Aset Desa": "#ef4444",
  Infrastruktur: "#06b6d4",
};

// Layer configuration
const layerConfigs = {
  pariwisata: { label: "Pariwisata", color: "bg-blue-500" },
  pertanian: { label: "Pertanian", color: "bg-green-500" },
  perikanan: { label: "Perikanan", color: "bg-orange-500" },
  umkm: { label: "UMKM", color: "bg-purple-500" },
  aset: { label: "Aset Desa", color: "bg-red-500" },
  infrastruktur: { label: "Infrastruktur", color: "bg-teal-500" },
};

// Initial filter state
const initialFilters = {
  kecamatan: "",
  desa: "",
  kategori: "",
};

// Initial active layers state
const initialActiveLayers = {
  pariwisata: true,
  pertanian: true,
  perikanan: true,
  umkm: true,
  aset: false,
  infrastruktur: false,
};

export default function PetaPotensi() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<{
    [key: string]: AIRecommendation;
  }>({});

  // Use auth hook to get user status
  const { user } = useAuth();

  // Filter states dengan nilai default yang jelas
  const [activeLayers, setActiveLayers] = useState(initialActiveLayers);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setIsClient(true);
    loadLocations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [locations, activeLayers, filters]);

  // Effect untuk mengupdate peta ketika lokasi dipilih
  useEffect(() => {
    if (selectedLocation && mapInstance) {
      mapInstance.setView(
        [selectedLocation.coords.lat, selectedLocation.coords.lng],
        15
      );
    }
  }, [selectedLocation, mapInstance]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const locationsData = await getApprovedLocations();
      setLocations(locationsData);
      setFilteredLocations(locationsData);
    } catch (error) {
      console.error("Error loading locations:", error);
      setLocations([]);
      setFilteredLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = locations;

    // Layer filter
    const activeTypes = Object.entries(activeLayers)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => {
        const typeMap: { [key: string]: string } = {
          pariwisata: "Pariwisata",
          pertanian: "Pertanian",
          perikanan: "Perikanan",
          umkm: "UMKM",
          aset: "Aset Desa",
          infrastruktur: "Infrastruktur",
        };
        return typeMap[key];
      });

    if (activeTypes.length > 0) {
      filtered = filtered.filter((location) =>
        activeTypes.includes(location.type)
      );
    }

    // Kecamatan filter
    if (filters.kecamatan) {
      filtered = filtered.filter(
        (location) => location.kecamatan === filters.kecamatan
      );
    }

    // Desa filter
    if (filters.desa) {
      filtered = filtered.filter((location) => location.desa === filters.desa);
    }

    setFilteredLocations(filtered);
  };

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    setIsDetailOpen(true);

    // Generate AI recommendation hanya jika user sudah login dan belum ada rekomendasi
    if (user && !aiRecommendations[location.id] && !location.aiRecommendation) {
      await generateAIRecommendation(location);
    }
  };

  const generateAIRecommendation = async (location: Location) => {
    if (!user) {
      console.warn("User must be logged in to generate AI recommendations");
      return;
    }

    setAiLoading(location.id);
    try {
      const recommendation =
        await GeminiAIService.generateLocationRecommendation(location);

      setAiRecommendations((prev) => ({
        ...prev,
        [location.id]: recommendation,
      }));

      try {
        await updateLocationAIRecommendation(location.id, recommendation);
      } catch (error) {
        console.error("Failed to save AI recommendation to Firestore:", error);
      }
    } catch (error) {
      console.error("Error generating AI recommendation:", error);
    } finally {
      setAiLoading(null);
    }
  };

  const getCurrentAIRecommendation = (
    location: Location
  ): AIRecommendation | null => {
    return aiRecommendations[location.id] || location.aiRecommendation || null;
  };

  const handleLayerToggle = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setActiveLayers(initialActiveLayers);
    setFilters(initialFilters);
  };

  const getFeasibilityText = (percentage: number) => {
    if (percentage >= 80) return "Sangat Layak";
    if (percentage >= 60) return "Layak";
    if (percentage >= 40) return "Cukup Layak";
    return "Kurang Layak";
  };

  // Function untuk membuat custom icon
  const createCustomIcon = (type: string) => {
    if (typeof window === "undefined") return null;

    const L = require("leaflet");
    const color = pinColors[type] || "#6b7280";

    return L.divIcon({
      className: "custom-pin",
      html: `
        <div style="
          background-color: ${color}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          position: relative; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg); 
            color: white; 
            font-size: 10px;
          ">
            <i class="fas fa-map-pin"></i>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  // Extract unique kecamatan and desa for filters
  const kecamatanList = [...new Set(locations.map((loc) => loc.kecamatan))];
  const desaList = [...new Set(locations.map((loc) => loc.desa))];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6 pt-24">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Memuat peta...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-dark mb-3">
            Peta Potensi Interaktif
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            Jelajahi berbagai potensi desa di Kabupaten Pacitan melalui peta
            interaktif dengan data lengkap {user && "dan analisis AI"}
          </p>
        </div>

        {/* Main Layout Container */}
        <div className="main-container">
          {/* Sidebar */}
          <div
            className={`sidebar bg-white rounded-xl shadow-lg p-4 ${
              isSidebarOpen ? "active" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Layer & Filter</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-gray-500"
              >
                <i className="fas fa-times text-base"></i>
              </button>
            </div>

            {/* Layer Data Potensi */}
            <div className="filter-section">
              <h3 className="font-semibold text-dark mb-3 text-sm">
                Layer Data Potensi
              </h3>
              <div className="space-y-2">
                {Object.entries(activeLayers).map(([key, isActive]) => {
                  const layerConfig =
                    layerConfigs[key as keyof typeof layerConfigs];

                  return (
                    <div
                      key={key}
                      className="flex items-center layer-toggle p-2 rounded-lg cursor-pointer bg-white shadow-sm"
                      onClick={() =>
                        handleLayerToggle(key as keyof typeof activeLayers)
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        readOnly
                        className="mr-2 h-4 w-4 text-primary rounded"
                      />
                      <label className="flex items-center cursor-pointer text-sm">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${layerConfig.color}`}
                        ></div>
                        <span className="font-medium">{layerConfig.label}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter Tambahan */}
            <div className="filter-section">
              <h3 className="font-semibold text-dark mb-3 text-sm">
                Filter Tambahan
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Kecamatan
                  </label>
                  <select
                    value={filters.kecamatan}
                    onChange={(e) =>
                      handleFilterChange("kecamatan", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">Semua Kecamatan</option>
                    {kecamatanList.map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Desa
                  </label>
                  <select
                    value={filters.desa}
                    onChange={(e) => handleFilterChange("desa", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">Semua Desa</option>
                    {desaList.map((desa) => (
                      <option key={desa} value={desa}>
                        {desa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Reset Filter Button */}
            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition mt-3 text-sm"
            >
              <i className="fas fa-redo-alt mr-1"></i> Reset Filter
            </button>
          </div>

          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div
              className="overlay active"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Map and Detail Container */}
          <div className="map-and-detail-container">
            {/* Map Header */}
            <div className="map-header-mobile mb-4">
              <h2 className="text-lg md:text-xl font-bold text-dark mb-2 lg:mb-0">
                Peta Interaktif Kabupaten Pacitan
              </h2>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="filter-toggle-btn-mobile lg:hidden"
              >
                <i className="fas fa-layer-group"></i> Filter & Layer
              </button>
            </div>

            <div className="map-container">
              {loading ? (
                <div className="h-full w-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="text-gray-500">Memuat peta...</div>
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="h-full w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <i className="fas fa-map-marked-alt text-gray-400 text-4xl mb-4"></i>
                  <p className="text-gray-500 text-center mb-2">
                    {locations.length === 0
                      ? "Tidak ada data lokasi"
                      : "Tidak ada lokasi yang sesuai dengan filter"}
                  </p>
                  {locations.length === 0 && (
                    <p className="text-gray-400 text-sm text-center">
                      Data lokasi akan muncul setelah admin menyetujui pengajuan
                      lokasi
                    </p>
                  )}
                </div>
              ) : (
                <MapContainer
                  center={[-8.2068, 111.0799]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                  className="rounded-lg"
                  ref={setMapInstance}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {filteredLocations.map((location) => (
                    <Marker
                      key={location.id}
                      position={[location.coords.lat, location.coords.lng]}
                      icon={createCustomIcon(location.type)}
                      eventHandlers={{
                        click: () => handleLocationSelect(location),
                      }}
                    >
                      <Popup>
                        <div className="p-2 max-w-xs">
                          <h3 className="font-bold text-sm mb-1">
                            {location.title}
                          </h3>
                          <div className="flex items-center mb-2">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: pinColors[location.type],
                              }}
                            ></div>
                            <span className="text-xs font-medium">
                              {location.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {location.description.substring(0, 100)}...
                          </p>

                          <button
                            onClick={() => handleLocationSelect(location)}
                            className="w-full mt-2 bg-primary text-white text-xs py-1 rounded hover:bg-blue-700 transition"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}

              {/* Map Legend */}
              {filteredLocations.length > 0 && (
                <div className="map-legend">
                  <h4 className="font-bold mb-2 text-xs">Kategori Potensi</h4>
                  <div className="space-y-1">
                    {Object.entries(pinColors).map(([type, color]) => (
                      <div key={type} className="legend-item">
                        <div
                          className="legend-color"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs font-medium">{type}</span>
                      </div>
                    ))}
                  </div>
                  {user && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-robot text-blue-500 text-xs mr-1"></i>
                        <span className="text-xs text-blue-600 font-medium">
                          AI Analysis
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location Detail Overlay */}
            <div
              className={`location-detail-overlay ${
                isDetailOpen ? "active" : ""
              }`}
            >
              <div className="p-4 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <h2 className="text-lg font-bold text-dark">Detail Lokasi</h2>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-base"></i>
                  </button>
                </div>

                {selectedLocation ? (
                  <div className="space-y-4">
                    {/* Foto Lokasi */}
                    <div
                      className="h-48 bg-gray-200 bg-cover bg-center rounded-lg"
                      style={{
                        backgroundImage: `url(${selectedLocation.image})`,
                      }}
                    ></div>

                    {/* Nama Lokasi */}
                    <div>
                      <h3 className="font-bold text-xl text-dark mb-2">
                        {selectedLocation.title}
                      </h3>

                      {/* Kategori Potensi */}
                      <div className="flex items-center mb-3">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{
                            backgroundColor: pinColors[selectedLocation.type],
                          }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          Kategori: {selectedLocation.type}
                        </span>
                      </div>

                      {/* Deskripsi Lokasi */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">
                          Deskripsi Lokasi
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {selectedLocation.description}
                        </p>
                      </div>

                      {/* Informasi Lokasi */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-700 text-xs mb-1">
                            Alamat
                          </h4>
                          <p className="text-dark text-sm">
                            {selectedLocation.desa},{" "}
                            {selectedLocation.kecamatan}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-700 text-xs mb-1">
                            Koordinat
                          </h4>
                          <p className="text-dark text-sm">
                            {selectedLocation.coords.lat.toFixed(6)},{" "}
                            {selectedLocation.coords.lng.toFixed(6)}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-700 text-xs mb-1">
                            Nilai Potensi
                          </h4>
                          <p className="text-dark text-sm font-medium">
                            {selectedLocation.potential}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-700 text-xs mb-1">
                            Kontak
                          </h4>
                          <p className="text-dark text-sm">
                            {selectedLocation.kontak || "Tidak tersedia"}
                          </p>
                        </div>
                      </div>

                      {/* Fasilitas */}
                      {selectedLocation.fasilitas &&
                        selectedLocation.fasilitas.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">
                              Fasilitas Tersedia
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedLocation.fasilitas.map(
                                (fasilitas, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
                                  >
                                    {fasilitas}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Rekomendasi AI - Hanya untuk user yang login */}
                      {user ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-blue-800 text-sm">
                              Rekomendasi AI
                            </h4>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              Powered by Gemini AI
                            </span>
                          </div>

                          {aiLoading === selectedLocation.id ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="text-blue-600 text-xs mt-2">
                                Gemini AI sedang menganalisis...
                              </p>
                            </div>
                          ) : (
                            <>
                              {getCurrentAIRecommendation(selectedLocation) ? (
                                <div className="space-y-3">
                                  {/* Skor Kelayakan */}
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-medium text-blue-700">
                                        Skor Kelayakan
                                      </span>
                                      <span className="text-xs font-bold text-blue-800">
                                        {
                                          getCurrentAIRecommendation(
                                            selectedLocation
                                          )!.feasibilityScore
                                        }
                                        /100
                                      </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{
                                          width: `${
                                            getCurrentAIRecommendation(
                                              selectedLocation
                                            )!.feasibilityScore
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                      {getFeasibilityText(
                                        getCurrentAIRecommendation(
                                          selectedLocation
                                        )!.feasibilityScore
                                      )}
                                    </p>
                                  </div>

                                  {/* Rekomendasi Utama */}
                                  <div>
                                    <h5 className="font-semibold text-blue-800 text-xs mb-1">
                                      Rekomendasi Utama
                                    </h5>
                                    <p className="text-blue-700 text-sm leading-relaxed">
                                      {
                                        getCurrentAIRecommendation(
                                          selectedLocation
                                        )!.recommendation
                                      }
                                    </p>
                                  </div>

                                  {/* Analisis Detail */}
                                  <div>
                                    <h5 className="font-semibold text-blue-800 text-xs mb-1">
                                      Analisis Detail
                                    </h5>
                                    <p className="text-blue-700 text-sm leading-relaxed">
                                      {
                                        getCurrentAIRecommendation(
                                          selectedLocation
                                        )!.analysis
                                      }
                                    </p>
                                  </div>

                                  {/* Saran Pengembangan */}
                                  {getCurrentAIRecommendation(selectedLocation)!
                                    .suggestions.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-blue-800 text-xs mb-1">
                                        Saran Pengembangan
                                      </h5>
                                      <ul className="text-blue-700 text-sm space-y-1">
                                        {getCurrentAIRecommendation(
                                          selectedLocation
                                        )!.suggestions.map(
                                          (suggestion, index) => (
                                            <li
                                              key={index}
                                              className="flex items-start"
                                            >
                                              <span className="text-green-500 mr-2">
                                                •
                                              </span>
                                              {suggestion}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Potensi Risiko */}
                                  {getCurrentAIRecommendation(selectedLocation)!
                                    .risks.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-red-800 text-xs mb-1">
                                        Potensi Risiko
                                      </h5>
                                      <ul className="text-red-700 text-sm space-y-1">
                                        {getCurrentAIRecommendation(
                                          selectedLocation
                                        )!.risks.map((risk, index) => (
                                          <li
                                            key={index}
                                            className="flex items-start"
                                          >
                                            <span className="text-red-500 mr-2">
                                              •
                                            </span>
                                            {risk}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-2">
                                  <button
                                    onClick={() =>
                                      generateAIRecommendation(selectedLocation)
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center mx-auto"
                                  >
                                    <i className="fas fa-robot mr-2"></i>
                                    Generate Rekomendasi Gemini AI
                                  </button>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Dapatkan analisis AI untuk pengembangan
                                    lokasi ini
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        /* Pesan untuk user yang belum login */
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-center mb-2">
                            <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                            <h4 className="font-bold text-yellow-800 text-sm">
                              Fitur AI Terkunci
                            </h4>
                          </div>
                          <p className="text-yellow-700 text-xs mb-3">
                            Login untuk mengakses analisis AI dan rekomendasi
                            cerdas untuk lokasi ini.
                          </p>
                          <Link
                            href="/login"
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center"
                          >
                            <i className="fas fa-sign-in-alt mr-2"></i>
                            Login untuk Akses AI
                          </Link>
                        </div>
                      )}

                      {/* Tombol Aksi */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                          <button className="bg-primary text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                            <i className="fas fa-download mr-1"></i> Unduh Data
                          </button>
                          <Link
                            href={`/detail-lokasi/${selectedLocation.id}`}
                            className="bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition text-sm text-center flex items-center justify-center"
                          >
                            <i className="fas fa-external-link-alt mr-1"></i>
                            Halaman Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-map-marked-alt text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500 text-sm">
                      Pilih lokasi di peta untuk melihat detail
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .main-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }

        @media (min-width: 1024px) {
          .main-container {
            display: grid;
            grid-template-columns: 300px 1fr;
            grid-template-rows: 1fr;
            gap: 1.5rem;
            min-height: 700px;
          }
        }

        .sidebar {
          width: 100%;
          height: 100%;
          max-height: 100vh;
          overflow-y: auto;
        }

        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 100%;
            max-width: 320px;
            height: 100vh;
            z-index: 2000;
            overflow-y: auto;
            box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
            border-radius: 0;
            padding: 20px;
            background-color: white;
            transition: left 0.3s ease;
          }

          .sidebar.active {
            left: 0;
          }
        }

        .map-and-detail-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          position: relative;
        }

        @media (min-width: 1024px) {
          .map-and-detail-container {
            height: 100%;
            min-height: 700px;
          }
        }

        .map-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          position: relative;
          height: 100%;
        }

        .map-legend {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: white;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 500;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 6px;
        }

        .location-detail-overlay {
          display: none;
          background: white;
          z-index: 1000;
          box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }

        .location-detail-overlay.active {
          display: block;
        }

        @media (min-width: 1024px) {
          .location-detail-overlay {
            position: absolute;
            top: 0;
            right: 0;
            width: 0;
            height: 100%;
            transition: width 0.3s ease;
          }

          .location-detail-overlay.active {
            width: 350px;
          }
        }

        @media (max-width: 1023px) {
          .map-and-detail-container {
            height: auto;
          }

          .map-container {
            height: 450px;
          }

          .location-detail-overlay {
            position: static;
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            margin-top: 1rem;
          }

          .location-detail-overlay.active {
            width: 100%;
          }
        }

        .overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        .overlay.active {
          display: block;
        }

        @media (min-width: 1024px) {
          .overlay {
            display: none !important;
          }
        }

        .filter-section {
          margin-bottom: 25px;
          padding: 15px;
          border-radius: 12px;
          background-color: #f8fafc;
        }

        .layer-toggle {
          transition: all 0.3s ease;
          margin-bottom: 15px;
          padding: 12px;
          border-radius: 8px;
          background-color: white;
        }

        .layer-toggle:hover {
          background-color: #f1f5f9;
        }

        .filter-toggle-btn-mobile {
          background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 6px rgba(26, 115, 232, 0.2);
          transition: all 0.3s ease;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .filter-toggle-btn-mobile {
            display: none;
          }
        }

        .filter-toggle-btn-mobile:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(26, 115, 232, 0.3);
        }
      `}</style>
    </div>
  );
}
