import React, { useState } from 'react';
import { Eye, EyeOff, ChefHat, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loginContext } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
        const response = await dispatch(loginUser(formData)).unwrap();
        console.log('Login attempt', response);
        
        // Once successfully logged in via Redux, store the authenticated user in our Context
        if (response && response.user) {
            toast.success("Successfully logged in!");
            loginContext(response.user);
            navigate('/dashboard');
        }
    } catch (err) {
        // Error is caught by Redux and stored in auth state
        toast.error(err.detail || err.message || "Invalid credentials");
    } finally {
        setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/60 via-slate-50 to-slate-100 p-4 font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[10%] left-[20%] w-96 h-96 rounded-full bg-orange-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-96 h-96 rounded-full bg-rose-400/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[380px] relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 mb-4 transition-transform hover:scale-105">
            <ChefHat className="text-orange-500 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">Ready to manage your menu?</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-7 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
          
            {/* Interactive Floating Label Input */}
            <div className="relative group">
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="block pl-3 pr-3 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 peer transition-all shadow-sm"
                placeholder=" "
              />
              <label
                htmlFor="identifier"
                className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text"
              >
                Email or Username
              </label>
            </div>

            {/* Interactive Floating Label Input */}
            <div className="relative group">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="block pl-3 pr-10 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 peer transition-all shadow-sm"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text"
              >
                Password
              </label>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className="text-[13px] font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="group relative w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-white font-semibold text-sm bg-orange-600 hover:bg-orange-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Sign In
                        <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-[13px] text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-800 hover:text-orange-600 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
