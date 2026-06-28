import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork, UserProfile, Order } from '../types';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  artworks: Artwork[];
  orders: Order[];
  onSelectArtwork: (artwork: Artwork) => void;
  onRefreshArtworks: () => Promise<void>;
  onUpdateUser: (user: UserProfile) => void;
  onNavigate: (view: 'gallery' | 'market' | 'profile' | 'checkout') => void;
}

export default function ProfileView({
  currentUser,
  artworks,
  orders,
  onSelectArtwork,
  onRefreshArtworks,
  onUpdateUser,
  onNavigate,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'owned' | 'favorites' | 'orders'>('owned');
  const [isCMSOpen, setIsCMSOpen] = useState(false);
  const [isCuratorQuerying, setIsCuratorQuerying] = useState(false);
  const [curatorResponse, setCuratorResponse] = useState<{ curatorSpeech: string; recommendedArtworkIds: string[] } | null>(null);

  // CMS Form Fields
  const [cmsMode, setCmsMode] = useState<'create' | 'edit'>('create');
  const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artArtist, setArtArtist] = useState('');
  const [artPrice, setArtPrice] = useState('');
  const [artPriceUnit, setArtPriceUnit] = useState<'€' | '$' | 'ETH'>('€');
  const [artImageUrl, setArtImageUrl] = useState('');
  const [artCategory, setArtCategory] = useState<'sculpture' | 'painting' | 'digital' | 'photography' | 'mixed media'>('digital');
  const [artSeries, setArtSeries] = useState('');
  const [artDescription, setArtDescription] = useState('');
  const [artIsAvailable, setArtIsAvailable] = useState(true);
  const [artIsNewRelease, setArtIsNewRelease] = useState(false);

  // Fetch or fallback user info
  const user = currentUser || {
    uid: 'avantika-sharma',
    email: 'avantika@curated.art',
    firstName: 'Avantika',
    lastName: 'Sharma',
    followersCount: 12400,
    worksCount: 84,
    salesCount: 152,
    bio: 'Avantika Sharma is a contemporary artist shaping quiet, architectural compositions through digital and mixed-media practice. Her work explores material memory, spatial tension, and restrained emotion with a refined gallery sensibility.',
    ownedArtIds: ['art-10', 'art-11', 'art-12'],
    favoriteArtIds: ['art-13', 'art-14'],
    isVerified: true,
    avatarUrl: '/assets/profile-photo.jpeg',
  };

  const ownedArtworks = artworks.filter((a) => user.ownedArtIds.includes(a.id));
  const favoriteArtworks = artworks.filter((a) => user.favoriteArtIds.includes(a.id));
  const userOrders = orders.filter((o) => o.email.toLowerCase() === user.email.toLowerCase());

  // Consult the Virtual AI Curator
  const handleConsultCurator = async () => {
    setIsCuratorQuerying(true);
    setCuratorResponse(null);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.email}`,
        },
        body: JSON.stringify({
          userBio: user.bio,
          favoriteCategories: ['digital', 'sculpture'],
          cartItems: [],
          ownedArtTitles: ownedArtworks.map((a) => a.title),
        }),
      });
      const data = await response.json();
      setCuratorResponse(data);
    } catch (error) {
      console.error('Error fetching curator recommendations:', error);
    } finally {
      setIsCuratorQuerying(false);
    }
  };

  // Submit Artwork via CMS
  const handleCMSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: artTitle,
      artist: artArtist,
      price: Number(artPrice),
      priceUnit: artPriceUnit,
      imageUrl: artImageUrl,
      category: artCategory,
      series: artSeries,
      description: artDescription,
      isAvailable: artIsAvailable,
      isNewRelease: artIsNewRelease,
    };

    try {
      if (cmsMode === 'create') {
        const res = await fetch('/api/artworks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await onRefreshArtworks();
          resetCMSForm();
        }
      } else {
        const res = await fetch(`/api/artworks/${editingArtworkId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await onRefreshArtworks();
          resetCMSForm();
        }
      }
    } catch (err) {
      console.error('CMS update error:', err);
    }
  };

  const handleEditArtwork = (art: Artwork) => {
    setCmsMode('edit');
    setEditingArtworkId(art.id);
    setArtTitle(art.title);
    setArtArtist(art.artist);
    setArtPrice(art.price.toString());
    setArtPriceUnit(art.priceUnit);
    setArtImageUrl(art.imageUrl);
    setArtCategory(art.category);
    setArtSeries(art.series || '');
    setArtDescription(art.description || '');
    setArtIsAvailable(art.isAvailable);
    setArtIsNewRelease(art.isNewRelease || false);
    setIsCMSOpen(true);
  };

  const handleDeleteArtwork = async (artId: string) => {
    if (confirm('Are you absolutely sure you want to delete this masterpiece from the catalog?')) {
      try {
        const res = await fetch(`/api/artworks/${artId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await onRefreshArtworks();
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const resetCMSForm = () => {
    setCmsMode('create');
    setEditingArtworkId(null);
    setArtTitle('');
    setArtArtist('');
    setArtPrice('');
    setArtPriceUnit('€');
    setArtImageUrl('');
    setArtCategory('digital');
    setArtSeries('');
    setArtDescription('');
    setArtIsAvailable(true);
    setArtIsNewRelease(false);
    setIsCMSOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-12">
      {/* Profile Header section */}
      <section className="relative overflow-hidden bg-white border border-[#121212]/5 p-8 md:p-12 shadow-sm rounded-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar frame */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
            <div className="absolute inset-0 border border-[#121212]/15 rounded-full animate-pulse"></div>
            <img
              className="w-full h-full object-cover rounded-full border border-[#121212]/10"
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Profile Context */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <h2 className="font-serif text-3xl font-semibold text-[#121212]">
                {user.firstName} {user.lastName}
              </h2>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/10 text-violet-600 font-bold text-[9px] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[11px] fill-violet-600">verified</span> Verified Artist
                </span>
              )}
            </div>

            <p className="text-[#5e5e5b] text-sm md:text-base leading-relaxed max-w-2xl">{user.bio}</p>

            {/* Stats list */}
            <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4 border-t border-[#121212]/5">
              <div>
                <p className="text-xs font-bold text-[#5e5e5b] uppercase tracking-widest">Followers</p>
                <p className="text-xl font-semibold text-[#121212]">
                  {user.followersCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#5e5e5b] uppercase tracking-widest">Works Created</p>
                <p className="text-xl font-semibold text-[#121212]">{user.worksCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#5e5e5b] uppercase tracking-widest">Sovereign Sales</p>
                <p className="text-xl font-semibold text-[#121212]">{user.salesCount}</p>
              </div>
            </div>
          </div>

          {/* Interactive actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsCMSOpen(true)}
              className="px-6 py-3.5 bg-[#121212] hover:bg-[#5e5e5b] text-[#fbf9f8] font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">palette</span> curator admin Panel
            </button>
            <button
              onClick={handleConsultCurator}
              className="px-6 py-3.5 border border-[#121212]/10 bg-white hover:bg-[#5e5e5b]/5 text-[#121212] font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm text-violet-600">smart_toy</span> Ask AI Curator
            </button>
          </div>
        </div>
      </section>

      {/* AI Curator response block */}
      <AnimatePresence>
        {isCuratorQuerying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-violet-600/5 border border-violet-600/20 p-8 text-center space-y-4"
          >
            <span className="material-symbols-outlined text-3xl text-violet-600 animate-spin">
              hourglass_empty
            </span>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest animate-pulse">
              AI Virtual Curator analyzing your portfolio &amp; collection tastes...
            </p>
          </motion.div>
        )}

        {curatorResponse && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-violet-600/5 border border-violet-600/20 p-8 rounded-xs space-y-6"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-violet-600/10">
              <span className="material-symbols-outlined text-2xl text-violet-600">psychology</span>
              <div>
                <h4 className="font-serif text-lg text-[#121212] font-semibold">Virtual Curator Analysis</h4>
                <p className="text-[10px] text-violet-600 font-bold uppercase tracking-widest">
                  Powered by Gemini-3.5-Flash
                </p>
              </div>
            </div>

            <p className="text-sm italic text-[#5e5e5b] leading-relaxed">
              "{curatorResponse.curatorSpeech}"
            </p>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                Recommended Additions
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {artworks
                  .filter((a) => curatorResponse.recommendedArtworkIds.includes(a.id))
                  .slice(0, 3)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onSelectArtwork(rec)}
                      className="group cursor-pointer bg-white border border-[#121212]/5 p-3 flex gap-3 items-center hover:border-violet-600/40 transition-colors"
                    >
                      <img
                        className="w-12 h-12 object-cover"
                        src={rec.imageUrl}
                        alt={rec.title}
                      />
                      <div>
                        <h6 className="font-serif text-xs font-medium text-[#121212] group-hover:underline truncate w-36">
                          {rec.title}
                        </h6>
                        <p className="text-[10px] text-[#5e5e5b]">{rec.artist}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs controls */}
      <section className="space-y-6">
        <div className="flex border-b border-[#121212]/10 gap-8 justify-center md:justify-start">
          <button
            onClick={() => setActiveTab('owned')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'owned'
                ? 'border-[#121212] text-[#121212]'
                : 'border-transparent text-[#5e5e5b] hover:text-[#121212]'
            }`}
          >
            Owned Art ({ownedArtworks.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'favorites'
                ? 'border-[#121212] text-[#121212]'
                : 'border-transparent text-[#5e5e5b] hover:text-[#121212]'
            }`}
          >
            Favorites ({favoriteArtworks.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#121212] text-[#121212]'
                : 'border-transparent text-[#5e5e5b] hover:text-[#121212]'
            }`}
          >
            Order Tracking ({userOrders.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === 'owned' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedArtworks.length === 0 ? (
                <div className="col-span-full text-center py-16 space-y-3">
                  <span className="material-symbols-outlined text-4xl text-[#5e5e5b]/40">photo_library</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#5e5e5b]">
                    No masterpieces owned yet.
                  </p>
                  <button
                    onClick={() => onNavigate('market')}
                    className="text-xs font-bold uppercase text-violet-600 underline"
                  >
                    Go acquire some
                  </button>
                </div>
              ) : (
                ownedArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="group border border-[#121212]/5 p-4 bg-white cursor-pointer"
                    onClick={() => onSelectArtwork(art)}
                  >
                    <div className="aspect-square bg-[#efeded] mb-3 overflow-hidden border border-[#121212]/5">
                      <img
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        src={art.imageUrl}
                        alt={art.title}
                      />
                    </div>
                    <h4 className="font-serif text-base font-semibold text-[#121212] group-hover:underline">
                      {art.title}
                    </h4>
                    <p className="text-xs text-[#5e5e5b] uppercase tracking-wider">{art.artist}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteArtworks.length === 0 ? (
                <div className="col-span-full text-center py-16 space-y-3">
                  <span className="material-symbols-outlined text-4xl text-[#5e5e5b]/40">heart_broken</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#5e5e5b]">
                    No favorited masterpieces yet.
                  </p>
                  <button
                    onClick={() => onNavigate('market')}
                    className="text-xs font-bold uppercase text-violet-600 underline"
                  >
                    Explore marketplace
                  </button>
                </div>
              ) : (
                favoriteArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="group border border-[#121212]/5 p-4 bg-white cursor-pointer"
                    onClick={() => onSelectArtwork(art)}
                  >
                    <div className="aspect-square bg-[#efeded] mb-3 overflow-hidden border border-[#121212]/5">
                      <img
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        src={art.imageUrl}
                        alt={art.title}
                      />
                    </div>
                    <h4 className="font-serif text-base font-semibold text-[#121212] group-hover:underline">
                      {art.title}
                    </h4>
                    <p className="text-xs text-[#5e5e5b] uppercase tracking-wider">{art.artist}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {userOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3 border border-[#121212]/5 bg-white">
                  <span className="material-symbols-outlined text-4xl text-[#5e5e5b]/40">local_shipping</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#5e5e5b]">
                    No transaction order receipts found.
                  </p>
                </div>
              ) : (
                userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white border border-[#121212]/5 p-6 md:p-8 space-y-6 shadow-sm rounded-xs"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#121212]/5 pb-4">
                      <div>
                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">
                          Receipt ID
                        </p>
                        <h4 className="font-serif text-lg font-bold text-[#121212]">{ord.id}</h4>
                        <span className="text-[10px] font-mono text-[#5e5e5b] block truncate w-64 md:w-auto">
                          Tx Hash: {ord.transactionHash}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-[9px] uppercase tracking-widest border border-green-200">
                          <span className="material-symbols-outlined text-[10px]">check</span> {ord.status}
                        </span>
                        <p className="text-xs text-[#5e5e5b] mt-1">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {ord.items.map((it) => (
                        <div key={it.artworkId} className="flex gap-4 items-center">
                          <img
                            className="w-16 h-16 object-cover border border-[#121212]/5"
                            src={it.imageUrl}
                            alt={it.title}
                          />
                          <div>
                            <h5 className="font-serif text-sm font-semibold text-[#121212]">{it.title}</h5>
                            <p className="text-[10px] text-[#5e5e5b] uppercase tracking-wider">{it.artist}</p>
                            <p className="text-xs font-semibold text-[#121212] mt-0.5">
                              {it.priceUnit}
                              {it.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center bg-[#efeded]/40 p-4 border-t border-[#121212]/5 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[#5e5e5b]">
                        Sovereign Total
                      </span>
                      <span className="font-serif text-base font-bold text-[#121212]">
                        {ord.items[0]?.priceUnit || '$'}
                        {ord.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Curator CMS Admin Panel Modal */}
      <AnimatePresence>
        {isCMSOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={resetCMSForm}
              className="fixed inset-0 bg-[#121212]"
            />

            {/* CMS Form Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#fbf9f8] w-full max-w-4xl rounded-xs overflow-hidden border border-[#121212]/10 shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-white border-b border-[#121212]/5 flex justify-between items-center">
                <h3 className="font-serif text-xl font-bold text-[#121212] flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-600">tune</span>
                  {cmsMode === 'create' ? 'Curate New Masterpiece' : 'Modify Existing Masterpiece'}
                </h3>
                <button
                  onClick={resetCMSForm}
                  className="p-1.5 hover:bg-[#121212]/5 rounded-full transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-md">close</span>
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleCMSSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Curator Art Selection for Edit */}
                {cmsMode === 'create' && (
                  <div className="bg-[#efeded]/40 p-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                      Curator Quick Action: Edit Existing Instead?
                    </p>
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {artworks.slice(0, 8).map((art) => (
                        <button
                          type="button"
                          key={art.id}
                          onClick={() => handleEditArtwork(art)}
                          className="px-3 py-1.5 bg-white border border-[#121212]/10 hover:border-violet-600 hover:text-violet-600 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all"
                        >
                          EDIT: {art.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Artwork Title *
                    </label>
                    <input
                      required
                      type="text"
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="e.g. Celestial Echoes II"
                      className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold uppercase tracking-wider focus:ring-0 transition-all"
                    />
                  </div>

                  {/* Artist */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Artist Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={artArtist}
                      onChange={(e) => setArtArtist(e.target.value)}
                      placeholder="e.g. Julian Arthe"
                      className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold uppercase tracking-wider focus:ring-0 transition-all"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Price Amount *
                    </label>
                    <input
                      required
                      type="number"
                      value={artPrice}
                      onChange={(e) => setArtPrice(e.target.value)}
                      placeholder="e.g. 4200"
                      className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold uppercase tracking-wider focus:ring-0 transition-all"
                    />
                  </div>

                  {/* Currency Unit */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Currency Unit
                    </label>
                    <select
                      value={artPriceUnit}
                      onChange={(e) => setArtPriceUnit(e.target.value as any)}
                      className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold uppercase tracking-wider focus:ring-0 transition-all"
                    >
                      <option value="€">€ (Euros)</option>
                      <option value="$">$ (USD)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                    </select>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Masterpiece Image URL *
                    </label>
                    <input
                      required
                      type="text"
                      value={artImageUrl}
                      onChange={(e) => setArtImageUrl(e.target.value)}
                      placeholder="URL of high quality preview image"
                      className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold focus:ring-0 transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Category Medium
                    </label>
                    <select
                      value={artCategory}
                      onChange={(e) => setArtCategory(e.target.value as any)}
                      className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold uppercase tracking-wider focus:ring-0 transition-all"
                    >
                      <option value="sculpture">Sculpture</option>
                      <option value="painting">Painting</option>
                      <option value="digital">Digital</option>
                      <option value="photography">Photography</option>
                      <option value="mixed media">Mixed Media</option>
                    </select>
                  </div>

                  {/* Series */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Exhibition Series (Optional)
                    </label>
                    <input
                      type="text"
                      value={artSeries}
                      onChange={(e) => setArtSeries(e.target.value)}
                      placeholder="e.g. Structures / The Void"
                      className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold uppercase tracking-wider focus:ring-0 transition-all"
                    />
                  </div>

                  {/* Options */}
                  <div className="flex gap-6 items-center pt-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#121212] select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={artIsAvailable}
                        onChange={(e) => setArtIsAvailable(e.target.checked)}
                        className="rounded-xs border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      AVAILABLE FOR ACQUISITION
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#121212] select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={artIsNewRelease}
                        onChange={(e) => setArtIsNewRelease(e.target.checked)}
                        className="rounded-xs border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      NEW RELEASE BADGE
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                    Detailed Editorial Critique Description *
                  </label>
                  <textarea
                    required
                    value={artDescription}
                    onChange={(e) => setArtDescription(e.target.value)}
                    rows={4}
                    placeholder="Provide a deep museum-level editorial explanation for this piece."
                    className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3 focus:border-[#121212] text-xs font-semibold focus:ring-0 transition-all"
                  />
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-[#121212]/10">
                  {cmsMode === 'edit' ? (
                    <button
                      type="button"
                      onClick={() => editingArtworkId && handleDeleteArtwork(editingArtworkId)}
                      className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      DELETE MASTERPIECE
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetCMSForm}
                      className="px-6 py-3.5 border border-[#121212]/10 hover:bg-[#121212]/5 text-[#121212] font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3.5 bg-[#121212] hover:bg-[#5e5e5b] text-[#fbf9f8] font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      {cmsMode === 'create' ? 'PUBLISH Masterpiece' : 'SAVE CHANGES'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
