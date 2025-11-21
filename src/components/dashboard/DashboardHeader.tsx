// components/dashboard/DashboardHeader.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
  const { user } = useAuth();

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
            <div className="text-right hidden sm:block">
              <div className="font-bold text-gray-800 text-sm">
                {user?.username || user?.displayName || "User"}
              </div>
              <small className="text-gray-500 text-xs capitalize">
                {user?.role || "User"}
              </small>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
