"use client";

import { InvestmentOpportunity } from "@/lib/types";

interface InvestmentCardsProps {
  investments: InvestmentOpportunity[];
}

const InvestmentCards = ({ investments }: InvestmentCardsProps) => {
  if (investments.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
              Peluang Investasi Desa
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Belum ada peluang investasi yang tersedia saat ini
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
            Peluang Investasi Desa
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai peluang investasi menguntungkan di desa-desa
            Pacitan yang telah dianalisis dengan teknologi AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investments.map((investment, index) => (
            <div
              key={investment.id}
              className="investment-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div
                className="investment-image"
                style={{
                  backgroundImage: `url('${investment.image}')`,
                }}
              >
                <div className="investment-badge text-primary">
                  <i className="fas fa-robot mr-1"></i> Rekomendasi AI
                </div>
              </div>

              <div className="investment-content">
                <h3 className="text-xl font-bold text-dark mb-3">
                  {investment.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {investment.description}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Kelayakan</span>
                    <span className="font-semibold text-primary">
                      {investment.feasibility}%
                    </span>
                  </div>
                  <div className="investment-progress">
                    <div
                      className="investment-progress-bar"
                      style={{ width: `${investment.feasibility}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Estimasi Modal</div>
                    <div className="font-bold text-lg text-dark">
                      {investment.estimatedCapital}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-right text-gray-500">ROI</div>
                    <div className="font-bold text-green-600 text-lg">
                      {investment.roi}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Lokasi</div>
                    <div className="font-semibold text-sm text-dark">
                      {investment.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-right text-gray-500">
                      Durasi
                    </div>
                    <div className="font-bold text-green-600 text-lg">
                      {investment.duration}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap mb-4">
                  {investment.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="investment-tag">
                      <i className="fas fa-tag mr-1"></i> {tag}
                    </span>
                  ))}
                  <span className="investment-tag">
                    <i className="fas fa-map-marker-alt mr-1"></i>{" "}
                    {investment.location}
                  </span>
                  <span className="investment-tag">
                    <i className="fas fa-clock mr-1"></i> {investment.duration}
                  </span>
                </div>

                <a
                  href={`/peluang-investasi/${investment.id}`}
                  className="block w-full btn-primary text-white font-semibold py-3 rounded-xl text-center hover:shadow-lg transition text-sm"
                >
                  Lihat Detail
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10" data-aos="fade-up">
          <a
            href="/peluang-investasi"
            className="inline-flex items-center bg-transparent border-2 border-primary text-primary font-semibold px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white transition text-sm"
          >
            Lihat Semua Peluang Investasi
            <i className="fas fa-arrow-right ml-2 text-xs"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InvestmentCards;
