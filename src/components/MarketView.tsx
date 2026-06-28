import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '../types';

interface MarketViewProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onNavigate: (view: 'gallery' | 'market' | 'profile' | 'checkout') => void;
  onAddToCart: (artwork: Artwork) => void;
}

type CategoryType = 'all' | 'sculpture' | 'painting' | 'digital' | 'photography' | 'mixed media';

export default function MarketView({
  artworks,
  onSelectArtwork,
  onNavigate,
  onAddToCart,
}: MarketViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [joinedNews, setJoinedNews] = useState(false);

  // Filter artworks based on categories and search query
  const filteredArtworks = artworks.filter((art) => {
    const matchesCategory =
      selectedCategory === 'all' || art.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleJoinNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailValue) {
      setJoinedNews(true);
      setTimeout(() => setJoinedNews(false), 5000);
      setEmailValue('');
    }
  };

  const categories: { label: string; value: CategoryType }[] = [
    { label: 'All Works', value: 'all' },
    { label: 'Sculpture', value: 'sculpture' },
    { label: 'Painting', value: 'painting' },
    { label: 'Digital', value: 'digital' },
    { label: 'Photography', value: 'photography' },
    { label: 'Mixed Media', value: 'mixed media' },
  ];

  return (
    <div className="space-y-12">
      {/* Header Info */}
      <section className="px-5 md:px-10 max-w-7xl mx-auto space-y-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl md:text-6xl font-normal leading-tight text-[#121212]"
        >
          The New Standard in <br />
          <span className="italic font-semibold">Modern Art</span>
        </motion.h1>
        <p className="text-[#5e5e5b] text-base md:text-lg max-w-2xl leading-relaxed">
          Discover an expertly curated selection of limited edition pieces from the world's most visionary creators.
        </p>
      </section>

      {/* Controls Bar (Filter + Search) */}
      <section className="px-5 md:px-10 max-w-7xl mx-auto sticky top-16 z-30 bg-[#fbf9f8]/95 backdrop-blur-md py-4 border-b border-[#121212]/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Category Scroll */}
        <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-2 w-full md:w-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-[#121212] text-[#fbf9f8]'
                    : 'bg-[#5e5e5b]/5 border border-[#121212]/10 hover:bg-[#5e5e5b]/10 text-[#121212]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Minimalist Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artists or works..."
            className="w-full bg-[#efeded] border-0 border-b border-[#121212]/10 p-3 pr-10 focus:ring-0 focus:border-[#121212] text-xs uppercase tracking-widest font-semibold transition-all duration-300"
          />
          <span className="material-symbols-outlined absolute right-3 top-3 text-[#5e5e5b] text-lg pointer-events-none">
            search
          </span>
        </div>
      </section>

      {/* Dynamic Grid */}
      <section className="px-5 md:px-10 max-w-7xl mx-auto min-h-[400px]">
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <span className="material-symbols-outlined text-4xl text-[#5e5e5b]/40">search_off</span>
            <p className="text-[#5e5e5b] font-medium text-sm uppercase tracking-widest">
              No masterpieces matched your query.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          >
            <AnimatePresence mode="popLayout">
              {filteredArtworks.map((art) => (
                <motion.div
                  key={art.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="group cursor-pointer flex flex-col justify-between"
                  onClick={() => onSelectArtwork(art)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#efeded] mb-4 border border-[#121212]/5 shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      src={art.imageUrl}
                      alt={art.title}
                      loading="lazy"
                    />

                    {/* New Release Badge */}
                    {art.isNewRelease && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="bg-violet-600 text-white font-bold text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm">
                          New Release
                        </span>
                      </div>
                    )}

                    {/* Sold out marker if unavailable */}
                    {!art.isAvailable && (
                      <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-white border border-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-black/40">
                          Acquired
                        </span>
                      </div>
                    )}

                    {/* Hover detail overlay */}
                    <div className="absolute inset-0 bg-[#121212]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-[#fbf9f8]/90 text-[#121212] px-6 py-3 font-semibold text-xs uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-transform duration-300">
                        View Details
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#121212] group-hover:underline">
                        {art.title}
                      </h3>
                      <p className="text-xs text-[#5e5e5b] uppercase tracking-wider">{art.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-xs text-[#121212] uppercase tracking-wider">
                        {art.priceUnit}
                        {art.price.toLocaleString()}
                      </p>
                      {art.series && (
                        <p className="text-[10px] text-violet-600 font-semibold uppercase tracking-wider">
                          {art.series}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Newsletter Signup Banner */}
      <section className="px-5 md:px-10 max-w-7xl mx-auto border-t border-[#121212]/10 py-16 text-center space-y-6">
        <h2 className="font-serif text-3xl font-normal text-[#121212]">Be the first to know</h2>
        <p className="text-[#5e5e5b] text-sm max-w-md mx-auto leading-relaxed">
          Receive curated weekly updates on new arrivals, artist spotlights, and exclusive events.
        </p>

        <form onSubmit={handleJoinNewsletter} className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto pt-4">
          <input
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-[#efeded] border-0 border-b border-[#121212]/10 p-4 focus:ring-0 focus:border-violet-600 transition-all text-sm uppercase tracking-wider font-semibold"
            required
          />
          <button
            type="submit"
            className="px-10 py-4 bg-[#121212] hover:bg-[#5e5e5b] text-[#fbf9f8] font-semibold text-xs uppercase tracking-widest active:scale-95 transition-all duration-300 whitespace-nowrap shadow-sm"
          >
            {joinedNews ? 'Joined' : 'Join'}
          </button>
        </form>

        {joinedNews && (
          <p className="text-xs text-green-600 font-bold uppercase tracking-widest animate-pulse">
            Welcome to the Curated collective circles. Check your inbox soon.
          </p>
        )}
      </section>
    </div>
  );
}
