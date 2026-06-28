import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork, UserProfile } from '../types';

interface ArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  onAddToCart: (artwork: Artwork) => void;
  currentUser: UserProfile | null;
  onToggleFavorite: (artworkId: string) => void;
  cart: Artwork[];
}

export default function ArtworkModal({
  artwork,
  onClose,
  onAddToCart,
  currentUser,
  onToggleFavorite,
  cart,
}: ArtworkModalProps) {
  if (!artwork) return null;

  const isInCart = cart.some((item) => item.id === artwork.id);
  const isFavorite = currentUser?.favoriteArtIds.includes(artwork.id) || false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#121212] backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-[#fbf9f8] w-full max-w-5xl rounded-xs overflow-hidden border border-[#121212]/10 shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
        >
          {/* Close Trigger */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-[#fbf9f8] hover:bg-[#121212] hover:text-[#fbf9f8] transition-colors rounded-full p-2.5 z-20 flex items-center justify-center shadow-md border border-[#121212]/10"
          >
            <span className="material-symbols-outlined text-md">close</span>
          </button>

          {/* Left Column: Huge High-Quality Image */}
          <div className="w-full md:w-3/5 bg-[#efeded] relative min-h-[300px] md:min-h-0 overflow-hidden flex items-center justify-center">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {artwork.isNewRelease && (
              <span className="absolute top-4 left-4 bg-violet-600 text-white font-bold text-[9px] uppercase tracking-widest px-3 py-1 shadow-md">
                New Release
              </span>
            )}
          </div>

          {/* Right Column: Complete Editorial Details */}
          <div className="w-full md:w-2/5 p-6 md:p-10 flex flex-col justify-between overflow-y-auto h-full space-y-8">
            <div className="space-y-6">
              {/* Category, Series & Favorite toggle */}
              <div className="flex justify-between items-center border-b border-[#121212]/5 pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5e5e5b]">
                  {artwork.category} {artwork.series ? `• ${artwork.series}` : ''}
                </span>
                
                <button
                  onClick={() => onToggleFavorite(artwork.id)}
                  className="flex items-center gap-1 group text-xs font-bold uppercase tracking-wider text-[#121212] hover:text-red-500 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined transition-colors ${
                      isFavorite ? 'text-red-500 fill-red-500' : 'text-[#121212]'
                    }`}
                    style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : undefined }}
                  >
                    favorite
                  </span>
                  <span>{isFavorite ? 'FAVORITED' : 'FAVORITE'}</span>
                </button>
              </div>

              {/* Title & Artist */}
              <div className="space-y-1">
                <h2 className="font-serif text-3xl md:text-4xl text-[#121212] leading-tight font-semibold">
                  {artwork.title}
                </h2>
                <p className="text-sm font-medium text-[#5e5e5b] uppercase tracking-widest">
                  By {artwork.artist}
                </p>
              </div>

              {/* Multi-sentence Description */}
              <p className="text-sm text-[#5e5e5b] leading-relaxed">
                {artwork.description ||
                  'An extraordinary creation exhibiting structural modernism, contrasting geometries, and visual balance. The piece sits at the zenith of contemporary fine art practice, provoking architectural space.'}
              </p>
            </div>

            {/* Bottom Actions Block */}
            <div className="space-y-4 pt-6 border-t border-[#121212]/5">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold tracking-widest text-[#5e5e5b] uppercase">Price</span>
                <span className="font-serif text-2xl font-bold text-[#121212]">
                  {artwork.priceUnit}
                  {artwork.price.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {artwork.isAvailable ? (
                  <button
                    onClick={() => {
                      onAddToCart(artwork);
                      onClose();
                    }}
                    className={`w-full py-4 font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 text-center flex justify-center items-center gap-2 ${
                      isInCart
                        ? 'bg-[#5e5e5b] text-[#fbf9f8] cursor-not-allowed'
                        : 'bg-[#121212] text-[#fbf9f8] hover:bg-[#5e5e5b]'
                    }`}
                    disabled={isInCart}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isInCart ? 'check_circle' : 'shopping_bag'}
                    </span>
                    {isInCart ? 'ALREADY IN CART' : 'ADD TO CART'}
                  </button>
                ) : (
                  <button
                    className="w-full py-4 bg-[#5e5e5b]/10 text-[#5e5e5b] font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-[#121212]/10"
                    disabled
                  >
                    ACQUIRED BY COLLECTOR
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
