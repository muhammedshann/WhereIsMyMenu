import { useEffect, useState } from "react";
import api from "../../../api/api";

// ── HELPERS ───────────────────────────────────────────────────
const statusConfig = {
  success: { cls: "bg-green-500/10 text-green-400 border-green-500/20", dot: "bg-green-400", label: "Success" },
  pending: { cls: "bg-amber-400/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400 animate-pulse", label: "Pending Review" },
  failed:  { cls: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400", label: "Failed" },
};

const StatusPill = ({ status }) => {
  const conf = statusConfig[status?.toLowerCase()] || { cls: "bg-zinc-800 text-zinc-400 border-zinc-700", dot: "bg-zinc-500", label: status || "Unknown" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${conf.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${conf.dot}`} />
      {conf.label}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon, accentClass }) => (
  <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-2 overflow-hidden group">
    <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentClass} transition-opacity duration-300 opacity-70 group-hover:opacity-100`} />
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
      <span className="text-xl opacity-80">{icon}</span>
    </div>
    <div>
      <div className="text-3xl font-bold tracking-tight text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-400 mt-1">{sub}</div>}
    </div>
  </div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [timeRange, setTimeRange] = useState("monthly"); // Default to monthly

  useEffect(() => {
    fetchTransactions(true);
  }, []);

  const fetchTransactions = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.get("/admin/transactions/", {
        params: {
          search,
          status,
          timeframe: timeRange, // Backend should filter by 'weekly', 'monthly', 'yearly', or 'all'
        },
      });

      setTransactions(res.data || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Prevent default form submission to allow "Enter" key searching
  const handleApply = (e) => {
    e?.preventDefault();
    fetchTransactions();
  };

  // ── DERIVED METRICS ─────────────────────────────────────────
  const successfulTxs = transactions.filter((t) => t.status === "success");
  const reviewTxs = transactions.filter((t) => t.status === "failed" || t.status === "pending");
  
  const totalRevenue = successfulTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const formattedRevenue = totalRevenue >= 100000 
    ? `₹${(totalRevenue / 100000).toFixed(2)}L` 
    : `₹${totalRevenue.toLocaleString("en-IN")}`;
    
  const successRate = transactions.length > 0 
    ? Math.round((successfulTxs.length / transactions.length) * 100) 
    : 0;

  // ── RENDER ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-500 font-sans text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Loading Transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 font-sans text-zinc-200">

      {/* ── HEADER & STATS ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Transaction History</h1>
          {isRefreshing && <span className="text-xs text-orange-400 animate-pulse">Syncing...</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            label="Revenue (Filtered)" 
            value={formattedRevenue} 
            sub={`${successfulTxs.length} successful payments`} 
            icon="💰" 
            accentClass="bg-green-500" 
          />
          <StatCard 
            label="Volume" 
            value={transactions.length} 
            sub={`For selected ${timeRange}`} 
            icon="📊" 
            accentClass="bg-cyan-500" 
          />
          <StatCard 
            label="Success Rate" 
            value={`${successRate}%`} 
            sub="Completion percentage" 
            icon="⚡" 
            accentClass="bg-violet-500" 
          />
          <StatCard 
            label="Action Required" 
            value={reviewTxs.length} 
            sub="Failed or pending review" 
            icon="⚠️" 
            accentClass={reviewTxs.length > 0 ? "bg-red-500" : "bg-zinc-700"} 
          />
        </div>
      </div>

      {/* ── FILTERS BAR ── */}
      <form onSubmit={handleApply} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            placeholder="Search by user or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500/50 cursor-pointer w-full md:w-36 appearance-none"
          >
            <option value="all">All Time</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500/50 cursor-pointer w-full md:w-36 appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors shadow-lg shadow-orange-500/20 whitespace-nowrap"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr>
              {["User / Restaurant", "Plan", "Amount", "Date", "Status"].map((h) => (
                <th key={h} className="bg-zinc-950/50 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold px-6 py-4 border-b border-zinc-800">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 text-sm">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                // Highlight row if it needs review
                const needsReview = t.status === "failed" || t.status === "pending";
                const rowClass = needsReview 
                  ? "bg-red-500/[0.02] hover:bg-red-500/[0.05]" 
                  : "hover:bg-zinc-800/40";

                return (
                  <tr key={t.id} className={`transition-colors duration-150 ${rowClass}`}>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                          {t.user ? t.user[0].toUpperCase() : "?"}
                        </div>
                        <span className="text-sm font-medium text-zinc-200">{t.user || "Unknown User"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {t.plan || <span className="text-zinc-600 italic">N/A</span>}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-semibold text-zinc-200">
                        ₹{Number(t.amount).toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(t.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-6 py-4">
                      <StatusPill status={t.status} />
                    </td>
                    
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}