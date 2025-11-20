"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Location } from "@/lib/types"; // Import dari types yang sama

// Fix for default markers
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Hapus interface Location yang lama, gunakan dari lib/types

interface InteractiveMapProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
}

const InteractiveMap = ({
  locations = [],
  onLocationSelect,
}: InteractiveMapProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pinColors: { [key: string]: string } = {
    Pariwisata: "blue",
    Pertanian: "green",
    UMKM: "purple",
    Perikanan: "orange",
    Infrastruktur: "red",
    "Aset Desa": "teal",
  };

  // Create custom icons
  const createCustomIcon = (type: string) => {
    const color = pinColors[type] || "gray";

    return L.divIcon({
      className: "custom-pin",
      html: `
        <div style="
          background-color: ${color}; 
          width: 30px; 
          height: 30px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          position: relative; 
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg); 
            color: white; 
            font-size: 12px;
          ">
            <i class="fas fa-map-marker-alt"></i>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Memuat peta...</div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[-8.2068, 111.0799]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coords.lat, location.coords.lng]}
            icon={createCustomIcon(location.type)}
            eventHandlers={{
              click: () => {
                if (onLocationSelect) {
                  onLocationSelect(location);
                }
              },
            }}
          >
            <Popup>
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-sm mb-1">{location.title}</h3>
                <div className="flex items-center mb-2">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: pinColors[location.type] }}
                  ></div>
                  <span className="text-xs font-medium">{location.type}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {location.description.substring(0, 100)}...
                </p>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Kecamatan:</strong> {location.kecamatan}
                  </p>
                  <p>
                    <strong>Desa:</strong> {location.desa}
                  </p>
                  <p>
                    <strong>Potensi:</strong> {location.potential}
                  </p>
                  <p>
                    <strong>Kelayakan:</strong> {location.feasibility}%
                  </p>
                </div>
                <button
                  onClick={() => onLocationSelect && onLocationSelect(location)}
                  className="w-full mt-2 bg-primary text-white text-xs py-1 rounded hover:bg-blue-700 transition"
                >
                  Lihat Detail
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
