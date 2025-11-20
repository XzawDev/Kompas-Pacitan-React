const Footer = () => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="rounded-xl flex items-center justify-center">
                <img
                  src="/assets/images/logo.PNG"
                  className="w-9 h-9"
                  alt="Kompas Pacitan Logo"
                />
              </div>
              <div>
                <span className="text-xl font-bold">
                  KOMPAS<span className="text-primary">PACITAN</span>
                </span>
                <p className="text-xs text-gray-400 -mt-1">
                  Platform Potensi Desa
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              Platform digital untuk mengeksplorasi potensi desa dan peluang
              investasi di Kabupaten Pacitan.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary transition text-sm"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary transition text-sm"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary transition text-sm"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary transition text-sm"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-4">Menu Utama</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="/peta-potensi"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Peta Potensi
                </a>
              </li>
              <li>
                <a
                  href="/profil-desa"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Profil Desa
                </a>
              </li>
              <li>
                <a
                  href="/peluang-investasi"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Peluang Investasi
                </a>
              </li>
              <li>
                <a
                  href="/tentang"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Tentang
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Bantuan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-0.5 mr-3 text-primary text-xs"></i>
                <span>Jl. Diponegoro No. 1, Pacitan, Jawa Timur</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-3 text-primary text-xs"></i>
                <span>(0357) 123456</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-primary text-xs"></i>
                <span>info@kompaspacitan.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; 2023 Kompas Pacitan. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
