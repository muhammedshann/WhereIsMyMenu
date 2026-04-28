import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { adminDashboard } from "../store/adminSlice";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── HELPERS ───────────────────────────────────────────────────
const fmtRevenue = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;

const statusCls = {
  active: "bg-green-500/10 text-green-400",
  success: "bg-green-500/10 text-green-400",
  expired: "bg-red-500/10 text-red-400",
  failed: "bg-red-500/10 text-red-400",
  pending: "bg-amber-400/10 text-amber-400",
  inactive: "bg-zinc-500/10 text-zinc-400",
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCls[status?.toLowerCase()] || "bg-zinc-700 text-zinc-300"}`}>
    {status || "Unknown"}
  </span>
);

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color || "#e4e4e7" }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── COMPONENTS ────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, accentClass, delay }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 overflow-hidden transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${accentClass}`} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-zinc-100">{value}</div>
        <div className="text-xs text-green-400 font-semibold mt-1">{sub}</div>
      </div>
    </div>
  );
};

const Panel = ({ title, sub, right, children, className = "" }) => (
  <div className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
      <div>
        <div className="text-sm font-bold tracking-tight text-zinc-100">{title}</div>
        {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
    {children}
  </div>
);

const LegDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
    {label}
  </div>
);

// ── MAIN DASHBOARD ────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [txFilter, setTxFilter] = useState("All");
  const [mounted, setMounted] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dispatch(adminDashboard()).unwrap();
        console.log(result);
        setData(result);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  // Safe defaults to prevent crashing if data is missing or malformed
  const revenueData = data?.revenueData || [];
  const signupData = data?.signupData || [];
  const subStatusData = data?.subStatusData || [];
  const vegData = data?.vegData || [];
  const planData = data?.planData || [];
  const transactions = data?.transactions || [];
  const stats = data?.stats || {};
  const summary = data?.summary || {};

  const filteredTx = txFilter === "All"
    ? transactions
    : transactions.filter(t => t?.status?.toLowerCase() === txFilter.toLowerCase());

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center text-zinc-500 font-sans text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-200 font-sans text-sm">
      <main className={`w-full flex flex-col gap-5 px-7 py-7 pb-12 overflow-x-hidden transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

        {/* Topbar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Admin Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-0.5">WhereIsMyMenu · All restaurants</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
            <div className="w-8 h-8 rounded-full bg-violet-600 grid place-items-center text-xs font-bold text-white">SA</div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3.5">
          <StatCard label="Restaurants" value={stats?.restaurants || "0"} sub={stats?.restaurantsSub || "-"} icon="🍽️" accentClass="bg-orange-500" delay={0} />
          <StatCard label="Active Subs" value={stats?.activeSubs || "0"} sub={stats?.activeSubsSub || "-"} icon="⚡" accentClass="bg-violet-500" delay={80} />
          <StatCard label="MRR" value={stats?.mrr || "₹0"} sub={stats?.mrrSub || "-"} icon="💰" accentClass="bg-cyan-400" delay={160} />
          <StatCard label="Menu Items" value={stats?.menuItems || "0"} sub={stats?.menuItemsSub || "-"} icon="🥘" accentClass="bg-green-400" delay={240} />
        </div>

        {/* Revenue + Donut */}
        <div className="grid grid-cols-5 gap-4">
          <Panel className="col-span-3" title="Monthly Revenue" sub="Transaction revenue + subscription MRR"
            right={
              <div className="flex gap-3">
                <LegDot color="#f97316" label="Revenue" />
                <LegDot color="#8b5cf6" label="Subs" />
              </div>
            }
          >
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtRevenue} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<CustomTooltip formatter={fmtRevenue} />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#f97316" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="subs" name="Subs" fill="#8b5cf6" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel className="col-span-2" title="Subscription Status" sub="Across all restaurants">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={155}>
                <PieChart>
                  <Pie data={subStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={2}>
                    {subStatusData.map((d, i) => <Cell key={i} fill={d.color || "#52525b"} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2">
                {subStatusData.map((d) => {
                  const total = subStatusData.reduce((acc, curr) => acc + (curr.value || 0), 0);
                  const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
                  return (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color || "#52525b" }} />
                        {d.name}
                      </div>
                      <span className="font-bold text-zinc-200">{d.value} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>

        {/* Plans + Veg split (Adjusted to 2 columns) */}
        <div className="grid grid-cols-2 gap-4">
          <Panel title="Plans Breakdown" sub="By subscription plan">
            <div className="px-4 pt-2 pb-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={planData} layout="vertical" barSize={13}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Restaurants" radius={[0, 4, 4, 0]}>
                    {planData.map((d, i) => <Cell key={i} fill={d.color || "#52525b"} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Item Types" sub="Veg vs Non-Veg split">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={vegData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3}>
                    {vegData.map((d, i) => <Cell key={i} fill={d.color || "#52525b"} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-3">
                {vegData.map((d) => {
                  const total = vegData.reduce((acc, curr) => acc + (curr.value || 0), 0);
                  const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color || "#52525b" }} />
                      {d.name} {percentage}%
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>

        {/* Signups line chart */}
        <Panel title="Restaurant Signups" sub="New restaurants joined per month"
          right={
            <div className="flex gap-3">
              <LegDot color="#22d3ee" label="Signups" />
              <LegDot color="#8b5cf6" label="Activated" />
            </div>
          }
        >
          <div className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="signups" name="Signups" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="activated" name="Activated" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Transactions (Full Width) */}
        <Panel title="Recent Transactions" sub="Latest payment activity"
          right={
            <div className="flex gap-0.5 p-1 bg-zinc-800 rounded-lg">
              {["All", "Success", "Failed", "Pending"].map(f => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${txFilter === f ? "bg-zinc-900 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                >{f}</button>
              ))}
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Restaurant", "Plan", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold text-left px-4 py-2 border-b border-zinc-800">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTx.length > 0 ? filteredTx.map((tx, i) => (
                  <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md grid place-items-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: tx.color || "#52525b" }}>
                          {tx.restaurant ? tx.restaurant[0] : "?"}
                        </div>
                        <span className="text-xs text-zinc-200">{tx.restaurant}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-500">{tx.plan}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-zinc-200">{tx.amount}</td>
                    <td className="px-4 py-2.5"><StatusPill status={tx.status} /></td>
                    <td className="px-4 py-2.5 text-xs text-zinc-500">{tx.date}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-4 text-center text-xs text-zinc-500">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Summary Strip (Adjusted to 3 columns) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3">
            {[
              ["Total Users", summary?.totalUsers || "0"],
              ["Total Revenue", summary?.totalRevenue || "₹0"],
              ["Avg Items/Resto", summary?.avgItems || "0"],
            ].map(([k, v], i) => (
              <div key={k} className={`px-5 py-4 ${i < 2 ? "border-r border-zinc-800" : ""}`}>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">{k}</div>
                <div className="text-lg font-bold tracking-tight font-mono text-zinc-100">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-2">WhereIsMyMenu · Admin Dashboard ⚡</p>
      </main>
    </div>
  );
}