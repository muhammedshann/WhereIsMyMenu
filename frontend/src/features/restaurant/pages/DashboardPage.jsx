import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, Eye, QrCode, Download, CheckCircle2, AlertTriangle,
  ChefHat, LogOut, FolderPlus, ArrowUpRight, Layers, ToggleLeft, ToggleRight,
  Zap, Settings, Copy, Share2, Globe, ExternalLink, UtensilsCrossed,
  ArrowRight, ChevronRight, Loader2, AlertCircle, X, Camera, Check, Upload,
  Phone, MapPin, Link as LinkIcon, Clock
} from 'lucide-react';

/* ════════════════════════════════════════════════════════
   DRAWER — right-slide panel
════════════════════════════════════════════════════════ */
function Drawer({ open, title, onClose, children }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm font-black text-gray-900">{title}</p>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={15} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   CONFIRM DIALOG — reusable delete confirmation
════════════════════════════════════════════════════════ */
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', type = 'danger' }) {
  const Icon = type === 'danger' ? Trash2 : LogOut;
  const iconColor = type === 'danger' ? 'text-red-500' : 'text-orange-500';
  const iconBg = type === 'danger' ? 'bg-red-100' : 'bg-orange-100';
  const btnColor = type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100';

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all duration-200 ${open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'}`}>
        <div className={`w-12 h-12 ${iconBg} rounded-2xl grid place-items-center mx-auto mb-4`}>
          <Icon size={20} className={iconColor} />
        </div>
        <p className="text-sm font-black text-gray-900 text-center mb-1.5">{title || 'Are you sure?'}</p>
        {message && <p className="text-xs text-gray-400 text-center mb-5 leading-relaxed">{message}</p>}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl active:scale-95 text-sm font-bold text-white transition-all shadow-md ${btnColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FORM HELPERS
════════════════════════════════════════════════════════ */
const FLabel = ({ children, required }) => (
  <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);
const FInput = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full text-sm font-medium text-gray-800 border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all placeholder:text-gray-300 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
  />
);
const FTextarea = ({ error, ...props }) => (
  <textarea
    {...props}
    className={`w-full text-sm font-medium text-gray-800 border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all placeholder:text-gray-300 resize-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
  />
);
const FError = ({ msg }) => msg ? <p className="text-red-500 text-[11px] font-bold mt-1">{msg}</p> : null;
const FRow = ({ children }) => <div className="mb-5">{children}</div>;

const SubmitBtn = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-black py-3 rounded-xl transition-all hover:shadow-md shadow-orange-100 disabled:opacity-60 flex items-center justify-center gap-2 mt-6"
  >
    {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> {label}</>}
  </button>
);

/* ════════════════════════════════════════════════════════
   FORM 1 — Restaurant Info
════════════════════════════════════════════════════════ */
function RestaurantInfoForm({ data, onSuccess }) {
  const [form, setForm] = useState({
    name: data?.name || '', tagline: data?.tagline || '',
    phone: data?.phone || '', email: data?.email || '',
    address: data?.address || '', mapsLink: data?.mapsLink || '',
    instagram: data?.instagram || '', facebook: data?.facebook || '',
    openingTime: data?.openingTime || '', closingTime: data?.closingTime || '',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState(data?.coverImage || null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Must be at least 2 characters';
    if (!/^\+?[1-9]\d{9,14}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    if (!form.address.trim()) errs.address = 'Required';
    
    if (form.maps_link && !/^https?:\/\/.+/.test(form.maps_link)) errs.maps_link = 'Enter a valid URL';
    if (form.instagram && !/^https?:\/\/.+/.test(form.instagram)) errs.instagram = 'Enter a valid URL';
    if (form.facebook && !/^https?:\/\/.+/.test(form.facebook)) errs.facebook = 'Enter a valid URL';

    if (form.opening_time && form.closing_time) {
      if (form.closing_time <= form.opening_time) {
        errs.closing_time = 'Must be after opening time';
      }
    }

    if (Object.keys(errs).length) { 
      setErrors(errs); 
      toast.error("Please fix the validation errors.");
      return; 
    }

    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (coverFile) fd.append('cover_image', coverFile);

    try {
      const res = await api.patch('/restaurant/info/', fd);
      toast.success("Restaurant info updated successfully!");
      onSuccess(res.data);
    } catch (err) {
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <FRow>
        <FLabel required>Restaurant Name</FLabel>
        <FInput placeholder="e.g. The Golden Fork" value={form.name} onChange={set('name')} error={errors.name} />
        <FError msg={errors.name} />
      </FRow>
      <FRow>
        <FLabel>Tagline</FLabel>
        <FInput placeholder="A catchy one-liner" value={form.tagline} onChange={set('tagline')} />
      </FRow>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <FLabel required>Phone</FLabel>
          <FInput placeholder="+91 xxxx" value={form.phone} onChange={set('phone')} error={errors.phone} />
          <FError msg={errors.phone} />
        </div>
        <div>
          <FLabel>Email</FLabel>
          <FInput type="email" placeholder="hi@resto.com" value={form.email} onChange={set('email')} />
        </div>
      </div>
      <FRow>
        <FLabel required>Address</FLabel>
        <FTextarea rows={2} placeholder="Street, City, State" value={form.address} onChange={set('address')} error={errors.address} />
        <FError msg={errors.address} />
      </FRow>
      <FRow>
        <FLabel>Maps Link</FLabel>
        <FInput placeholder="https://maps.google.com/..." value={form.mapsLink} onChange={set('mapsLink')} />
      </FRow>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <FLabel>Opens At</FLabel>
          <FInput type="time" value={form.openingTime} onChange={set('openingTime')} />
        </div>
        <div>
          <FLabel>Closes At</FLabel>
          <FInput type="time" value={form.closingTime} onChange={set('closingTime')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <FLabel>Instagram</FLabel>
          <FInput placeholder="URL" value={form.instagram} onChange={set('instagram')} />
        </div>
        <div>
          <FLabel>Facebook</FLabel>
          <FInput placeholder="URL" value={form.facebook} onChange={set('facebook')} />
        </div>
      </div>
      <FRow>
        <FLabel>Cover Image</FLabel>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors">
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            if (e.target.files?.[0]) { setCoverFile(e.target.files[0]); setCoverUrl(URL.createObjectURL(e.target.files[0])); }
          }} />
          {coverUrl
            ? <img src={coverUrl} alt="Cover" className="h-24 w-full object-cover rounded-lg" />
            : <><Upload size={20} className="text-gray-300 mb-2" /><p className="text-xs text-gray-400">Click to upload cover</p></>
          }
          {coverFile && <p className="text-[11px] text-gray-400 mt-1">{coverFile.name}</p>}
        </label>
      </FRow>
      <SubmitBtn loading={loading} label="Save Restaurant Info" />
    </form>
  );
}

/* ════════════════════════════════════════════════════════
   FORM 2 — Category
════════════════════════════════════════════════════════ */
function CategoryForm({ data, onSuccess }) {
  const isEdit = Boolean(data?.id);
  const [name, setName] = useState(data?.name || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) { 
      setError('Category name must be at least 2 characters'); 
      toast.error("Category name must be at least 2 characters.");
      return; 
    }
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await api.patch(`/restaurant/categories/${data.id}/`, { name });
      } else {
        res = await api.post('/restaurant/categories/', { name });
      }
      toast.success(isEdit ? "Category updated!" : "Category created!");
      onSuccess(res.data, isEdit);
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FRow>
        <FLabel required>Category Name</FLabel>
        <FInput
          placeholder='e.g. Starters, Mains, Desserts'
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />
        <FError msg={error} />
      </FRow>
      <p className="text-xs text-gray-400 mb-4">All menu items inside this category will be grouped together on your live menu.</p>
      <SubmitBtn loading={loading} label={isEdit ? 'Update Category' : 'Add Category'} />
    </form>
  );
}

/* ════════════════════════════════════════════════════════
   FORM 3 — Menu Item
════════════════════════════════════════════════════════ */
function MenuItemForm({ data, allCats, onSuccess }) {
  const isEdit = Boolean(data?.id);
  const [form, setForm] = useState({
    name: data?.name || '',
    price: data?.rawPrice || '',
    description: data?.description || '',
    isVeg: data?.veg ?? true,
    categoryId: data?.catId || allCats[0]?.id || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(data?.imageUrl || null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Must be at least 2 characters';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Must be > 0';
    if (!form.categoryId) errs.categoryId = 'Required';
    if (!isEdit && !imageFile) errs.image = 'Image is required for new items';
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      toast.error("Please fix the validation errors.");
      return; 
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('price', form.price);
    fd.append('description', form.description);
    fd.append('isVeg', form.isVeg);
    fd.append('categoryId', form.categoryId);
    if (imageFile) fd.append('image', imageFile);

    try {
      let res;
      if (isEdit) {
        res = await api.patch(`/restaurant/items/${data.id}/`, fd);
      } else {
        res = await api.post('/restaurant/items/', fd);
      }
      toast.success(isEdit ? "Menu item updated!" : "Menu item added!");
      onSuccess(res.data, isEdit);
    } catch (err) {
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FRow>
        <FLabel required>Item Name</FLabel>
        <FInput placeholder="e.g. Chicken Burger" value={form.name} onChange={set('name')} error={errors.name} />
        <FError msg={errors.name} />
      </FRow>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <FLabel required>Price (₹)</FLabel>
          <FInput type="number" placeholder="250" value={form.price} onChange={set('price')} error={errors.price} />
          <FError msg={errors.price} />
        </div>
        <div>
          <FLabel required>Category</FLabel>
          <select
            value={form.categoryId}
            onChange={set('categoryId')}
            className={`w-full text-sm font-medium text-gray-800 border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition-all ${errors.categoryId ? 'border-red-300' : 'border-gray-200'}`}
          >
            {allCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <FError msg={errors.categoryId} />
        </div>
      </div>
      <FRow>
        <FLabel>Description</FLabel>
        <FTextarea rows={2} placeholder="Short description of the dish..." value={form.description} onChange={set('description')} />
      </FRow>
      <FRow>
        <FLabel>Type</FLabel>
        <div className="flex gap-2">
          {[{ label: '🟢 Veg', val: true }, { label: '🔴 Non-Veg', val: false }].map(opt => (
            <button key={String(opt.val)} type="button"
              onClick={() => setForm(p => ({ ...p, isVeg: opt.val }))}
              className={`flex-1 text-xs font-bold py-2.5 rounded-xl border transition-all ${form.isVeg === opt.val ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FRow>
      <FRow>
        <FLabel required={!isEdit}>Item Photo {isEdit && <span className="text-gray-400 font-normal normal-case tracking-normal">(leave empty to keep existing)</span>}</FLabel>
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors ${errors.image ? 'border-red-300' : 'border-gray-200'}`}>
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            if (e.target.files?.[0]) {
              setImageFile(e.target.files[0]);
              setImageUrl(URL.createObjectURL(e.target.files[0]));
              setErrors(p => ({ ...p, image: '' }));
            }
          }} />
          {imageUrl
            ? <img src={imageUrl} alt="Item" className="h-24 w-full object-cover rounded-lg" />
            : <><Camera size={20} className="text-gray-300 mb-2" /><p className="text-xs text-gray-400">Click to upload photo</p></>
          }
          {imageFile && <p className="text-[11px] text-gray-400 mt-1">{imageFile.name}</p>}
        </label>
        <FError msg={errors.image} />
      </FRow>
      <SubmitBtn loading={loading} label={isEdit ? 'Update Item' : 'Add Item'} />
    </form>
  );
}

/* ════════════════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  // ── Remote data
  const [restaurant, setRestaurant] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [allCats, setAllCats] = useState([]);
  const [stats, setStats] = useState({});
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── UI
  const [copied, setCopied] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);
  const [itemStatuses, setItemStatuses] = useState({});

  // ── Drawer
  const [modal, setModal] = useState({ open: false, type: null, data: null });
  const openModal = (type, data = null) => setModal({ open: true, type, data });
  const closeModal = () => setModal({ open: false, type: null, data: null });

  // ── Confirm dialog
  const [confirmDlg, setConfirmDlg] = useState({ open: false, title: '', message: '', action: null, confirmText: 'Delete', type: 'danger' });
  const askConfirm = (title, message, action, confirmText = 'Delete', type = 'danger') => setConfirmDlg({ open: true, title, message, action, confirmText, type });
  const handleConfirmOk = () => { confirmDlg.action?.(); setConfirmDlg({ open: false, title: '', message: '', action: null, confirmText: 'Delete', type: 'danger' }); };
  const handleConfirmCancel = () => setConfirmDlg({ open: false, title: '', message: '', action: null, confirmText: 'Delete', type: 'danger' });

  const LIMIT = 5;
  const userName = user?.firstName || user?.username || 'Chef';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Fetch
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/restaurant/dashboard/');
      const d = res.data;
      console.log("dashboard res", res.data);
      console.log(d);
      setRestaurant(d.restaurant);
      setAllItems(d.items);
      setAllCats(d.categories);
      setStats(d.stats);
      setSteps(d.setupSteps);
      setItemStatuses(Object.fromEntries(d.items.map(i => [i.id, i.status])));
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/restaurant/setup');
      } else {
        setError('Failed to load dashboard.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── Toggle availability
  const toggleItem = async (id) => {
    const prev = itemStatuses[id];
    setItemStatuses(s => ({ ...s, [id]: !prev }));
    try {
      const res = await api.patch(`/restaurant/items/${id}/toggle/`);
      const isAvailable = res.data.isAvailable;

      setAllItems(items => items.map(i => i.id === id ? { ...i, status: isAvailable } : i));

      // Update counts
      setStats(s => ({
        ...s,
        availableItems: isAvailable ? s.availableItems + 1 : s.availableItems - 1,
        unavailableItems: isAvailable ? s.unavailableItems - 1 : s.unavailableItems + 1,
      }));

      if (res.data.setupComplete !== undefined) {
        setRestaurant(r => ({ ...r, setupComplete: res.data.setupComplete }));
      }
    } catch {
      setItemStatuses(s => ({ ...s, [id]: prev }));
    }
  };

  // ── Copy URL
  const handleCopy = () => {
    if (!restaurant) return;
    navigator.clipboard.writeText(restaurant.menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Delete helpers
  const deleteCategory = (catId) => {
    askConfirm(
      'Delete Category',
      'This will permanently delete the category and all menu items inside it.',
      async () => {
        try {
          const res = await api.delete(`/restaurant/categories/${catId}/`);
          const deletedItemIds = allItems.filter(i => i.catId === catId).map(i => i.id);
          setAllCats(c => c.filter(c => c.id !== catId));
          setAllItems(items => items.filter(i => i.catId !== catId));
          setStats(s => ({
            ...s,
            totalCategories: s.totalCategories - 1,
            totalItems: s.totalItems - deletedItemIds.length,
            availableItems: s.availableItems - deletedItemIds.filter(id => itemStatuses[id]).length,
          }));
          if (res.data?.setupComplete !== undefined)
            setRestaurant(r => ({ ...r, setupComplete: res.data.setupComplete }));
        } catch (err) { alert('Failed to delete category.'); }
      });
  };

  const deleteItem = (itemId) => {
    askConfirm(
      'Delete Menu Item',
      'This item will be permanently removed from your menu.',
      async () => {
        const item = allItems.find(i => i.id === itemId);
        try {
          const res = await api.delete(`/restaurant/items/${itemId}/`);
          setAllItems(items => items.filter(i => i.id !== itemId));
          setAllCats(cats => cats.map(c => c.id === item?.catId ? { ...c, count: Math.max(0, c.count - 1) } : c));
          setStats(s => ({
            ...s,
            totalItems: s.totalItems - 1,
            availableItems: item?.status ? s.availableItems - 1 : s.availableItems,
            unavailableItems: !item?.status ? s.unavailableItems - 1 : s.unavailableItems,
          }));
          if (res.data?.setupComplete !== undefined)
            setRestaurant(r => ({ ...r, setupComplete: res.data.setupComplete }));
        } catch { alert('Failed to delete item.'); }
      });
  };

  // ── Modal success callbacks
  const handleInfoSuccess = (updated) => {
    setRestaurant(r => ({ ...r, ...updated })); // includes setupComplete from backend
    closeModal();
  };

  const handleCategorySuccess = (cat, isEdit) => {
    if (isEdit) {
      setAllCats(cats => cats.map(c => c.id === cat.id ? { ...c, name: cat.name } : c));
      setAllItems(items => items.map(i => i.catId === cat.id ? { ...i, cat: cat.name } : i));
    } else {
      setAllCats(cats => [...cats, cat]);
      setStats(s => ({ ...s, totalCategories: s.totalCategories + 1 }));
    }
    if (cat.setupComplete !== undefined)
      setRestaurant(r => ({ ...r, setupComplete: cat.setupComplete }));
    closeModal();
  };

  const handleItemSuccess = (item, isEdit) => {
    if (isEdit) {
      setAllItems(items => items.map(i => i.id === item.id ? item : i));
      setAllCats(cats => cats.map(c => {
        const count = allItems.filter(i => (i.id === item.id ? item : i).catId === c.id).length;
        return { ...c, count };
      }));
    } else {
      setAllItems(items => [...items, { ...item, status: true }]);
      setItemStatuses(s => ({ ...s, [item.id]: true }));
      setAllCats(cats => cats.map(c => c.id === item.catId ? { ...c, count: c.count + 1 } : c));
      setStats(s => ({ ...s, totalItems: s.totalItems + 1, availableItems: s.availableItems + 1 }));
    }
    if (item.setupComplete !== undefined)
      setRestaurant(r => ({ ...r, setupComplete: item.setupComplete }));
    closeModal();
  };

  // ── Drawer title
  const drawerTitle = modal.type === 'info'
    ? 'Edit Restaurant Info'
    : modal.type === 'category'
      ? (modal.data?.id ? 'Edit Category' : 'Add Category')
      : (modal.data?.id ? 'Edit Menu Item' : 'Add Menu Item');

  const visibleItems = showAllItems ? allItems : allItems.slice(0, LIMIT);
  const visibleCats = showAllCats ? allCats : allCats.slice(0, LIMIT);
  const progress = steps.length ? Math.round((steps.filter(s => s.done).length / steps.length) * 100) : 0;

  /* LOADING */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 size={28} className="animate-spin text-orange-500" />
        <p className="text-sm font-semibold">Loading your dashboard…</p>
      </div>
    </div>
  );

  /* ERROR */
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-sm">
        <AlertCircle size={32} className="text-rose-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-gray-800">{error}</p>
        <button onClick={fetchDashboard} className="mt-4 text-xs font-bold text-orange-500 hover:underline">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── CONFIRM DIALOG ── */}
      <ConfirmDialog
        open={confirmDlg.open}
        title={confirmDlg.title}
        message={confirmDlg.message}
        onConfirm={handleConfirmOk}
        onCancel={handleConfirmCancel}
        confirmText={confirmDlg.confirmText}
        type={confirmDlg.type}
      />

      {/* ── DRAWER ── */}
      <Drawer open={modal.open} title={drawerTitle} onClose={closeModal}>
        {modal.type === 'info' && (
          <RestaurantInfoForm data={{ ...restaurant, coverImage: restaurant?.coverImage }} onSuccess={handleInfoSuccess} />
        )}
        {modal.type === 'category' && (
          <CategoryForm data={modal.data} onSuccess={handleCategorySuccess} />
        )}
        {modal.type === 'item' && (
          <MenuItemForm data={modal.data} allCats={allCats} onSuccess={handleItemSuccess} />
        )}
      </Drawer>

      {/* ── SUBSCRIPTION OVERLAY ── */}
      {!restaurant?.isSubscribed && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-20 overflow-hidden bg-gray-50/80 backdrop-blur-[2px] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center relative overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50" />

            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl grid place-items-center mx-auto mb-6 relative">
              <Zap size={32} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-orange-100 grid place-items-center">
                <AlertCircle size={14} className="text-orange-500" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Activate your Dashboard</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Your restaurant setup is saved, but you need an active subscription to access analytics, menu management, and public publishing.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/restaurant/subscription')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-95 flex items-center justify-center gap-2"
              >
                Choose a Plan <ArrowRight size={16} />
              </button>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                Secure checkout via Razorpay
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg grid place-items-center shadow-md shadow-orange-200">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm tracking-tight">WhereIsMyMenu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-orange-100 grid place-items-center">
                <ChefHat size={10} className="text-orange-500" />
              </div>
              <span className="text-xs font-bold text-gray-600">{userName}</span>
            </div>
            <button onClick={() => navigate('/restaurant/setup')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Full Setup">
              <Settings size={15} className="text-gray-500" />
            </button>
            <button onClick={() => askConfirm('Logout', 'Are you sure you want to logout?', () => { logoutContext(); navigate('/login'); }, 'Logout', 'warning')} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-2.5 py-2 rounded-xl hover:bg-red-50">
              <LogOut size={14} /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-6">

        {/* ── HERO ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{greeting}</p>
            <h1 className="text-2xl font-black text-gray-900">
              {userName} <span className="text-orange-500">·</span> {restaurant?.name}
            </h1>
            <p className="text-sm text-gray-400 mt-1">{restaurant?.tagline || 'Your restaurant dashboard'}</p>
          </div>
          {restaurant?.menuUrl && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl pl-3 pr-1.5 py-1.5 shadow-sm">
              <Globe size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-500 truncate max-w-[160px]">{restaurant.menuUrl}</span>
              <button onClick={handleCopy} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-500 px-2.5 py-1.5 rounded-xl transition-colors">
                <Copy size={10} /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-[10px] font-bold text-white px-2.5 py-1.5 rounded-xl transition-colors">
                <ExternalLink size={10} /> Open
              </button>
            </div>
          )}
        </div>

        {/* ── SETUP BANNER ── */}
        {!restaurant?.setupComplete && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 grid place-items-center flex-shrink-0">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-amber-800">Your menu isn't live yet!</p>
                <p className="text-xs text-amber-600 mt-0.5">Complete your restaurant setup to publish your QR menu.</p>
              </div>
              <button onClick={() => navigate('/restaurant/setup')}
                className="flex-shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-amber-200 transition-all hover:-translate-y-0.5">
                Complete Setup <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Categories', value: stats.totalCategories ?? 0, icon: Layers, sub: 'menu sections' },
            { label: 'Total Items', value: stats.totalItems ?? 0, icon: UtensilsCrossed, sub: 'dishes & drinks' },
            { label: 'Available', value: stats.availableItems ?? 0, icon: ToggleRight, sub: 'live on menu' },
            { label: 'Off Menu', value: stats.unavailableItems ?? 0, icon: ToggleLeft, sub: 'hidden from customers' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <div className="w-7 h-7 bg-gray-50 rounded-lg grid place-items-center flex-shrink-0">
                  <s.icon size={13} className="text-gray-400" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MID GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-black text-gray-800">Quick Actions</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Jump to common tasks</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: 'Add Menu Item', sub: 'New dish or drink', icon: Plus, color: 'bg-orange-50 text-orange-500', action: () => openModal('item') },
                { label: 'Add Category', sub: 'Group your dishes', icon: FolderPlus, color: 'bg-violet-50 text-violet-500', action: () => openModal('category') },
                { label: 'Edit Restaurant', sub: 'Info, hours, contact', icon: Pencil, color: 'bg-blue-50 text-blue-500', action: () => openModal('info', restaurant) },
                { label: 'View Live Menu', sub: 'See as a customer', icon: Eye, color: 'bg-emerald-50 text-emerald-500', action: () => { } },
                { label: 'Download QR Code', sub: 'Print for tables', icon: QrCode, color: 'bg-rose-50 text-rose-500', action: () => { } },
              ].map(a => (
                <button key={a.label} onClick={a.action} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group text-left">
                  <div className={`w-8 h-8 rounded-xl ${a.color} grid place-items-center flex-shrink-0`}>
                    <a.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-orange-500 transition-colors">{a.label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{a.sub}</p>
                  </div>
                  <ChevronRight size={13} className="text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Restaurant Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-gray-800">Restaurant Info</p>
                <p className="text-[11px] text-gray-400 mt-0.5">At a glance</p>
              </div>
              <button
                onClick={() => openModal('info', restaurant)}
                className="flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Pencil size={11} /> Edit
              </button>
            </div>
            {restaurant?.coverImage && (
              <img src={restaurant.coverImage} alt="Cover" className="w-full h-24 object-cover" />
            )}
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: Phone, label: restaurant?.phone || '—' },
                { icon: MapPin, label: restaurant?.address || '—' },
                { icon: Clock, label: restaurant?.openingTime && restaurant?.closingTime ? `${restaurant.openingTime} - ${restaurant.closingTime}` : '—' },
                { icon: Globe, label: restaurant?.menuUrl || '—' },
              ].filter(row => row.label).map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <row.icon size={13} className="text-gray-300 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold text-gray-600 break-all leading-relaxed">{row.label}</p>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t border-gray-50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Subscription</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${restaurant?.subscription?.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {restaurant?.subscription?.status || 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl grid place-items-center flex-shrink-0">
                    <Zap size={16} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-900 truncate">{restaurant?.subscription?.planName || 'No Plan'}</p>
                    <p className="text-[10px] text-gray-400">Expires: {restaurant?.subscription?.expiryDate || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Setup steps or Analytics placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-black text-gray-800">Setup Checklist</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{progress}% complete</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {steps.map(step => (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 grid place-items-center ${step.done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    {step.done
                      ? <CheckCircle2 size={12} className="text-emerald-500" />
                      : <AlertTriangle size={11} className="text-amber-400" />}
                  </div>
                  <p className={`text-xs font-semibold flex-1 ${step.done ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MENU ITEMS MANAGER ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-gray-800">Menu Items</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{allItems.length} items · toggle availability live</p>
            </div>
            <button onClick={() => openModal('item')} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all hover:shadow-md">
              <Plus size={12} /> Add Item
            </button>
          </div>

          {allItems.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <UtensilsCrossed size={24} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-3">No menu items yet</p>
              <button onClick={() => openModal('item')} className="text-xs font-bold text-orange-500 hover:underline">Add your first dish →</button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-12 px-5 py-2 bg-gray-50 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-1"></div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2 hidden sm:block">Category</div>
                <div className="col-span-2 hidden sm:block">Price</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-50">
                {visibleItems.map(item => (
                  <div key={item.id} className="grid grid-cols-12 items-center px-5 py-3 hover:bg-gray-50/50 transition-colors group">
                    {/* Veg dot */}
                    <div className="col-span-1">
                      <div className={`w-2.5 h-2.5 rounded-full border-2 ${item.veg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'}`} title={item.veg ? 'Veg' : 'Non-Veg'} />
                    </div>
                    {/* Name */}
                    <div className="col-span-4">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                    </div>
                    {/* Category */}
                    <div className="col-span-2 hidden sm:block">
                      <p className="text-xs text-gray-400 truncate">{item.cat}</p>
                    </div>
                    {/* Price */}
                    <div className="col-span-2 hidden sm:block">
                      <p className="text-sm font-black text-gray-700">{item.price}</p>
                    </div>
                    {/* Toggle */}
                    <div className="col-span-2 flex items-center gap-2">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${itemStatuses[item.id] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${itemStatuses[item.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                      <span className={`text-[10px] font-black hidden sm:block ${itemStatuses[item.id] ? 'text-emerald-600' : 'text-gray-300'}`}>
                        {itemStatuses[item.id] ? 'Live' : 'Off'}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => openModal('item', item)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <Pencil size={12} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {allItems.length > LIMIT && (
                <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400">{allItems.length} items total</p>
                  <button onClick={() => setShowAllItems(p => !p)} className="text-[11px] font-bold text-orange-500 hover:underline flex items-center gap-1">
                    {showAllItems ? 'Show less' : `View all ${allItems.length} items`}
                    <ArrowRight size={10} className={`transition-transform ${showAllItems ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── CATEGORIES MANAGER ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-gray-800">Categories</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Organise your menu sections</p>
            </div>
            <button onClick={() => openModal('category')} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all hover:shadow-md">
              <Plus size={12} /> Add Category
            </button>
          </div>

          {allCats.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Layers size={24} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-3">No categories yet</p>
              <button onClick={() => openModal('category')} className="text-xs font-bold text-orange-500 hover:underline">Add your first category →</button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-12 px-5 py-2 bg-gray-50 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-5">Name</div>
                <div className="col-span-4">Items</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-50">
                {visibleCats.map(cat => (
                  <div key={cat.id} className="grid grid-cols-12 items-center px-5 py-3 hover:bg-gray-50/50 transition-colors group">
                    {/* Name */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 grid place-items-center flex-shrink-0">
                        <span className="text-[9px] font-black text-orange-500">{cat.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 truncate">{cat.name}</p>
                    </div>
                    {/* Item count + bar */}
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: `${stats.totalItems ? Math.round((cat.count / stats.totalItems) * 100) : 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 font-bold">{cat.count} item{cat.count !== 1 ? 's' : ''}</span>
                    </div>
                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-1">
                      <button
                        onClick={() => openModal('category', cat)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <Pencil size={12} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {allCats.length > LIMIT && (
                <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400">{allCats.length} categories total</p>
                  <button onClick={() => setShowAllCats(p => !p)} className="text-[11px] font-bold text-orange-500 hover:underline flex items-center gap-1">
                    {showAllCats ? 'Show less' : `View all ${allCats.length} categories`}
                    <ArrowRight size={10} className={`transition-transform ${showAllCats ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── QR PANEL ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {restaurant.QrCodeImageUrl ? (
                <img
                  src={restaurant.QrCodeImageUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full grid place-items-center bg-gray-50">
                  <QrCode size={32} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900">Your QR Menu is ready to share</p>
              <p className="text-xs text-gray-400 mt-1">Print, download, or share your menu link across platforms.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href={restaurant.QrCodeImageUrl}
                  download
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
                >
                  <Download size={12} /> Download QR
                </a>
                <button onClick={handleCopy} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                  <Share2 size={12} /> {copied ? 'Copied!' : 'Share Link'}
                </button>
                <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                  <Globe size={12} /> Open Live Menu
                </button>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Share on</p>
              {['Instagram', 'WhatsApp', 'Google Maps'].map(p => (
                <button key={p} className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1 justify-end">
                  {p} <ExternalLink size={10} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 pb-2">WhereIsMyMenu · QR-based restaurant menus ⚡</p>
      </main>
    </div>
  );
}
