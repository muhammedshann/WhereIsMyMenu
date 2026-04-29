import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode, RefreshCw, ChefHat, ArrowRight, Globe,
  CheckCircle2, Star, Zap, Share2, Menu, X,
  Search, Link2, ChevronRight, Sparkles, LayoutDashboard, LayoutList
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA WITH LOCAL IMAGES
───────────────────────────────────────────── */

const steps = [
  {
    num: '01',
    title: 'Create your restaurant profile',
    desc: 'Input your restaurant name, cuisine, address, and hours. Instantly, your page goes live with a professional feel without writing a single line of code.',
    img: '/images/step1.png',
    tag: 'Your Own Page',
    icon: <LayoutDashboard size={20} className="text-orange-500" />,
    features: ['Instant setup', 'Custom branding', 'No app required']
  },
  {
    num: '02',
    title: 'Build your digital menu',
    desc: 'Add your dishes with brilliant photos, descriptions, and prices. Categories and dietary tags make it incredibly easy for customers to find exactly what they want.',
    img: '/images/step2.png',
    tag: 'Interactive Menu',
    icon: <LayoutList size={20} className="text-rose-500" />,
    features: ['Unlimited categories', 'Dietary tags (Veg, Vegan)', 'Live updates']
  },
  {
    num: '03',
    title: 'Print your smart QR code',
    desc: 'Download a beautifully designed QR code tied directly to your menu. Customers point their phone camera, and the menu opens right in their browser.',
    img: '/images/step3.png',
    tag: 'Scan & Browse',
    icon: <QrCode size={20} className="text-emerald-500" />,
    features: ['High-res QR export', 'No replacements needed', 'Works on any smartphone']
  },
  {
    num: '04',
    title: 'Share your link everywhere',
    desc: 'Turn online traffic into footfall. Put your unique menu link on your Instagram bio, Google Business page, and WhatsApp to capture every customer.',
    img: '/images/step4.png',
    tag: 'Social Ready',
    icon: <Share2 size={20} className="text-blue-500" />,
    features: ['Instagram integration', 'Google Maps ready', 'One-click sharing']
  },
];

const featuresList = [
  {
    icon: <Globe size={24} />,
    title: 'Your own subdomain',
    desc: 'Get yourname.whereismymenu.com instantly.',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    icon: <Search size={24} />,
    title: 'Smart Search & Filters',
    desc: 'Customers easily find what they crave.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: <RefreshCw size={24} />,
    title: 'Real-time updates',
    desc: 'Change prices or sold-out items instantly.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: <QrCode size={24} />,
    title: 'Persistent table QRs',
    desc: 'Never reprint QRs. They auto-update.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: <Share2 size={24} />,
    title: 'Social media growth',
    desc: 'Share effortlessly on all social channels.',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    icon: <Link2 size={24} />,
    title: 'Custom private domain',
    desc: 'Scale up and link your own .com or .in.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Owner, Spice Route Café',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    text: 'I set up my full menu page in 10 minutes. Now I just share my WhereIsMyMenu link on Instagram and customers see everything — menu, photos, prices.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Manager, The Green Table',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    text: 'The QR code on our tables is a game changer. When we change the menu, the QR automatically shows the updated version. No reprinting ever.',
    rating: 5,
  },
  {
    name: 'Amir Khan',
    role: 'Owner, Nawab Biryani House',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    text: '₹99 per month is honestly nothing compared to what we used to spend on printed menu books. And our page looks incredibly professional.',
    rating: 5,
  },
];

/* ─────────────────────────────────────────────
   ANIMATION WRAPPERS
───────────────────────────────────────────── */

const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

const RevealImage = ({ src, alt, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
  </motion.div>
);

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

const HomePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user } = useAuth();

  // Monitor scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-orange-200 overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="bg-gradient-to-tr from-orange-500 to-rose-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
              <ChefHat size={18} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-slate-900">WhereIsMyMenu</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600"
          >
            <a href="#how-it-works" className="hover:text-orange-500 transition-colors">How it works</a>
            <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-4"
          >
            {!user && (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
                <Link to="/register" className="text-sm font-bold bg-slate-900 text-white hover:bg-orange-500 px-6 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md">
                  Start Free Trial
                </Link>
              </>
            )}
          </motion.div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-900">
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl">
            <div className="px-5 py-6 space-y-4 flex flex-col">
              {['How it works', 'Features', 'Pricing'].map(label => (
                <a key={label} href={`#${label.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileOpen(false)}
                  className="text-lg font-semibold tracking-tight text-slate-800 pb-2 border-b border-slate-100">{label}</a>
              ))}
              <div className="pt-2"></div>
              <Link to="/login" className="text-center font-bold text-slate-700 border border-slate-200 py-3 rounded-xl">Log in</Link>
              <Link to="/register" className="text-center font-bold bg-orange-500 text-white py-3 rounded-xl shadow-md">
                Get started free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Soft elegant background glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-100 to-rose-50 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"
        />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-50 to-emerald-50 rounded-full blur-[100px] pointer-events-none opacity-60 -translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left Text */}
          <div className="flex-1 text-center lg:text-left pt-6 lg:pt-0">
            <FadeUp delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold mb-6 shadow-sm mx-auto lg:mx-0">
                <Sparkles size={14} className="text-orange-500" />
                Trusted by 2,400+ restaurants
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
                The digital menu <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                  your restaurant deserves.
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 font-medium">
                Give your guests an incredible, app-free dining experience.
                Upload dishes, get a beautiful QR code, share your link seamlessly, and transform how people order.
              </p>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-xl hover:-translate-y-0.5">
                  Create your page free
                  <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-sm">
                  See how it works
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.5}>
              <div className="flex items-center justify-center lg:justify-start gap-4 mt-8 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> No credit card needed</span>
                <span className="hidden sm:flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Cancel anytime</span>
              </div>
            </FadeUp>
          </div>

          {/* Right Hero Image */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative mt-10 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{ perspective: 1000 }}
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-slate-200 bg-white group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] transition-shadow duration-700">
                <img
                  src="/images/hero.png"
                  alt="Restaurant owner setting up digital menu"
                  className="w-full h-[400px] lg:h-[520px] object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Floating Element - Live Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute bottom-6 left-6 right-6 lg:left-8 lg:right-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-100"
                >
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Live Preview</p>
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <code className="text-sm font-bold text-slate-800">spiceroute.whereismymenu.com</code>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─── HOW IT WORKS (Zigzag Layout with Scroll Revel Animations) ─── */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-white relative z-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <FadeUp className="text-center mb-16 lg:mb-24">
            <div className="text-orange-500 font-bold tracking-widest text-xs uppercase mb-3 text-center">How it works</div>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
              Live in minutes. Truly.
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              Four incredibly simple steps to transform how your guests discover and order your food. Zero technical skills required.
            </p>
          </FadeUp>

          <div className="space-y-24 lg:space-y-32">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-20`}>

                  {/* Image Side */}
                  <div className="w-full lg:w-1/2 relative group px-2 lg:px-0">
                    <div className="absolute inset-0 bg-slate-100 rounded-[2.5rem] transform translate-y-4 translate-x-4 -z-10 transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6" />
                    <RevealImage
                      src={step.img}
                      alt={step.title}
                      className="rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 aspect-square sm:aspect-video lg:aspect-square relative bg-white"
                    />

                    {/* Floating badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="absolute top-6 left-6 bg-white/95 backdrop-blur-md shadow-xl border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                      {step.icon}
                      <span className="font-bold text-sm text-slate-900">{step.tag}</span>
                    </motion.div>
                  </div>

                  {/* Text Side */}
                  <div className="w-full lg:w-1/2">
                    <FadeUp delay={0.1}>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 font-extrabold text-lg mb-6 border border-orange-100 shadow-sm">
                        {step.num}
                      </div>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                      <h3 className="text-3xl font-extrabold tracking-tight mb-5 text-slate-900">{step.title}</h3>
                    </FadeUp>
                    <FadeUp delay={0.3}>
                      <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    </FadeUp>

                    <div className="space-y-4">
                      {step.features.map((feat, j) => (
                        <FadeUp key={j} delay={0.4 + (j * 0.1)}>
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 p-1.5 rounded-full">
                              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                            </div>
                            <span className="text-slate-700 font-semibold">{feat}</span>
                          </div>
                        </FadeUp>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── FEATURES GRID / BENTO BOX STYLE ─── */}
      <section id="features" className="py-20 lg:py-32 bg-slate-50 relative z-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <FadeUp className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-5 text-slate-900">Built for simplicity.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Everything you need to give your customers a superior dining experience, beautifully packaged in an intuitive dashboard.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((f, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="p-8 rounded-[2rem] bg-white border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border shadow-sm transition-transform duration-300 group-hover:scale-110 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-3 text-slate-900">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 lg:py-32 bg-white relative z-10 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <FadeUp className="text-center mb-16 lg:mb-20">
            <div className="text-orange-500 font-bold tracking-widest text-xs uppercase mb-3 text-center">Transparent Pricing</div>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">Simple and affordable.</h2>
            <p className="text-slate-500 text-lg font-medium">No hidden fees. One clear subscription gives you everything.</p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">

            {/* Standard Tier */}
            <FadeUp delay={0.1}>
              <div className="rounded-[2.5rem] bg-slate-900 text-white p-10 shadow-2xl relative overflow-hidden flex flex-col h-full transform transition-transform duration-500 hover:scale-105 z-10 border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-rose-500 rounded-bl-full pointer-events-none opacity-20" />

                <div className="mb-4 inline-flex">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                    <Zap size={12} /> Standard
                  </span>
                </div>
                <h3 className="text-5xl font-extrabold tracking-tight mt-2 mb-2 text-white">₹99</h3>
                <p className="text-slate-400 font-medium mb-10 pb-6 border-b border-slate-800 text-sm">per month</p>

                <ul className="space-y-4 mb-10 flex-grow">
                  {[
                    'Free custom URL (brand.whereismymenu.com)',
                    'Unlimited menu items & pictures',
                    'Dietary tags & fast search',
                    'Print-ready table QR code',
                    'Priority email support'
                  ].map((item, i) => (
                    <li key={i} className="flex flex-start gap-4 text-slate-300 font-semibold text-sm">
                      <CheckCircle2 size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/register" className="flex items-center justify-center w-full bg-white hover:bg-slate-200 text-slate-900 py-4 rounded-xl font-bold text-base transition-all shadow-md mt-auto">
                  Start 14-day free trial
                </Link>
              </div>
            </FadeUp>

            {/* Custom Domain Tier */}
            <FadeUp delay={0.2}>
              <div className="rounded-[2.5rem] bg-white border border-slate-200 p-10 flex flex-col h-full hover:border-slate-300 hover:shadow-xl transition-all duration-300">
                <div className="mb-4 inline-flex">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-slate-200">
                    <Globe size={12} /> Custom Domain
                  </span>
                </div>
                <h3 className="text-4xl font-extrabold tracking-tight mt-2 mb-2 text-slate-900">Your Domain</h3>
                <p className="text-slate-500 font-medium mb-10 pb-6 border-b border-slate-100 text-sm">₹99/mo + domain registrar fees</p>

                <p className="text-slate-600 mb-6 leading-relaxed flex-grow text-sm font-medium">
                  Want to use <strong>yourrestaurant.com</strong>? We can hook our menu exactly to it.
                  You pay the standard ₹99/month, plus whatever your domain registrar charges for your specific name (usually ₹800/yr).
                </p>

                <ul className="space-y-4 mb-10">
                  <li className="flex flex-start gap-3 text-slate-700 font-semibold text-sm">
                    <ChevronRight size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Highly professional branding</span>
                  </li>
                  <li className="flex flex-start gap-3 text-slate-700 font-semibold text-sm">
                    <ChevronRight size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Full ownership of the domain</span>
                  </li>
                </ul>

                <Link to="/register" className="flex items-center justify-center w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 py-4 rounded-xl font-bold text-base transition-all mt-auto shadow-sm">
                  Enquire for details
                </Link>
              </div>
            </FadeUp>

          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="reviews" className="py-20 lg:py-32 bg-slate-50 relative z-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <FadeUp className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">Loved by restaurants.</h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} className="fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed mb-8 font-medium">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs font-semibold text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 lg:py-32 bg-slate-900 text-center border-t border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1)_0%,transparent_60%)] pointer-events-none" />
        <FadeUp className="max-w-3xl mx-auto px-5 relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 text-white leading-tight">
            Ready to delight <br /> your customers?
          </h2>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-0.5">
            Create your menu free
          </Link>
          <p className="mt-8 text-slate-400 font-semibold text-sm uppercase tracking-widest">Takes 4 minutes. Cancel anytime.</p>
        </FadeUp>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <ChefHat size={20} className="text-slate-900" />
            <span className="font-extrabold tracking-tight text-slate-900 text-[15px]">WhereIsMyMenu</span>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          </div>
          <p className="text-sm font-semibold text-slate-400">© {new Date().getFullYear()} WhereIsMyMenu</p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
