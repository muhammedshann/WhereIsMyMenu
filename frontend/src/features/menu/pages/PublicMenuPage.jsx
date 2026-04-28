import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import api from '../../../api/api';

/* ─── ANIMATION VARIANTS (Fluid, slightly slower, re-triggerable) ───────── */
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8, // Slowed down from 0.5
      ease: [0.22, 1, 0.36, 1], // Fluid easing
      staggerChildren: 0.1 // More noticeable stagger between items
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

/* ─── ICONS ────────────────────────────────────────────────────── */
const Icons = {
  Back: () => <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"><polyline points="15 18 9 12 15 6" /></svg>,
  Search: () => <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Close: () => <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Cart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  Pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f95b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Veg: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M8 12l3 3 5-5" /></svg>,
  NonVeg: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Instagram: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
  Facebook: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
  Map: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
};

/* ─── SUB-COMPONENTS ───────────────────────────────────────────── */

function TopNav({ restaurantName, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  return (
    <nav className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 backdrop-blur-sm ${isSearchOpen ? 'bg-[#0f0f11]/95' : 'bg-gradient-to-b from-[#0f0f11]/90 to-transparent'}`}>
      {isSearchOpen ? (
        <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-white hover:text-gray-300 transition-colors"><Icons.Back /></button>
          <div className="flex-1 relative">
            <input type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search dishes..." className="w-full bg-[#1a1a1c] text-white text-sm rounded-full pl-4 pr-10 py-2.5 outline-none border border-white/10 focus:border-[#f95b2c]/50 transition-colors placeholder:text-gray-500" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"><Icons.Close /></button>}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300 transition-colors"><Icons.Back /></button>
            <span className="text-[16px] font-bold tracking-wide text-white truncate max-w-[180px] md:max-w-[300px]">{restaurantName || 'Menu'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSearchOpen(true)} className="text-gray-300 hover:text-white transition-colors"><Icons.Search /></button>
          </div>
        </>
      )}
    </nav>
  );
}

function HeroHeader({ restaurant, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  if (!restaurant) return null;

  return (
    <header className="relative w-full h-[360px] md:h-[400px] overflow-hidden">
      <TopNav restaurantName={restaurant.name} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <motion.div style={{ y, opacity }} className="absolute inset-0 bg-cover bg-top md:bg-center bg-no-repeat" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${restaurant.coverImage || '/api/placeholder/1920/600'})` }} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/70 to-transparent" />

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="absolute bottom-0 left-0 w-full px-6 pb-6 max-w-4xl mx-auto left-1/2 -translate-x-1/2 text-left">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-1 text-white drop-shadow-md">{restaurant.name}</h1>
        {restaurant.tagline && <p className="text-base md:text-lg text-[#efc490] font-medium mb-3">{restaurant.tagline}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-gray-300 font-medium">
          {restaurant.address && <span className="flex items-center gap-1.5"><Icons.Pin /> {restaurant.address}</span>}
          {restaurant.openingTime && restaurant.closingTime && <span className="flex items-center gap-1.5"><Icons.Clock /> {restaurant.openingTime} - {restaurant.closingTime}</span>}
        </div>
      </motion.div>
    </header>
  );
}

function CategoryTabs({ categories, activeTab, scrollTo }) {
  return (
    <div className="sticky top-[68px] z-40 bg-[#0f0f11]/80 backdrop-blur-xl border-b border-white/5 pb-3 pt-3 shadow-sm">
      <div className="flex overflow-x-auto gap-2.5 px-6 max-w-4xl mx-auto [&::-webkit-scrollbar]:hidden relative">
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button key={cat.id} id={`tab-${cat.id}`} onClick={() => scrollTo(cat.id)} className={`relative whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#212124]'}`}>
              {isActive && (
                <motion.div layoutId="activeCategoryTab" className="absolute inset-0 bg-[#f95b2c] rounded-full -z-10 shadow-[0_2px_10px_rgba(249,91,44,0.3)]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterBar({ vegFilter, setVegFilter }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setVegFilter((v) => (v === 'veg' ? null : 'veg'))} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border transition-colors ${vegFilter === 'veg' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-[#1a1a1c] border-white/10 text-gray-400 hover:bg-[#212124]'}`}>
        <Icons.Veg /> VEG ONLY
      </motion.button>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setVegFilter((v) => (v === 'nonveg' ? null : 'nonveg'))} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border transition-colors ${vegFilter === 'nonveg' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-[#1a1a1c] border-white/10 text-gray-400 hover:bg-[#212124]'}`}>
        <Icons.NonVeg /> NON-VEG
      </motion.button>
    </div>
  );
}

function MenuItem({ item }) {
  const price = item.price ? String(item.price).replace(/[^0-9.]/g, '') : null;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.01, backgroundColor: "#1e1e22" }} whileTap={{ scale: 0.99 }} className="bg-[#18181b] border border-white/5 rounded-2xl p-3 flex gap-4 hover:border-white/10 transition-colors group cursor-pointer shadow-md shadow-black/20">
      <div className="w-[85px] h-[85px] flex-shrink-0 rounded-xl overflow-hidden bg-[#212124]">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🍽</div>
        )}
      </div>

      <div className="flex flex-col flex-1 py-0.5">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-[15px] font-medium text-gray-100 leading-tight">{item.name}</h3>
          {price && <span className="text-[15px] font-semibold text-[#efc490] flex-shrink-0">${price}</span>}
        </div>
        {item.description && <p className="text-[12px] text-gray-400 line-clamp-2 leading-snug mb-auto">{item.description}</p>}
        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-gray-500 uppercase">
          {item.veg ? <><Icons.Veg /> VEG</> : <><Icons.NonVeg /> NON-VEG</>}
        </div>
      </div>
    </motion.div>
  );
}

function MenuSection({ category, vegFilter, searchQuery, isFirst }) {
  const isVisible = (item) => {
    if (vegFilter === 'veg' && item.veg !== true) return false;
    if (vegFilter === 'nonveg' && item.veg === true) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.name?.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const items = category.items.filter(isVisible);
  if (items.length === 0) return null;

  return (
    <motion.section
      id={`cat-${category.id}`}
      data-catid={category.id}
      initial={isFirst ? "visible" : "hidden"}
      // NEW: once: false enables the scroll-back effect. 
      // amount: 0.1 triggers animation early so there are no empty gaps!
      whileInView={isFirst ? undefined : "visible"}
      viewport={isFirst ? undefined : { once: false, amount: 0.1, margin: "0px 0px -5% 0px" }}
      variants={sectionVariants}
      className="mb-10 scroll-mt-[130px]"
    >
      <div className="flex items-center gap-4 mb-4 px-2">
        <h2 className="text-[20px] font-bold text-white tracking-tight">{category.name}</h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </motion.section>
  );
}

/* ─── COMPACT FOOTER COMPONENT ─────────────────────────────────── */

function Footer({ restaurant }) {
  if (!restaurant) return null;

  return (
    <footer className="bg-[#111113] border-t border-white/5 py-8 mt-4">
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-8 md:gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">{restaurant.name}</h3>
          {restaurant.description && <p className="text-[13px] text-gray-400 leading-relaxed mb-4 max-w-sm line-clamp-3">{restaurant.description}</p>}
          <div className="flex items-center gap-3">
            {restaurant.instagram && <a href={restaurant.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 bg-[#1c1c1e] rounded-full hover:bg-[#f95b2c]"><Icons.Instagram /></a>}
            {restaurant.facebook && <a href={restaurant.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 bg-[#1c1c1e] rounded-full hover:bg-[#f95b2c]"><Icons.Facebook /></a>}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-3">Contact</h4>
            <ul className="space-y-2 text-[13px] text-gray-400">
              {restaurant.phone && <li><a href={`tel:${restaurant.phone}`} className="flex items-start gap-2 hover:text-white transition-colors"><span className="text-[#f95b2c] mt-0.5"><Icons.Phone /></span>{restaurant.phone}</a></li>}
              {restaurant.email && <li><a href={`mailto:${restaurant.email}`} className="flex items-start gap-2 hover:text-white transition-colors truncate"><span className="text-[#f95b2c] mt-0.5"><Icons.Mail /></span>{restaurant.email}</a></li>}
              {restaurant.address && <li><a href={restaurant.mapsLink || '#'} target="_blank" rel="noreferrer" className="flex items-start gap-2 hover:text-white transition-colors"><span className="text-[#f95b2c] mt-0.5"><Icons.Map /></span>Map</a></li>}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-3">Hours</h4>
            {restaurant.openingTime && restaurant.closingTime ? (
              <div className="text-[13px] text-gray-400 space-y-1">
                <p><span className="text-white font-medium">Open:</span> {restaurant.openingTime}</p>
                <p><span className="text-white font-medium">Close:</span> {restaurant.closingTime}</p>
              </div>
            ) : <span className="text-[13px] text-gray-400">Not specified</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between gap-2 text-[11px] text-gray-600">
        <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
        <p>Powered by Digital Menu</p>
      </div>
    </footer>
  );
}

/* ─── MAIN PAGE COMPONENT ──────────────────────────────────────── */

export default function RestaurantMenu() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(null);
  const [vegFilter, setVegFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    api.get(`/restaurant/m/${slug}/`)
      .then(res => {
        setData(res.data);
        if (res.data.categories?.length) setActiveTab(res.data.categories[0].id);
      })
      .catch(() => setError('Could not load this menu right now.'))
      .finally(() => setLoading(false));
  }, [slug]);

  /* Scroll Spy */
  useEffect(() => {
    if (!data || searchQuery) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = Number(e.target.dataset.catid);
            setActiveTab(id);
            document.getElementById(`tab-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        });
      },
      { rootMargin: '-20% 0px -75% 0px' }
    );

    data.categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data, searchQuery]);

  const scrollTo = useCallback((id) => {
    setActiveTab(id);
    const el = document.getElementById(`cat-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 140;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0f0f11] animate-pulse" />;

  if (error) return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center gap-3">
      <span className="text-4xl opacity-30">🍽</span>
      <p className="text-sm font-medium text-gray-500">{error}</p>
    </div>
  );

  const { restaurant, categories } = data;

  const hasVisibleItems = categories.some(cat =>
    cat.items.some(item => {
      if (vegFilter === 'veg' && item.veg !== true) return false;
      if (vegFilter === 'nonveg' && item.veg === true) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.name?.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
  );

  return (
    <div className="min-h-screen bg-[#0f0f11] font-sans text-white antialiased selection:bg-[#f95b2c]/30 flex flex-col">
      <HeroHeader restaurant={restaurant} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {!restaurant.isSubscribed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
              <span className="text-4xl">🕰</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Currently Unavailable</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              This menu is currently not accessible. Please check back later or contact the restaurant directly.
            </p>
            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                Powered by WhereIsMyMenu
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {!isSearchOpen && <CategoryTabs categories={categories} activeTab={activeTab} scrollTo={scrollTo} />}

          <main className="flex-1">
            <FilterBar vegFilter={vegFilter} setVegFilter={setVegFilter} />

            <div className="max-w-4xl mx-auto px-6 pb-12 pt-2">
              {!hasVisibleItems ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <span className="text-4xl opacity-20 block mb-4">🔍</span>
                  <p className="text-gray-400 text-sm">No items found matching your criteria.</p>
                </motion.div>
              ) : (
                categories.map((cat, index) => (
                  <MenuSection
                    key={cat.id}
                    category={cat}
                    vegFilter={vegFilter}
                    searchQuery={searchQuery}
                    isFirst={index === 0}
                  />
                ))
              )}
            </div>
          </main>
        </>
      )}

      <Footer restaurant={restaurant} />
    </div>
  );
}

