import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ChefHat, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetAuthState } from '../store/authSlice';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error, success } = useSelector((state) => state.auth);
    const [isRegistering, setIsRegistering] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: ''
    });
    const [localErrors, setLocalErrors] = useState({});

    // Reset auth state on mount/unmount
    useEffect(() => {
        dispatch(resetAuthState());
        return () => dispatch(resetAuthState());
    }, [dispatch]);

    // Handle successful registration
    // useEffect(() => {
    //     if (success) {
    //         toast.success("Registration successful! Please verify your email.");
    //         navigate('/otp-verification', { state: { email: formData.email } });
    //     }
    // }, [success, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear errors when user types
        if (localErrors[e.target.name]) {
            setLocalErrors({ ...localErrors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Client-side validation mirroring backend
        if (formData.firstName.trim().length < 2 || !/^[a-zA-Z\s\-]+$/.test(formData.firstName)) {
            newErrors.firstName = "Must be at least 2 characters (letters only)";
        }

        if (formData.lastName.trim().length < 2 || !/^[a-zA-Z\s\-]+$/.test(formData.lastName)) {
            newErrors.lastName = "Must be at least 2 characters (letters only)";
        }

        if (formData.username.length < 4 || formData.username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "4-20 chars (letters, numbers, _ only)";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (formData.password.length < 8 || !/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
            newErrors.password = "Min 8 chars, 1 letter, 1 number";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords match failed";
        }

        if (Object.keys(newErrors).length > 0) {
            setLocalErrors(newErrors);
            toast.error("Please fix the errors in the form.", { id: 'register-validation-error' });
            return;
        }

        setIsRegistering(true);
        try {
            const response = await dispatch(registerUser(formData)).unwrap();
            toast.success("Registration successful! Please verify your email.");
            navigate('/otp-verification', { state: { email: formData.email, otpExpiry: response.otpExpiry } });
        } catch (err) {
            // Error is handled by Redux state, we just need to catch to avoid unhandled promise rejection
        } finally {
            setIsRegistering(false);
        }
    };

    // Helper to get error message for a field
    const getFieldError = (fieldName) => {
        return localErrors[fieldName] || (error && error[fieldName] && error[fieldName][0]);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50/80 via-slate-50 to-slate-100 p-4 font-sans relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-rose-400/15 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[460px] relative z-10 my-8">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 mb-4 transition-transform hover:scale-105">
                        <ChefHat className="text-orange-500 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
                    <p className="text-slate-500 text-sm mt-1">Setup your digital menu in minutes</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-7 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Global Error Message */}
                        {error && error.detail && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
                                {error.detail}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative group">
                                <input
                                    id="firstName" name="firstName" type="text" required
                                    value={formData.firstName} onChange={handleChange}
                                    className={`block pl-3 pr-3 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border ${getFieldError('firstName') ? 'border-rose-300 ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'} appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm peer`}
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text">
                                    First Name
                                </label>
                                {getFieldError('firstName') && <p className="mt-1 text-[10px] font-semibold text-rose-500 pl-1">{getFieldError('firstName')}</p>}
                            </div>
                            <div className="relative group">
                                <input
                                    id="lastName" name="lastName" type="text" required
                                    value={formData.lastName} onChange={handleChange}
                                    className={`block pl-3 pr-3 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border ${getFieldError('lastName') ? 'border-rose-300 ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'} appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm peer`}
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text">
                                    Last Name
                                </label>
                                {getFieldError('lastName') && <p className="mt-1 text-[10px] font-semibold text-rose-500 pl-1">{getFieldError('lastName')}</p>}
                            </div>
                        </div>

                        <div className="relative group">
                            <input
                                id="username" name="username" type="text" required
                                value={formData.username} onChange={handleChange}
                                className={`block pl-3 pr-3 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border ${getFieldError('username') ? 'border-rose-300 ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'} appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm peer`}
                                placeholder=" "
                            />
                            <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text">
                                Username
                            </label>
                            {getFieldError('username') && (
                                <p className="mt-1 text-[10px] font-semibold text-rose-500 pl-1">{getFieldError('username')}</p>
                            )}
                        </div>

                        <div className="relative group">
                            <input
                                id="email" name="email" type="email" required
                                value={formData.email} onChange={handleChange}
                                className={`block pl-3 pr-3 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border ${getFieldError('email') ? 'border-rose-300 ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'} appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm peer`}
                                placeholder=" "
                            />
                            <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text">
                                Email
                            </label>
                            {getFieldError('email') && (
                                <p className="mt-1 text-[10px] font-semibold text-rose-500 pl-1">{getFieldError('email')}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="relative group">
                                    <input
                                        id="password" name="password" type={showPassword ? 'text' : 'password'} required
                                        value={formData.password} onChange={handleChange}
                                        className={`block pl-3 pr-10 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border ${getFieldError('password') ? 'border-rose-300 ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'} appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm peer`}
                                        placeholder=" "
                                    />
                                    <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text">
                                        Password
                                    </label>
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-orange-500 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {getFieldError('password') && (
                                    <p className="mt-1 text-[10px] font-semibold text-rose-500 pl-1">{getFieldError('password')}</p>
                                )}
                            </div>

                            <div>
                                <div className="relative group">
                                    <input
                                        id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                                        value={formData.confirmPassword} onChange={handleChange}
                                        className={`block pl-3 pr-10 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border ${getFieldError('confirmPassword') ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'} appearance-none focus:outline-none focus:ring-2 peer transition-all shadow-sm`}
                                        placeholder=" "
                                    />
                                    <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-[0.85] top-3.5 z-10 origin-[0] left-3 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-3 pointer-events-none cursor-text">
                                        Confirm Password
                                    </label>
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-orange-500 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {getFieldError('confirmPassword') && (
                                    <p className="mt-1 text-[10px] font-semibold text-rose-500 pl-1">{getFieldError('confirmPassword')}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isRegistering}
                                className="group relative w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-white font-semibold text-sm bg-orange-600 hover:bg-orange-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                            >
                                {isRegistering ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-[13px] text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-slate-800 hover:text-orange-600 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
