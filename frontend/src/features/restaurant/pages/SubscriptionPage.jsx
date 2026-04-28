import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../api/api';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/restaurant/subscription/plans/')
      .then(res => setPlans(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async (planId) => {
    setProcessing(true);
    try {
      const res = await api.post('/restaurant/payments/create-order/', { planId });
      const { orderId, amount, currency, keyId, planName } = res.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "WhereIsMyMenu",
        description: `Subscription for ${planName}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await api.post('/restaurant/payments/verify/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess(true);
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        theme: {
          color: "#f97316",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 p-12 text-center relative overflow-hidden"
        >
          {/* Confetti effect background (simplified) */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-emerald-400" />
          
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Check size={48} strokeWidth={3} />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Congratulations!</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-10">
            Your payment was successful and your subscription is now active. Your digital menu is live and ready for customers!
          </p>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Zap size={14} /> Pricing Plans
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Upgrade your Menu Experience
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            Choose a plan that fits your restaurant. Experience the best way to serve your customers digitally.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
            >
              {idx === 1 && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-bl-xl tracking-wider">
                  Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                <span className="text-slate-400 text-sm font-bold mb-1">/{plan.duration_days === 30 ? 'mo' : plan.duration_days === 365 ? 'yr' : `${plan.duration_days} days`}</span>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-100 p-0.5 rounded-full">
                      <Check className="text-emerald-500" size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={processing}
                onClick={() => handlePayment(plan.id)}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 ${idx === 1 ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-100'}`}
              >
                {processing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Select Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Secure Payment</h4>
            <p className="text-xs text-slate-400">SSL encrypted secure checkout through Razorpay</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Instant Activation</h4>
            <p className="text-xs text-slate-400">Your subscription is active immediately after payment</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <CreditCard size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Easy Renewal</h4>
            <p className="text-xs text-slate-400">Manage your subscription easily from the dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
