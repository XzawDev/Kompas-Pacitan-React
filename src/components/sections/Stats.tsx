"use client";

import { useEffect, useState } from "react";

const Stats = () => {
  const [desaCount, setDesaCount] = useState(0);
  const [kecamatanCount, setKecamatanCount] = useState(0);
  const [asetCount, setAsetCount] = useState(0);

  useEffect(() => {
    // Animasi counter
    const animateCounter = (
      setter: React.Dispatch<React.SetStateAction<number>>,
      target: number,
      duration: number
    ) => {
      let start = 0;
      const increment = target / (duration / 16); // 60fps
      const updateCounter = () => {
        start += increment;
        if (start < target) {
          setter(Math.floor(start));
          requestAnimationFrame(updateCounter);
        } else {
          setter(target);
        }
      };
      updateCounter();
    };

    animateCounter(setDesaCount, 166, 2000);
    animateCounter(setKecamatanCount, 12, 2000);
    animateCounter(setAsetCount, 845, 2000);
  }, []);

  return (
    <section className="py-14 gradient-bg-light">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div
            className="p-6 stats-counter bg-white rounded-xl shadow-lg"
            data-aos="fade-up"
          >
            <div className="text-4xl font-bold text-primary mb-2 flex justify-center items-center">
              <span>{desaCount}</span>
            </div>
            <div className="text-lg font-semibold text-dark mb-1">Desa</div>
            <p className="text-gray-500 text-sm">Tersebar di seluruh Pacitan</p>
          </div>
          <div
            className="p-6 stats-counter bg-white rounded-xl shadow-lg"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="text-4xl font-bold text-secondary mb-2 flex justify-center items-center">
              <span>{kecamatanCount}</span>
            </div>
            <div className="text-lg font-semibold text-dark mb-1">
              Kecamatan
            </div>
            <p className="text-gray-500 text-sm">Wilayah administratif</p>
          </div>
          <div
            className="p-6 stats-counter bg-white rounded-xl shadow-lg"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="text-4xl font-bold text-accent mb-2 flex justify-center items-center">
              <span>{asetCount}</span>
              <span className="text-2xl ml-2">+</span>
            </div>
            <div className="text-lg font-semibold text-dark mb-1">
              Aset Tercatat
            </div>
            <p className="text-gray-500 text-sm">Potensi dan sumber daya</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
