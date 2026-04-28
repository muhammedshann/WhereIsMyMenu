import { useNavigate, useLocation } from "react-router-dom";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { icon: "📊", label: "Dashboard", path: "/admin" },
      { icon: "📈", label: "Analytics", path: "/admin/analytics" },
    ],
  },
  {
    label: "Data",
    items: [
      { icon: "🍽️", label: "Restaurants", path: "/admin/restaurants" },
      { icon: "📋", label: "Menu Items", path: "/admin/menu-items" },
      { icon: "🗂️", label: "Categories", path: "/admin/categories" },
    ],
  },
  {
    label: "Revenue",
    items: [
      { icon: "💳", label: "Subscriptions", path: "/admin/subscriptions", badge: "12" },
      { icon: "💰", label: "Transactions", path: "/admin/transactions" },
      { icon: "📦", label: "Plans", path: "/admin/plans" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: "👤", label: "Users", path: "/admin/users" },
      { icon: "⚙️", label: "Settings", path: "/admin/settings" },
    ],
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`bg-gradient-to-b from-zinc-950 to-zinc-900 border-r border-zinc-800 flex flex-col h-screen transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>

      {/* LOGO */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-zinc-800 ${!sidebarOpen && "justify-center"}`}>
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
          ⚡
        </div>
        {sidebarOpen && (
          <span className="text-sm font-semibold text-white tracking-tight">
            WhereIsMyMenu
          </span>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">

            {/* SECTION TITLE */}
            {sidebarOpen && (
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 px-2">
                {section.label}
              </p>
            )}

            {/* ITEMS */}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
                    ${isActive
                      ? "bg-orange-500/20 text-orange-400 shadow-inner"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}
                    ${!sidebarOpen && "justify-center"}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>

                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>

                      {item.badge && (
                        <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* COLLAPSE */}
      <button
        onClick={() => setSidebarOpen(prev => !prev)}
        className={`border-t border-zinc-800 text-zinc-400 hover:text-white py-4 text-sm flex items-center gap-2 ${sidebarOpen ? "px-4" : "justify-center"}`}
      >
        <span className={`transition-transform ${sidebarOpen ? "" : "rotate-180"}`}>
          ◀
        </span>
        {sidebarOpen && "Collapse"}
      </button>
    </aside>
  );
}