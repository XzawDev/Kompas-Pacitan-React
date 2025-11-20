const Features = () => {
  const features = [
    {
      icon: "fas fa-map-marked-alt",
      title: "Peta Potensi Interaktif",
      description:
        "Jelajahi peta digital yang menampilkan berbagai potensi desa di Pacitan dengan layer data yang dapat disesuaikan.",
      link: "/peta-potensi",
      linkText: "Jelajahi Peta",
    },
    {
      icon: "fa-solid fa-house",
      title: "Profil Digital Desa",
      description:
        "Akses informasi lengkap tentang 166 desa di Pacitan, termasuk potensi, aset, dan infrastruktur.",
      link: "/profil-desa",
      linkText: "Lihat Profil Desa",
    },
    {
      icon: "fas fa-brain",
      title: "Analitik AI",
      description:
        "Dapatkan rekomendasi dan analisis kelayakan investasi dengan teknologi kecerdasan buatan.",
      link: "/peluang-investasi",
      linkText: "Coba Analitik AI",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
            Fitur Utama Aplikasi
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jelajahi berbagai fitur yang akan membantu Anda menemukan potensi
            Pacitan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 card-hover border border-gray-100"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="feature-icon">
                <i className={`${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-dark mb-3 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 text-center text-sm">
                {feature.description}
              </p>
              <a
                href={feature.link}
                className="block w-full bg-primary/10 text-primary font-semibold py-2.5 rounded-xl text-center hover:bg-primary hover:text-white transition text-sm"
              >
                {feature.linkText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
