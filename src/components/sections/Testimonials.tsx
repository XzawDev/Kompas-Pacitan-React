const Testimonials = () => {
  const testimonials = [
    {
      initials: "AS",
      name: "Ahmad Surya",
      role: "Investor",
      content:
        '"Berkat Kompas Pacitan, saya menemukan peluang investasi di sektor agrowisata yang sangat menjanjikan. Analisis AI-nya membantu saya mengambil keputusan dengan lebih percaya diri."',
      rating: 5,
    },
    {
      initials: "BD",
      name: "Budi Darmawan",
      role: "Kepala Desa",
      content:
        '"Platform ini sangat membantu desa kami dalam mempromosikan potensi yang dimiliki. Sekarang lebih banyak investor yang tertarik untuk mengembangkan desa kami."',
      rating: 4.5,
    },
    {
      initials: "SR",
      name: "Sari Ratna",
      role: "Pengusaha UMKM",
      content:
        '"Melalui Kompas Pacitan, produk kerajinan kami mendapatkan exposure yang lebih luas. Sekarang kami bisa menjangkup pasar yang lebih besar dengan bantuan platform ini."',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 gradient-bg text-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Apa Kata Mereka?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Testimoni dari pengguna yang telah merasakan manfaat Kompas Pacitan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-base mr-3">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-bold text-dark">{testimonial.name}</h4>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{testimonial.content}</p>
              <div className="flex text-yellow-400 mt-3 text-sm">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas ${
                      i < Math.floor(testimonial.rating)
                        ? "fa-star"
                        : testimonial.rating % 1 !== 0 &&
                          i === Math.floor(testimonial.rating)
                        ? "fa-star-half-alt"
                        : "fa-star"
                    }`}
                  ></i>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
