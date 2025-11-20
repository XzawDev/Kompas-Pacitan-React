const Hero = () => {
  return (
    <section className="hero-bg text-white py-16 md:py-24 relative overflow-hidden">
      {/* Floating shapes */}
      <div className="floating-shape floating-shape-1"></div>
      <div className="floating-shape floating-shape-2"></div>
      <div className="floating-shape floating-shape-3"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0" data-aos="fade-right">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              Temukan Potensi <span className="text-accent">Pacitan</span> yang
              Menakjubkan
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl">
              Platform digital untuk mengeksplorasi potensi desa, aset, dan
              peluang investasi di 166 desa Kabupaten Pacitan.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <a
                href="/peta-potensi"
                className="btn-accent text-dark font-semibold px-6 py-3 rounded-xl text-center shadow-lg text-base"
              >
                Lihat Peta Pacitan
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
