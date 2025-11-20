const CTA = () => {
  return (
    <section className="py-16 gradient-bg text-white relative overflow-hidden">
      <div className="floating-shape floating-shape-1"></div>
      <div className="floating-shape floating-shape-2"></div>

      <div
        className="container mx-auto px-4 lg:px-8 max-w-7xl text-center relative z-10"
        data-aos="fade-up"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Siap Menemukan Potensi Pacitan?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Bergabunglah dengan Kompas Pacitan sekarang dan akses informasi
          lengkap tentang potensi desa serta peluang investasi.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a
            href="/login"
            className="btn-accent text-dark font-semibold px-6 py-3 rounded-xl text-base shadow-lg"
          >
            Daftar Sekarang
          </a>
          <a
            href="/login"
            className="bg-transparent border-2 border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-primary transition text-base"
          >
            Login
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;
