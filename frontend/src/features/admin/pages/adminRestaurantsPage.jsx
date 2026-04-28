import { useEffect, useState } from "react";
import api from "../../../api/api";

// ── HELPERS ───────────────────────────────────────────────────
const statusCls = {
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  disabled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const StatusPill = ({ isActive }) => {
  const status = isActive ? "active" : "disabled";
  const label = isActive ? "Active" : "Disabled";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCls[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? "bg-green-400" : "bg-red-400"}`} />
      {label}
    </span>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold tracking-tight text-zinc-100">{value}</div>
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}>
      {icon}
    </div>
  </div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [openRestaurant, setOpenRestaurant] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get("/admin/restaurants/");
      setRestaurants(res.data || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── DERIVED STATE ───────────────────────────────────────────
  const filteredRestaurants = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone?.includes(searchQuery)
  );

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.is_active).length;
  const totalItems = restaurants.reduce((acc, r) => 
    acc + (r.categories?.reduce((catAcc, cat) => catAcc + (cat.items?.length || 0), 0) || 0), 0
  );

  // ── RENDER ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-500 font-sans text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Loading Restaurants...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 font-sans text-zinc-200">
      
      {/* ── HEADER & STATS ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 mb-6">Restaurant Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            label="Total Restaurants" 
            value={totalRestaurants} 
            icon="🍽️" 
            color="bg-orange-500/10 text-orange-400" 
          />
          <StatCard 
            label="Active Accounts" 
            value={activeRestaurants} 
            icon="⚡" 
            color="bg-green-500/10 text-green-400" 
          />
          <StatCard 
            label="Total Menu Items" 
            value={totalItems} 
            icon="📋" 
            color="bg-violet-500/10 text-violet-400" 
          />
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-2">
          <div className="flex items-center w-full max-w-md px-3">
            <span className="text-zinc-500 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search by name, owner, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none py-2"
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-3 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── RESTAURANT LIST ── */}
      <div className="space-y-4">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 border border-zinc-800 border-dashed rounded-xl text-zinc-500 text-sm">
            No restaurants found matching "{searchQuery}"
          </div>
        ) : (
          filteredRestaurants.map((restaurant) => {
            const isRestOpen = openRestaurant === restaurant.id;
            const menuCount = restaurant.categories?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0;

            return (
              <div 
                key={restaurant.id} 
                className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 ${isRestOpen ? "shadow-lg shadow-black/50 border-zinc-700" : "hover:border-zinc-700"}`}
              >
                {/* 🔹 RESTAURANT HEADER */}
                <div
                  onClick={() => {
                    setOpenRestaurant(isRestOpen ? null : restaurant.id);
                    setOpenCategory(null); // Close categories when changing restaurant
                  }}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg font-bold text-orange-400 border border-zinc-700">
                      {restaurant.name ? restaurant.name[0].toUpperCase() : "R"}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                        {restaurant.name}
                        <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                          {menuCount} items
                        </span>
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">👤 {restaurant.owner}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="flex items-center gap-1">📞 {restaurant.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusPill isActive={restaurant.is_active} />
                    <div className={`text-zinc-500 transition-transform duration-300 ${isRestOpen ? "rotate-180" : ""}`}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* 🔹 CATEGORIES & MENU ITEMS (EXPANDED) */}
                <div className={`transition-all duration-300 ease-in-out ${isRestOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                  <div className="p-5 border-t border-zinc-800 bg-zinc-950/30 space-y-3">
                    
                    {(!restaurant.categories || restaurant.categories.length === 0) ? (
                      <p className="text-xs text-zinc-500 text-center py-4">No menu categories found.</p>
                    ) : (
                      restaurant.categories.map((cat) => {
                        const isCatOpen = openCategory === cat.id;

                        return (
                          <div key={cat.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                            {/* CATEGORY HEADER */}
                            <div
                              onClick={() => setOpenCategory(isCatOpen ? null : cat.id)}
                              className="flex justify-between items-center p-3.5 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-zinc-200">{cat.name}</h3>
                                <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full">
                                  {cat.items?.length || 0}
                                </span>
                              </div>
                              <span className={`text-xs text-zinc-600 font-mono transition-transform duration-200 ${isCatOpen ? "rotate-90" : ""}`}>
                                ▶
                              </span>
                            </div>

                            {/* 🔹 MENU ITEMS */}
                            <div className={`transition-all duration-300 ${isCatOpen ? "max-h-[1000px] opacity-100 pb-3 px-3" : "max-h-0 opacity-0 overflow-hidden"}`}>
                              <div className="space-y-2 pt-1">
                                {(!cat.items || cat.items.length === 0) ? (
                                  <p className="text-xs text-zinc-500 px-2">No items in this category.</p>
                                ) : (
                                  cat.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between items-start bg-zinc-950/50 border border-zinc-800/60 p-3 rounded-md transition-hover hover:border-zinc-700"
                                    >
                                      <div className="pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className={`w-2 h-2 rounded-sm border ${item.is_veg ? "border-green-500 bg-green-500/20" : "border-red-500 bg-red-500/20"}`} title={item.is_veg ? "Vegetarian" : "Non-Vegetarian"} />
                                          <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                                        </div>
                                        {item.description && (
                                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed pl-4">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>

                                      <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-mono font-semibold text-zinc-100">
                                          ₹{item.price}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}