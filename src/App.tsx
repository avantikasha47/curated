import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork, UserProfile, Order } from './types';

// Subcomponents
import GalleryView from './components/GalleryView';
import MarketView from './components/MarketView';
import ProfileView from './components/ProfileView';
import CheckoutView from './components/CheckoutView';
import ArtworkModal from './components/ArtworkModal';

export default function App() {
  const [activeView, setActiveView] = useState<'gallery' | 'market' | 'profile' | 'checkout'>('gallery');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Artwork[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Authentication states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('avantika@curated.art'); // default mock user email for easy startup preview
  const [authFirstName, setAuthFirstName] = useState('Avantika');
  const [authLastName, setAuthLastName] = useState('Sharma');
  const [authError, setAuthError] = useState('');

  // Fetch initial masterpieces catalog
  const fetchArtworks = async () => {
    try {
      const res = await fetch('/api/artworks');
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setArtworks(data);
      }
    } catch (err) {
      console.error('Error fetching artworks:', err);
    }
  };

  // Fetch completed orders list
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Fetch logged in profile
  const fetchProfile = async (email: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${email}`,
        },
      });
      if (res.ok) {
        const profile = await res.json();
        setCurrentUser(profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    fetchArtworks();
    fetchOrders();
    // Default logged in user matching mockup
    fetchProfile('avantika@curated.art');
  }, []);

  // Handle addition to Cart
  const handleAddToCart = (artwork: Artwork) => {
    if (!cart.some((item) => item.id === artwork.id)) {
      setCart((prev) => [...prev, artwork]);
    }
  };

  // Handle removal from Cart
  const handleRemoveFromCart = (artworkId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== artworkId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Toggle user favorite artwork
  const handleToggleFavorite = async (artworkId: string) => {
    if (!currentUser) {
      // Trigger login prompt
      setIsAuthModalOpen(true);
      return;
    }

    const isFav = currentUser.favoriteArtIds.includes(artworkId);
    const action = isFav ? 'unfavorite' : 'favorite';

    try {
      const res = await fetch('/api/auth/profile/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.email}`,
        },
        body: JSON.stringify({ action, artworkId }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering
      ? { email: authEmail, firstName: authFirstName, lastName: authLastName }
      : { email: authEmail };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const userProfile = await res.json();
        setCurrentUser(userProfile);
        setIsAuthModalOpen(false);
        setAuthError('');
      } else {
        const errData = await res.json();
        setAuthError(errData.error || 'Authentication failure.');
      }
    } catch (err) {
      setAuthError('Connection failed.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f8] flex flex-col justify-between font-sans selection:bg-violet-600/10 selection:text-violet-600">
      
      {/* Dynamic Header Navbar (Aesthetic, Pixel-Perfect layout) */}
      <header className="sticky top-0 z-40 bg-[#fbf9f8]/90 glass-nav border-b border-[#121212]/5 px-5 md:px-10 h-20 flex justify-between items-center transition-all">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('gallery')} 
          className="cursor-pointer font-serif text-2xl font-bold tracking-[0.25em] uppercase text-[#121212] select-none hover:opacity-80 transition-opacity"
        >
          CURATED.
        </div>

        {/* Navigation Middle Links */}
        <nav className="hidden md:flex gap-10 items-center">
          <button
            onClick={() => setActiveView('gallery')}
            className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors relative py-1 ${
              activeView === 'gallery' ? 'text-violet-600' : 'text-[#121212] hover:text-violet-600'
            }`}
          >
            Visions
            {activeView === 'gallery' && (
              <motion.div layoutId="nav-pill" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>

          <button
            onClick={() => setActiveView('market')}
            className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors relative py-1 ${
              activeView === 'market' ? 'text-violet-600' : 'text-[#121212] hover:text-violet-600'
            }`}
          >
            Collection
            {activeView === 'market' && (
              <motion.div layoutId="nav-pill" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex gap-6 items-center">
          {/* Cart Icon & Count */}
          <button
            onClick={() => setActiveView('checkout')}
            className="relative p-2 text-[#121212] hover:text-violet-600 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-violet-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center animate-bounce shadow-sm">
                {cart.length}
              </span>
            )}
          </button>

          {/* User Profile Avatar / Login trigger */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('profile')}
                className={`flex items-center gap-2 border p-1 rounded-full border-[#121212]/10 hover:border-violet-600 transition-colors ${
                  activeView === 'profile' ? 'border-violet-600 ring-1 ring-violet-600' : ''
                }`}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.firstName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              </button>
              <button
                onClick={handleLogout}
                className="hidden lg:inline text-[9px] font-bold uppercase tracking-widest text-[#5e5e5b] hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsRegistering(false);
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 bg-[#121212] hover:bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95"
            >
              Access Identity
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Views with fade transition animations */}
      <main className="flex-1 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeView === 'gallery' && (
              <GalleryView
                artworks={artworks}
                onNavigate={setActiveView}
                onSelectArtwork={setSelectedArtwork}
                onAddToCart={handleAddToCart}
              />
            )}

            {activeView === 'market' && (
              <MarketView
                artworks={artworks}
                onSelectArtwork={setSelectedArtwork}
                onNavigate={setActiveView}
                onAddToCart={handleAddToCart}
              />
            )}

            {activeView === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                artworks={artworks}
                orders={orders}
                onSelectArtwork={setSelectedArtwork}
                onRefreshArtworks={fetchArtworks}
                onUpdateUser={setCurrentUser}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'checkout' && (
              <CheckoutView
                cart={cart}
                currentUser={currentUser}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onSubmitOrder={async () => {
                  await fetchOrders();
                  await fetchArtworks();
                }}
                onNavigate={setActiveView}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Aesthetic Footer Block */}
      <footer className="bg-white border-t border-[#121212]/5 py-12 px-5 md:px-10 text-center space-y-4">
        <div className="font-serif text-lg font-bold tracking-[0.2em] text-[#121212] uppercase">
          CURATED.
        </div>
        <p className="text-xs text-[#5e5e5b] max-w-md mx-auto leading-relaxed">
          The Sovereign digital gallery ledger. All transactions verified via cryptographic hashing. © 2026 CURATED COLLECTIVE. All sovereign rights reserved.
        </p>
      </footer>

      {/* Interactive Detail View Modal overlay */}
      <ArtworkModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onAddToCart={handleAddToCart}
        currentUser={currentUser}
        onToggleFavorite={handleToggleFavorite}
        cart={cart}
      />

      {/* SECURED USER IDENTITY AUTHENTICATION MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="fixed inset-0 bg-[#121212]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#fbf9f8] w-full max-w-md p-8 rounded-xs border border-[#121212]/10 shadow-2xl z-10 space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="font-serif text-2xl font-bold text-[#121212]">
                  {isRegistering ? 'Register Sovereign Profile' : 'Access Your Profile'}
                </h3>
                <p className="text-[10px] font-bold text-[#5e5e5b] uppercase tracking-widest">
                  Secure curation validation
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs text-center uppercase tracking-wide">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                    Your Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="collector@example.com"
                    className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3.5 focus:border-violet-600 text-xs font-semibold focus:ring-0 transition-all"
                  />
                </div>

                {isRegistering && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                        First Name
                      </label>
                      <input
                        required
                        type="text"
                        value={authFirstName}
                        onChange={(e) => setAuthFirstName(e.target.value)}
                        placeholder="Avantika"
                        className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-violet-600 text-xs font-semibold focus:ring-0 transition-all uppercase tracking-wider"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                        Last Name
                      </label>
                      <input
                        required
                        type="text"
                        value={authLastName}
                        onChange={(e) => setAuthLastName(e.target.value)}
                        placeholder="Sharma"
                        className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-violet-600 text-xs font-semibold focus:ring-0 transition-all uppercase tracking-wider"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-[#121212] hover:bg-violet-600 text-[#fbf9f8] text-xs font-bold uppercase tracking-widest active:scale-95 transition-all shadow-md"
                >
                  {isRegistering ? 'CREATE IDENTITY' : 'VALIDATE IDENTITY'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setIsRegistering(!isRegistering);
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-violet-600 hover:opacity-80 transition-opacity border-b border-violet-600 pb-0.5"
                >
                  {isRegistering ? 'Already registered? Login instead' : 'New Collector? Create Sovereign profile'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
