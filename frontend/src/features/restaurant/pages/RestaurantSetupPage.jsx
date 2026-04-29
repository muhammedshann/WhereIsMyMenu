import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Plus, ArrowRight, ArrowLeft, Check, ChefHat, Store, Utensils,
  MapPin, Clock, Link as LinkIcon, Camera, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/api';

/* ─── UI HELPERS ─── */
const InputLabel = ({ title, required }) => (
  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">
    {title} {required && <span className="text-red-500">*</span>}
  </label>
);
const ErrorText = ({ msg }) => msg
  ? <p className="text-red-500 text-[11px] font-bold mt-1 absolute -bottom-4 left-0">{msg}</p>
  : null;

const baseInputClass = "w-full text-slate-900 bg-transparent border-b border-slate-200 px-0 pb-2 pt-1 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-300 font-medium text-[15px]";
const compactInputClass = "w-full text-xs font-bold text-slate-700 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 focus:bg-white rounded flex-1 px-2 py-1.5 focus:outline-none transition-colors placeholder:text-slate-300";

const SectionContainer = ({ children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-slate-100 mb-6">
    {children}
  </div>
);
const SectionTitle = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
    <Icon className="text-orange-500" size={18} />
    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
  </div>
);

const buildEmpty = () => ({
  restaurantName: '', tagline: '', description: '',
  phone: '', email: '', address: '', mapsLink: '',
  openingTime: '', closingTime: '',
  instagram: '', facebook: '',
  coverImage: null,     // new File
  coverImageUrl: null,  // existing URL
  categories: [],
});

/* ─── MAIN COMPONENT ─── */
export default function RestaurantSetupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(buildEmpty());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /* ── Prefill from backend on mount ── */
  useEffect(() => {
    api.get('/restaurant/setup/')
      .then(res => {
        if (res.data.exists) {
          setIsExisting(true);
          const d = res.data;
          setFormData({
            restaurantName: d.restaurantName || '',
            tagline:        d.tagline        || '',
            description:    d.description    || '',
            phone:          d.phone          || '',
            email:          d.email          || '',
            address:        d.address        || '',
            mapsLink:       d.mapsLink       || '',
            openingTime:    d.openingTime    || '',
            closingTime:    d.closingTime    || '',
            instagram:      d.instagram      || '',
            facebook:       d.facebook       || '',
            coverImage:     null,
            coverImageUrl:  d.coverImageUrl  || null,
            categories: (d.categories || []).map(cat => ({
              id:    cat.id,
              name:  cat.name,
              items: (cat.items || []).map(item => ({
                id:          item.id,
                name:        item.name,
                price:       item.price,
                description: item.description || '',
                isVeg:       item.isVeg,
                imageFile:   null,
                imageUrl:    item.imageUrl || null,
              })),
            })),
          });
        }
      })
      .catch(() => {/* no restaurant yet — fresh form */})
      .finally(() => setIsLoading(false));
  }, []);

  /* ── Generic field change ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  /* ── Category helpers ── */
  const handleCategoryNameChange = (catId, v) =>
    setFormData(p => ({ ...p, categories: p.categories.map(c => c.id === catId ? { ...c, name: v } : c) }));

  const addCategory = () =>
    setFormData(p => ({ ...p, categories: [...p.categories, { id: `cat-${Date.now()}`, name: '', items: [] }] }));

  const removeCategory = (catId) =>
    setFormData(p => ({ ...p, categories: p.categories.filter(c => c.id !== catId) }));

  /* ── Item helpers ── */
  const addItem = (catId) =>
    setFormData(p => ({
      ...p,
      categories: p.categories.map(c => c.id !== catId ? c : {
        ...c,
        items: [...c.items, { id: `item-${Date.now()}`, name: '', price: '', description: '', imageFile: null, imageUrl: null, isVeg: true }],
      }),
    }));

  const handleItemChange = (catId, itemId, field, value) =>
    setFormData(p => ({
      ...p,
      categories: p.categories.map(c => c.id !== catId ? c : {
        ...c,
        items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i),
      }),
    }));

  const removeItem = (catId, itemId) =>
    setFormData(p => ({
      ...p,
      categories: p.categories.map(c => c.id !== catId ? c : {
        ...c, items: c.items.filter(i => i.id !== itemId),
      }),
    }));

  /* ── Validation ── */
  const validateStep1 = () => {
    const e = {};
    if (formData.restaurantName.trim().length < 2) e.restaurantName = 'Must be at least 2 characters';
    
    if (!/^\+?[1-9]\d{9,14}$/.test(formData.phone)) e.phone = 'Enter a valid phone number (e.g., +919876543210)';
    
    if (!formData.address.trim()) e.address = 'Required';
    
    if (formData.mapsLink && !/^https?:\/\/.+/.test(formData.mapsLink)) e.mapsLink = 'Enter a valid URL starting with http:// or https://';
    if (formData.instagram && !/^https?:\/\/.+/.test(formData.instagram)) e.instagram = 'Enter a valid URL starting with http:// or https://';
    if (formData.facebook && !/^https?:\/\/.+/.test(formData.facebook)) e.facebook = 'Enter a valid URL starting with http:// or https://';

    if (formData.openingTime && formData.closingTime) {
      if (formData.closingTime <= formData.openingTime) {
        e.closingTime = 'Must be after opening time';
      }
    }

    if (!formData.coverImage && !formData.coverImageUrl) e.coverImage = 'Cover image is required';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fill in all required fields.", { id: 'setup-step1-error' });
    }
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    let valid = true;
    const e = {};
    formData.categories.forEach(cat => {
      if (cat.name.trim().length < 2) { valid = false; e[`cat_${cat.id}`] = 'Min 2 characters'; }
      cat.items.forEach(item => {
        if (item.name.trim().length < 2) { valid = false; e[`item_name_${item.id}`] = 'Min 2 characters'; }
        if (!item.price || Number(item.price) <= 0) { valid = false; e[`item_price_${item.id}`] = 'Must be > 0'; }
        if (!item.imageFile && !item.imageUrl) { valid = false; e[`item_image_${item.id}`] = 'Image required'; }
      });
    });
    setErrors(e);
    if (!valid) {
      toast.error("Please ensure all categories and items have required details.", { id: 'setup-step2-error' });
    }
    return valid;
  };

  const nextStep = () => {
    if (validateStep1()) { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const prevStep = () => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('data', JSON.stringify({
      restaurantName: formData.restaurantName,
      tagline:        formData.tagline,
      description:    formData.description,
      phone:          formData.phone,
      email:          formData.email,
      address:        formData.address,
      mapsLink:       formData.mapsLink,
      openingTime:    formData.openingTime || null,
      closingTime:    formData.closingTime || null,
      instagram:      formData.instagram,
      facebook:       formData.facebook,
      categories: formData.categories.map(c => ({
        id: c.id, name: c.name,
        items: c.items.map(i => ({ id: i.id, name: i.name, description: i.description, price: i.price, isVeg: i.isVeg })),
      })),
    }));

    if (formData.coverImage) payload.append('cover_image', formData.coverImage);

    formData.categories.forEach(cat =>
      cat.items.forEach(item => {
        if (item.imageFile) payload.append(`item_image_${item.id}`, item.imageFile);
      })
    );

    try {
      await api.post('/restaurant/setup/', payload);
      setIsSuccess(true);
    } catch (err) {
      console.error('Submission failed:', err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin text-orange-500" />
          <p className="text-sm font-semibold">Loading your restaurant data…</p>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white max-w-sm w-full rounded-3xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {isExisting ? 'Changes Saved!' : 'Setup Complete!'}
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {isExisting
              ? 'Your restaurant details and menu have been updated successfully.'
              : 'Your restaurant profile and menu are ready. Customers can now scan your QR code.'}
          </p>
          <button onClick={() => navigate(isExisting ? '/dashboard' : '/restaurant/subscription')}
            className="w-full bg-slate-900 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-md">
            {isExisting ? 'Go to Dashboard' : 'Choose Plan & Continue'}
          </button>
        </motion.div>
      </div>
    );
  }

  /* ─── STEP 1 ─── */
  const renderStep1 = () => (
    <motion.div key="step1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>

      <SectionContainer>
        <SectionTitle title="Basic Information" icon={Store} />
        <div className="space-y-6">
          <div className="relative pb-4">
            <InputLabel title="Restaurant Name" required />
            <input type="text" name="restaurantName" placeholder="What is the name of your establishment?" className={baseInputClass} value={formData.restaurantName} onChange={handleChange} />
            <ErrorText msg={errors.restaurantName} />
          </div>
          <div className="relative pb-4">
            <InputLabel title="Tagline" />
            <input type="text" name="tagline" placeholder="A short, catchy phrase (optional)" className={baseInputClass} value={formData.tagline} onChange={handleChange} />
          </div>
          <div className="relative pb-4">
            <InputLabel title="Description" />
            <textarea name="description" rows="2" placeholder="Tell your story..." className={`${baseInputClass} resize-none`} value={formData.description} onChange={handleChange} />
          </div>
        </div>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle title="Contact & Location" icon={MapPin} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-6">
          <div className="relative pb-4">
            <InputLabel title="Phone Number" required />
            <input type="tel" name="phone" placeholder="+91 xxxx xxxx" className={baseInputClass} value={formData.phone} onChange={handleChange} />
            <ErrorText msg={errors.phone} />
          </div>
          <div className="relative pb-4">
            <InputLabel title="Email Address" />
            <input type="email" name="email" placeholder="hello@restaurant.com" className={baseInputClass} value={formData.email} onChange={handleChange} />
          </div>
        </div>
        <div className="relative pb-4 mb-2">
          <InputLabel title="Full Address" required />
          <input type="text" name="address" placeholder="Building, Street, City" className={baseInputClass} value={formData.address} onChange={handleChange} />
          <ErrorText msg={errors.address} />
        </div>
        <div className="relative pb-4">
          <InputLabel title="Google Maps Link" />
          <input type="url" name="mapsLink" placeholder="https://maps.google.com/..." className={baseInputClass} value={formData.mapsLink} onChange={handleChange} />
          <ErrorText msg={errors.mapsLink} />
        </div>
      </SectionContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SectionContainer>
          <SectionTitle title="Timings" icon={Clock} />
          <div className="flex gap-6">
            <div className="flex-1 relative pb-4">
              <InputLabel title="Opens At" />
              <input type="time" name="openingTime" className={baseInputClass} value={formData.openingTime} onChange={handleChange} />
            </div>
            <div className="flex-1 relative pb-4">
              <InputLabel title="Closes At" />
              <input type="time" name="closingTime" className={baseInputClass} value={formData.closingTime} onChange={handleChange} />
              <ErrorText msg={errors.closingTime} />
            </div>
          </div>
        </SectionContainer>
        <SectionContainer>
          <SectionTitle title="Social Profiles" icon={LinkIcon} />
          <div className="space-y-6">
            <div className="relative pb-4 flex items-end gap-3">
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">IG</span>
              <input type="url" name="instagram" placeholder="Instagram Profile" className={`${baseInputClass} flex-1`} value={formData.instagram} onChange={handleChange} />
              <ErrorText msg={errors.instagram} />
            </div>
            <div className="relative pb-4 flex items-end gap-3">
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">FB</span>
              <input type="url" name="facebook" placeholder="Facebook Profile" className={`${baseInputClass} flex-1`} value={formData.facebook} onChange={handleChange} />
              <ErrorText msg={errors.facebook} />
            </div>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer>
        <SectionTitle title="Cover Banner" icon={Upload} />
        <label className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group ${errors.coverImage ? 'border-red-300' : 'border-slate-300'}`}>
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            if (e.target.files?.[0]) {
              setFormData(p => ({ ...p, coverImage: e.target.files[0], coverImageUrl: null }));
              setErrors(p => ({ ...p, coverImage: '' }));
            }
          }} />
          {formData.coverImageUrl && !formData.coverImage ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <img src={formData.coverImageUrl} alt="Cover" className="h-28 w-full object-cover rounded-lg" />
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Click to change cover image</p>
            </div>
          ) : formData.coverImage ? (
            <div className="flex flex-col items-center">
              <Check size={20} className="text-emerald-500 mb-2" />
              <p className="font-bold text-slate-700 text-sm">{formData.coverImage.name}</p>
            </div>
          ) : (
            <>
              <Upload size={20} className="text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-slate-600 text-sm mb-1">Upload a cover image <span className="text-red-500">*</span></p>
              <p className="text-[11px] font-semibold text-slate-400">High quality landscape images work best.</p>
            </>
          )}
        </label>
        {errors.coverImage && <p className="text-red-500 text-[11px] font-bold mt-2">{errors.coverImage}</p>}
      </SectionContainer>
    </motion.div>
  );

  /* ─── STEP 2 ─── */
  const renderStep2 = () => (
    <motion.div key="step2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="space-y-5">

      {formData.categories.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center flex flex-col items-center">
          <Utensils size={28} className="text-slate-200 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-2">Build your digital menu</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5">Organise your offerings by adding categories like "Appetizers" or "Main Courses".</p>
          <button onClick={addCategory} className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
            <Plus size={14} /> Add First Category
          </button>
        </div>
      )}

      {formData.categories.map(category => (
        <div key={category.id} className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">

          {/* Category header */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Category Name (e.g. Mains)"
              className={`text-[15px] font-black text-slate-800 bg-transparent border-transparent px-1 focus:outline-none w-full hover:bg-white rounded ${errors[`cat_${category.id}`] ? 'bg-red-50' : ''}`}
              value={category.name}
              onChange={e => handleCategoryNameChange(category.id, e.target.value)}
              autoFocus={!category.name}
            />
            <button onClick={() => removeCategory(category.id)} className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 hover:border-red-200 p-1.5 rounded-md shadow-sm transition-all">
              <Trash2 size={14} />
            </button>
          </div>

          {/* Items */}
          <div className="bg-white p-2">
            {category.items.length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-2">No items yet.</p>
            )}
            <div className="space-y-1 mb-2">
              {category.items.map(item => (
                <div key={item.id} className="group flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white hover:bg-slate-50 border-b border-transparent hover:border-slate-100 rounded-md p-2 transition-colors relative">

                  {/* Veg toggle */}
                  <button type="button" onClick={() => handleItemChange(category.id, item.id, 'isVeg', !item.isVeg)}
                    className={`shrink-0 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-colors w-[85px] border ${item.isVeg ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </button>

                  {/* Fields */}
                  <div className="flex-1 w-full grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-4">
                      <input type="text" placeholder="Item Name"
                        className={`${compactInputClass} ${errors[`item_name_${item.id}`] ? 'border-red-300 bg-red-50' : ''}`}
                        value={item.name} onChange={e => handleItemChange(category.id, item.id, 'name', e.target.value)} />
                    </div>
                    <div className="col-span-12 sm:col-span-2 relative flex items-center">
                      <span className="absolute left-2.5 text-[10px] text-slate-400 font-bold z-10">₹</span>
                      <input type="number" placeholder="Price"
                        className={`${compactInputClass} pl-5 ${errors[`item_price_${item.id}`] ? 'border-red-300 bg-red-50' : ''}`}
                        value={item.price} onChange={e => handleItemChange(category.id, item.id, 'price', e.target.value)} />
                    </div>
                    <div className="col-span-10 sm:col-span-5">
                      <input type="text" placeholder="Description..."
                        className={compactInputClass}
                        value={item.description} onChange={e => handleItemChange(category.id, item.id, 'description', e.target.value)} />
                    </div>
                    {/* Image upload */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                      <label
                        className={`text-slate-400 hover:text-slate-600 p-1.5 rounded transition-colors w-full flex justify-center cursor-pointer border ${errors[`item_image_${item.id}`] ? 'border-red-300 bg-red-50' : (item.imageFile || item.imageUrl) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-100 hover:bg-slate-200'}`}
                        title={item.imageFile ? item.imageFile.name : item.imageUrl ? 'Image set — click to change' : 'Add photo (required)'}
                      >
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          if (e.target.files?.[0]) {
                            handleItemChange(category.id, item.id, 'imageFile', e.target.files[0]);
                            handleItemChange(category.id, item.id, 'imageUrl', null);
                            setErrors(p => ({ ...p, [`item_image_${item.id}`]: '' }));
                          }
                        }} />
                        {(item.imageFile || item.imageUrl)
                          ? <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full my-[3px]" />
                          : <Camera size={14} className={errors[`item_image_${item.id}`] ? 'text-red-400' : ''} />}
                      </label>
                    </div>
                  </div>

                  <button onClick={() => removeItem(category.id, item.id)} className="text-slate-300 hover:text-red-500 shrink-0 p-1.5 rounded-md hover:bg-red-50 transition-colors hidden sm:block opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => removeItem(category.id, item.id)} className="text-red-400 shrink-0 p-1 rounded-md sm:hidden absolute top-2 right-2">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => addItem(category.id)}
              className="w-full py-2 text-[11px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors border border-dashed border-slate-200 flex items-center justify-center gap-1.5">
              <Plus size={12} strokeWidth={3} /> Add item to {category.name || 'Category'}
            </button>
          </div>
        </div>
      ))}

      {formData.categories.length > 0 && (
        <button onClick={addCategory}
          className="w-full bg-white border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm mb-12">
          <Plus size={14} strokeWidth={3} /> Create New Category
        </button>
      )}
    </motion.div>
  );

  /* ─── MAIN RENDER ─── */
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-orange-200">

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <ChefHat size={16} strokeWidth={2.5} />
            </div>
            {isExisting && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Editing</span>}
          </div>
          <div className="flex items-center gap-3 flex-1 justify-center">
            {[{ n: 1, label: 'Profile' }, { n: 2, label: 'Menu' }].map((s, i) => (
              <React.Fragment key={s.n}>
                {i > 0 && <div className={`w-8 h-[2px] rounded-full transition-colors ${step >= s.n ? 'bg-slate-900' : 'bg-slate-200'}`} />}
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${step >= s.n ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{s.n}</div>
                  <span className={`text-[13px] font-bold hidden sm:block ${step >= s.n ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 pt-10 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1.5 tracking-tight">
            {step === 1
              ? (isExisting ? 'Update your restaurant profile.' : "Welcome. Let's get the basics.")
              : (isExisting ? 'Update your menu.' : 'Build your menu.')}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {step === 1 ? 'Essentials so customers know where to find you.' : 'List your dishes — every item needs an image.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? renderStep1() : renderStep2()}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between pt-6">
          {step === 1 ? <div /> : (
            <button onClick={prevStep} className="px-5 py-2.5 rounded-lg font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step === 1 ? (
            <button onClick={nextStep} className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-md active:scale-95 ml-auto">
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="px-8 py-2.5 rounded-lg font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 ml-auto">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <>{isExisting ? 'Save Changes' : 'Launch Menu'} <Check size={16} /></>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
