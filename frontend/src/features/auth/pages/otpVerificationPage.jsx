import React, { useState, useEffect } from 'react';
import { ChefHat, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyOtp, resendOtp } from '../store/authSlice';
import toast from 'react-hot-toast';

const OTPPage = () => {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [expired, setExpired] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const email = location.state?.email || localStorage.getItem("otp_email");

    // ✅ Save email safely
    useEffect(() => {
        if (location.state?.email) {
            localStorage.setItem("otp_email", location.state.email);
        }
    }, [location.state]);

    // ✅ Save expiry (MOVE INSIDE useEffect — IMPORTANT)
    useEffect(() => {
        if (location.state?.otpExpiry) {
            localStorage.setItem("otp_expiry",location.state.otpExpiry.toString());
        }
    }, [location.state]);

    // ❌ Prevent access without email
    useEffect(() => {
        if (!email) {
            toast.error("Session expired. Please register again.");
            navigate('/register');
        }
    }, [email, navigate]);

    // ✅ INIT TIMER
    useEffect(() => {
        let expiry = localStorage.getItem("otp_expiry");

        if (!expiry) {
            const newExpiry = Date.now() + 5 * 60 * 1000;
            localStorage.setItem("otp_expiry", newExpiry.toString());
            expiry = newExpiry;
        } else {
            expiry = parseInt(expiry);
        }

        const remaining = Math.floor((expiry - Date.now()) / 1000);

        if (remaining <= 0) {
            setExpired(true);
            setTimeLeft(0);
            localStorage.removeItem("otp_expiry");
        } else {
            setTimeLeft(remaining);
        }
    }, []);

    // ✅ COUNTDOWN
    useEffect(() => {
        const timer = setInterval(() => {
            const expiryRaw = localStorage.getItem("otp_expiry");
            if (!expiryRaw) return;

            const expiry = parseInt(expiryRaw);
            const remaining = Math.floor((expiry - Date.now()) / 1000);

            if (remaining <= 0) {
                setTimeLeft(0);
                setExpired(true);
                localStorage.removeItem("otp_expiry");
                clearInterval(timer);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // ✅ VERIFY OTP
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (expired) {
            toast.error("OTP expired. Please resend.");
            return;
        }

        if (otp.length !== 6) {
            toast.error("Enter valid 6-digit OTP");
            return;
        }

        setIsVerifying(true);

        try {
            await dispatch(verifyOtp({ email, otp })).unwrap();

            toast.success("OTP Verified!");

            localStorage.removeItem("otp_expiry");
            localStorage.removeItem("otp_email");

            navigate('/login');

        } catch (err) {
            console.log(err)
        } finally {
            setIsVerifying(false);
        }
    };

    // 🔁 RESEND OTP
    const handleResend = async () => {
        try {
            const response = await dispatch(resendOtp({ email })).unwrap();
            localStorage.setItem(
                "otp_expiry",response.otpExpiry.toString()
            );

            toast.success("OTP Resent");

            setTimeLeft(300);
            setExpired(false);

        } catch (err) {
            toast.error(
                err?.detail ||
                err?.error ||
                "Failed to resend OTP"
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/60 via-slate-50 to-slate-100 p-4 relative overflow-hidden">

            <div className="absolute top-[10%] left-[20%] w-96 h-96 rounded-full bg-orange-400/20 blur-[100px]" />
            <div className="absolute bottom-[10%] right-[20%] w-96 h-96 rounded-full bg-rose-400/10 blur-[100px]" />

            <div className="w-full max-w-[380px] relative z-10">

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border mb-4">
                        <ChefHat className="text-orange-500 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800">
                        Verify OTP
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Enter the code sent to your email
                    </p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-7 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="relative group">
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="block pl-3 pr-3 pb-2 pt-5 w-full text-sm text-slate-900 bg-white/80 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm text-center tracking-widest"
                                placeholder="Enter OTP"
                                required
                            />
                        </div>

                        <div className="text-center text-sm text-slate-500">
                            {expired ? (
                                <span className="text-red-500 font-semibold">
                                    OTP expired
                                </span>
                            ) : (
                                <>
                                    Expires in{" "}
                                    <span className="font-semibold text-orange-600">
                                        {formatTime()}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={!expired}
                                className={`text-[13px] font-semibold ${expired
                                        ? "text-orange-600 hover:text-orange-500"
                                        : "text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Resend OTP
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying || expired}
                            className="group relative w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-white font-semibold text-sm bg-orange-600 hover:bg-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] disabled:opacity-70"
                        >
                            {isVerifying ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Verify OTP
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1" />
                                </>
                            )}
                        </button>

                    </form>

                    <p className="mt-6 text-center text-[13px] text-slate-500">
                        Didn’t receive OTP?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-slate-800 hover:text-orange-600"
                        >
                            Try again
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPPage;