import { useEffect, useState } from "react";
import api from "../../../api/api";

// ── HELPERS & ICONS ───────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const StatCard = ({ label, value, icon, colorClass }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold tracking-tight text-zinc-100">{value}</div>
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colorClass}`}>
      {icon}
    </div>
  </div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration_days: "",
    features: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/admin/plans/");
      setPlans(res.data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration_days) return;

    setIsSubmitting(true);
    try {
      // Split features by comma, trim whitespace, and remove empty strings
      const featuresArray = form.features
        .split(",")
        .map(f => f.trim())
        .filter(f => f.length > 0);

      await api.post("/admin/plans/", {
        ...form,
        features: featuresArray,
      });
      
      await fetchPlans();
      // Reset and close form
      setForm({ name: "", price: "", duration_days: "", features: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Error creating plan:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    
    setDeleteId(id);
    try {
      await api.delete(`/admin/plans/${id}/`);
      await fetchPlans();
    } catch (err) {
      console.error("Error deleting plan:", err);
    } finally {
      setDeleteId(null);
    }
  };

  // ── DERIVED METRICS ─────────────────────────────────────────
  const avgPrice = plans.length > 0 
    ? Math.round(plans.reduce((acc, p) => acc + Number(p.price || 0), 0) / plans.length) 
    : 0;

  // ── RENDER ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-500 font-sans text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Loading Subscription Plans...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 font-sans text-zinc-200">

      {/* ── HEADER & STATS ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Subscription Plans</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              showForm 
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" 
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
            }`}
          >
            {showForm ? "Cancel" : "+ Create New Plan"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Total Plans" 
            value={plans.length} 
            icon="📦" 
            colorClass="bg-violet-500/10 text-violet-400" 
          />
          <StatCard 
            label="Avg. Price" 
            value={`₹${avgPrice}`} 
            icon="💰" 
            colorClass="bg-green-500/10 text-green-400" 
          />
          <StatCard 
            label="Active Subscriptions" 
            value="—" 
            icon="⚡" 
            colorClass="bg-cyan-500/10 text-cyan-400" 
          />
        </div>
      </div>

      {/* ── CREATE FORM (COLLAPSIBLE) ── */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-zinc-100 mb-2">Plan Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">Plan Name</label>
              <input
                required
                placeholder="e.g. Pro Monthly"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">Price (₹)</label>
              <input
                required
                type="number"
                placeholder="e.g. 499"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">Duration (Days)</label>
              <input
                required
                type="number"
                placeholder="e.g. 30"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1.5">Features</label>
            <textarea
              required
              placeholder="Unlimited menus, QR code generation, Priority support (Separate by commas)"
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-orange-500/50 transition-colors min-h-[80px]"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? "Creating..." : "Save Plan"}
            </button>
          </div>
        </form>
      </div>

      {/* ── PLAN CARDS GRID ── */}
      {plans.length === 0 ? (
        <div className="text-center py-12 border border-zinc-800 border-dashed rounded-2xl text-zinc-500 text-sm">
          No subscription plans created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col relative group transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/20"
            >
              {/* Header */}
              <div className="mb-5">
                <h2 className="text-lg font-bold text-zinc-100">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-white">₹{plan.price}</span>
                  <span className="text-xs text-zinc-500 font-medium">/ {plan.duration_days} days</span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1">
                <ul className="space-y-3">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                      <div className="mt-0.5"><CheckIcon /></div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-4 border-t border-zinc-800/60 flex justify-end">
                <button
                  onClick={() => handleDelete(plan.id)}
                  disabled={deleteId === plan.id}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete Plan"
                >
                  <TrashIcon />
                  {deleteId === plan.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}