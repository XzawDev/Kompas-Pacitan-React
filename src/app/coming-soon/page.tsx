// file: app/coming-soon/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const ComingSoonPage = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentTech, setCurrentTech] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsClient(true);

    // Calculate countdown to specific date (e.g., January 1, 2024)
    const calculateCountdown = () => {
      const targetDate = new Date("2024-01-01T00:00:00");
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    };

    // Animate progress bar
    const progressTimer = setTimeout(() => {
      setProgress(68); // Simulated progress percentage
    }, 500);

    // Tech stack rotation
    const techTimer = setInterval(() => {
      setCurrentTech((prev) => (prev + 1) % 3);
    }, 3000);

    // Handle window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initialize
    calculateCountdown();
    const countdownTimer = setInterval(calculateCountdown, 1000);
    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize particle effect
    const initParticles = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles: Array<{
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        color: string;
      }> = [];

      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#06b6d4" : "#8b5cf6",
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;

          // Boundary check
          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
          if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Draw connections
          particles.forEach((p2) => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `${p.color}20`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
        });

        requestAnimationFrame(animate);
      };

      animate();
    };

    initParticles();

    return () => {
      clearTimeout(progressTimer);
      clearInterval(techTimer);
      clearInterval(countdownTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const techStack = [
    {
      name: "TensorFlow",
      icon: "🧠",
      description: "Machine Learning Framework",
    },
    { name: "Next.js 14", icon: "⚡", description: "React Framework" },
    { name: "Three.js", icon: "🎮", description: "3D Graphics" },
  ];

  const features = [
    {
      name: "Neural Network Analysis",
      icon: "🔬",
      status: "training",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Real-time Data Processing",
      icon: "📡",
      status: "active",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "3D Visualization Engine",
      icon: "👁️",
      status: "developing",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Blockchain Integration",
      icon: "⛓️",
      status: "planned",
      color: "from-orange-500 to-red-500",
    },
  ];

  // Binary rain characters
  const binaryRainChars = isClient
    ? Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />

      {/* Grid Background */}
      <div className="fixed inset-0 z-1 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 lg:px-8 pt-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center">
            {/* Logo */}
            <Link href="/" className="group mb-6 lg:mb-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
                  />
                  <div className="w-12 h-12  rounded-xl flex items-center justify-center relative">
                    <img
                      src="/assets/images/logo.PNG"
                      alt="KOMPAS PACITAN"
                      className="w-10 h-10"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      KOMPAS
                    </span>
                    <span className="text-white">PACITAN</span>
                  </h1>
                  <p className="text-sm text-gray-400 font-mono">
                    v1.5.0-alpha
                  </p>
                </div>
              </div>
            </Link>

            {/* Status Indicator */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono text-green-400">
                  SISTEM AKTIF
                </span>
              </div>
              {isClient && (
                <div className="hidden lg:block font-mono text-sm text-gray-400">
                  {new Date().toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-8 pt-16 lg:pt-24 pb-32">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-6xl mx-auto text-center mb-20"
          >
            {/* <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-8">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-mono text-cyan-400">
                TECH PREVIEW
              </span>
            </div> */}

            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                FITUR
              </span>
              <span className="text-white"> </span>
              <br />
              <span className="text-3xl lg:text-5xl text-gray-300">
                DALAM PENGEMBANGAN
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto font-light">
              Beberapa fitur sedang dalam tahap pengembangan. Terima kasih atas
              kesabaran Anda. Kami akan segera menyempurnakan fitur ini.
            </p>

            {/* Tech Stack Indicator */}

            {/* Countdown */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
              {Object.entries(countdown).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 * Object.keys(countdown).indexOf(key),
                  }}
                  className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 relative overflow-hidden group"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="text-4xl lg:text-5xl font-bold font-mono mb-2">
                      {value.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                      {key}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div> */}

            {/* Progress Section */}
            <div className="max-w-2xl mx-auto mb-20">
              <div className="flex justify-between text-sm font-mono text-gray-400 mb-4">
                <span>PROGRES SISTEM</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
              </div>
              <div className="text-center text-sm text-gray-500 mt-4 font-mono">
                STATUS: {progress < 100 ? "PROSES" : "READY"}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 py-4 justify-center">
                <Link
                  href="/"
                  className="px-8 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-400 transition-all"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">←</span>
                    Kembali Ke Beranda
                  </span>
                </Link>
              </div>
            </div>

            {/* CTA Section */}
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 border border-gray-800 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="text-4xl mb-6">🚀</div>
                  <h2 className="text-2xl font-bold mb-4">
                    JOIN THE REVOLUTION
                  </h2>
                  <p className="text-gray-400 mb-8">
                    Be the first to experience our cutting-edge platform. Get
                    notified when we launch and gain early access privileges.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      <span className="flex items-center justify-center">
                        <span className="mr-2">🔔</span>
                        NOTIFY ME
                      </span>
                    </motion.button>

                    <Link
                      href="/"
                      className="px-8 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-400 transition-all"
                    >
                      <span className="flex items-center justify-center">
                        <span className="mr-2">←</span>
                        RETURN TO BASE
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div> */}
          </motion.div>
        </main>

        {/* Terminal Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="border-t border-gray-900"
        >
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="mb-4 lg:mb-0">
                <div className="font-mono text-sm text-gray-500">
                  <span className="text-green-400">$</span> system status --all
                </div>
                <div className="font-mono text-xs text-gray-600 mt-2"></div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="font-mono text-sm">
                  <span className="text-gray-500">v</span>
                  <span className="text-cyan-400">1.5.0</span>
                  <span className="text-gray-500">-alpha</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400 font-mono">AKTIF</span>
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Floating Tech Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 20, ease: "linear" },
        }}
        className="fixed top-1/4 left-1/4 text-6xl opacity-10 pointer-events-none z-20"
      >
        💾
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
          scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
        }}
        className="fixed bottom-1/3 right-1/4 text-5xl opacity-10 pointer-events-none z-20"
      >
        🔧
      </motion.div>

      {/* Binary Rain Effect - Fixed for SSR */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-10">
        {binaryRainChars.map((char) => (
          <motion.div
            key={char.id}
            initial={{ y: -100, opacity: 0 }}
            animate={{
              y: windowSize.height > 0 ? windowSize.height + 100 : 1000,
              opacity: [0, 1, 0],
            }}
            transition={{
              y: {
                duration: char.duration,
                repeat: Infinity,
                delay: char.delay,
              },
              opacity: { duration: char.duration, repeat: Infinity },
            }}
            className="absolute font-mono text-green-400 text-sm"
            style={{ left: `${char.left}%` }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ComingSoonPage;
