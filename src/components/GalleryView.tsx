import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Artwork } from '../types';

interface GalleryViewProps {
  artworks: Artwork[];
  onNavigate: (view: 'gallery' | 'market' | 'profile' | 'checkout') => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onAddToCart: (artwork: Artwork) => void;
}

export default function GalleryView({
  artworks,
  onNavigate,
  onSelectArtwork,
  onAddToCart,
}: GalleryViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Featured works shown on homepage (matching mockup precisely)
  const featuredIds = ['art-1', 'art-2', 'art-3'];
  const featuredArtworks = artworks.filter((a) => featuredIds.includes(a.id));

  // If initial load doesn't find them by exact id, pick first 3
  const displayArtworks = featuredArtworks.length > 0 ? featuredArtworks : artworks.slice(0, 3);

  // Render a stunning interactive mathematical 3D-morphing canvas wireframe sculpture (Visions Hero)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
      mouseY = (e.clientY - rect.top - height / 2) / (height / 2);
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      // Draw elegant abstract orbital wireframe lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;

      const centerX = width / 2;
      const centerY = height / 2;
      const radiusBase = Math.min(width, height) * 0.28;

      // Draw a morphing mathematical orbital shape (resembles Torus Knot / visions sculpture)
      for (let j = 0; j < 30; j++) {
        ctx.beginPath();
        const offset = j * (Math.PI / 15);
        for (let i = 0; i <= 100; i++) {
          const theta = (i / 100) * Math.PI * 2;
          
          // Torus knot mathematical projections combined with cursor sway
          const r = radiusBase * (1.1 + 0.35 * Math.sin(theta * 3 + time + offset));
          const x = centerX + r * Math.cos(theta + mouseX * 0.15) + Math.cos(time + offset) * 15;
          const y = centerY + r * Math.sin(theta + mouseY * 0.15) * Math.sin(time + offset * 0.5) * 0.8;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        
        // Highlight core bands with electric violet tones or charcoal
        if (j % 5 === 0) {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.18)'; // premium electric violet pop
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = 'rgba(18, 18, 18, 0.06)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      // Draw inner dense core
      ctx.beginPath();
      ctx.arc(centerX + mouseX * 25, centerY + mouseY * 25, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#121212';
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background 3D Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair z-0"
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-3xl flex flex-col items-center gap-8 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-7xl md:text-[110px] leading-none text-[#121212] uppercase tracking-tighter select-none"
          >
            Visions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-lg md:text-xl text-[#5e5e5b] max-w-xl mx-auto leading-relaxed"
          >
            A digital sanctum for the avant-garde. We curate the intersection of physical medium and digital evolution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-4"
          >
            <button
              onClick={() => onNavigate('market')}
              className="px-10 py-5 bg-[#121212] text-[#fbf9f8] font-semibold text-sm uppercase tracking-widest hover:bg-[#5e5e5b] transition-all duration-300 active:scale-95 hover:shadow-lg shadow-black/10"
            >
              VIEW COLLECTION
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#121212]">Scroll</span>
          <div className="w-px h-12 bg-[#121212] animate-pulse"></div>
        </div>
      </section>

      {/* Featured Works (Bento Grid Layout) */}
      <section className="px-5 md:px-10 max-w-7xl mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4 border-b border-[#121212]/5 pb-4">
          <h3 className="font-serif text-3xl md:text-4xl text-[#121212] font-semibold">Featured Works</h3>
          <span className="text-xs font-bold uppercase tracking-widest text-[#5e5e5b]">AUTUMN / 2024</span>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Large Left Column Feature */}
          <div className="md:col-span-8 group cursor-pointer" onClick={() => displayArtworks[0] && onSelectArtwork(displayArtworks[0])}>
            {displayArtworks[0] && (
              <div className="space-y-4">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#efeded] border border-[#121212]/5">
                  <img
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    src={displayArtworks[0].imageUrl}
                    alt={displayArtworks[0].title}
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] font-bold tracking-widest text-[#fbf9f8] bg-[#121212]/50 backdrop-blur-md px-3 py-1.5 uppercase">
                      {displayArtworks[0].category}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-xl md:text-2xl text-[#121212] group-hover:underline">{displayArtworks[0].title}</h4>
                    <p className="text-sm text-[#5e5e5b]">{displayArtworks[0].artist}</p>
                  </div>
                  <p className="font-semibold text-base text-[#121212]">
                    {displayArtworks[0].priceUnit}
                    {displayArtworks[0].price.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Small Right Column Features */}
          <div className="md:col-span-4 flex flex-col gap-8">
            {displayArtworks.slice(1, 3).map((art) => (
              <div key={art.id} className="group cursor-pointer" onClick={() => onSelectArtwork(art)}>
                <div className="relative aspect-square overflow-hidden bg-[#e9e8e7] border border-[#121212]/5 mb-3">
                  <img
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    src={art.imageUrl}
                    alt={art.title}
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[9px] font-bold tracking-widest text-[#fbf9f8] bg-[#121212]/40 backdrop-blur px-2.5 py-1 uppercase">
                      {art.category}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-serif text-md font-semibold text-[#121212] group-hover:underline uppercase tracking-tight">
                      {art.title}
                    </p>
                    <p className="text-xs text-[#5e5e5b]">{art.artist}</p>
                  </div>
                  <p className="text-xs font-semibold text-[#121212]">
                    {art.priceUnit}
                    {art.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aesthetic Interstitial Section */}
      <section className="bg-[#f5f3f3] py-16 px-5 md:px-10 overflow-hidden relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl text-[#121212] leading-tight font-semibold">
              The intersection of <br />
              <span className="italic">craft &amp; digital vision.</span>
            </h2>
            <p className="text-md md:text-lg text-[#5e5e5b] leading-relaxed">
              Every piece in our collection is rigorously vetted by our board of international curators to ensure absolute quality and visionary merit.
            </p>
            <button 
              onClick={() => onNavigate('market')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#121212] hover:opacity-70 transition-opacity border-b border-[#121212] pb-1"
            >
              Discover our process <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
            </button>
          </div>
          <div className="w-full md:w-1/2 relative aspect-video">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 w-full h-full border border-[#121212]/10 overflow-hidden shadow-sm">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5fiUdvpyZteZoeuh--gZrcu0pVTpkRFp18PFpOjjJqPwpiM_7_4CejyxOh2XUUpd7YUUafvJoJ1uyY3g6rrZOqub2rWHaEOvWiVy2QKJFhU0CDhbKHguGwAZ-4ouSNC11okHfbSXD-Zbq3OaoEIvcIW7CiTLFQGtsv_g4VONEqBZ-UuLHuVi3VGLbgmonzQNGBfnh7_uH6cPh0-OF0HZWceqoXwAuUK-RDovPwIReuYzNk6CpbWQF22gCe-W4492SigniGDYK0RFk"
                alt="Curated process examine space"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Join the Collective Call to Action */}
      <section className="py-16 px-5 md:px-10 text-center">
        <div className="max-w-2xl mx-auto py-12 border-y border-[#121212]/10 space-y-6">
          <h3 className="font-serif text-3xl text-[#121212] font-semibold">Join the Collective</h3>
          <p className="text-[#5e5e5b] text-sm md:text-base max-w-md mx-auto">
            Gain early access to exclusive drops and curated digital exhibitions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <input
              className="px-6 py-4 bg-[#efeded] border-0 border-b border-[#121212]/20 focus:ring-0 focus:border-[#121212] transition-all text-sm w-full sm:w-80"
              placeholder="Artist or Collector Email"
              type="email"
            />
            <button 
              onClick={() => onNavigate('market')}
              className="px-8 py-4 bg-[#121212] text-[#fbf9f8] font-semibold text-xs uppercase tracking-widest hover:bg-[#5e5e5b] active:scale-95 transition-all duration-300 shadow-sm"
            >
              ENTER MARKETPLACE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
