"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import Features from "@/components/sections/Features";
import InvestmentCards from "@/components/sections/InvestmentCards";
import Testimonials from "@/components/sections/Testimonials";
import CTA from "@/components/sections/CTA";
import dynamic from "next/dynamic";
import { Location, InvestmentOpportunity } from "@/lib/types";

// Dynamic import untuk MapSection
const MapSection = dynamic(() => import("@/components/sections/MapSection"), {
  ssr: false,
  loading: () => (
    <section className="py-16 gradient-bg-light">
      <div className="container mx-auto px-4">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-500">Memuat peta...</div>
        </div>
      </div>
    </section>
  ),
});

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [investments, setInvestments] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize AOS hanya di client
    const initAOS = async () => {
      const AOS = (await import("aos")).default;
      AOS.init({
        duration: 800,
        once: true,
        offset: 100,
      });
    };

    initAOS();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Coba load dari Firestore
      try {
        const { getApprovedLocations, getApprovedInvestments } = await import(
          "@/lib/firestoreService"
        );
        const [locationsData, investmentsData] = await Promise.all([
          getApprovedLocations(),
          getApprovedInvestments(),
        ]);

        setLocations(
          locationsData.length > 0 ? locationsData : [] // fallbackLocations akan ditetapkan di bawah
        );
        setInvestments(
          investmentsData.length > 0 ? investmentsData : [] // fallbackInvestments akan ditetapkan di bawah
        );
      } catch (error) {
        console.error("Firestore error, using fallback data:", error);
        // Gunakan fallback data jika Firestore error
        setLocations([]);
        setInvestments([]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setLocations([]);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  // const handleLocationSelect = (location: Location) => {
  //   // Redirect ke halaman detail lokasi
  //   window.location.href = `/lokasi/${location.id}`;
  // };

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />

        {/* Section Peta Interaktif */}
        <MapSection locations={locations.slice(0, 6)} />

        {/* Section Peluang Investasi */}
        <InvestmentCards investments={investments.slice(0, 3)} />

        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
