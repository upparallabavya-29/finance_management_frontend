import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [slowMsg, setSlowMsg] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSlowMsg('');
        setLoading(true);
        const slowTimer = setTimeout(() => setSlowMsg('Server is waking up, please wait 30s...'), 3000);
        try {
            await login(email, password);
            clearTimeout(slowTimer);
            navigate('/');
        } catch (err) {
            clearTimeout(slowTimer);
            setError(err.response?.data?.message || err.message || 'Failed to login');
        } finally {
            setLoading(false);
            setSlowMsg('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f5f8] px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Header Profile */}
                <div className="bg-[#0c2420] px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl"></div>
                    <span className="text-3xl font-bold text-white tracking-wide flex items-center justify-center z-10 relative">
                        <span className="text-emerald-400 mr-2">Personal</span>Finance
                    </span>
                    <h2 className="mt-4 text-xl font-bold text-white relative z-10">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-400 relative z-10">Log in to manage your finances securely.</p>
                </div>

                {/* Form Section */}
                <div className="px-8 py-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
                                {error}
                            </div>
                        )}
                        {slowMsg && (
                            <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm text-center font-medium animate-pulse">
                                ⏳ {slowMsg}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50 transition-all font-medium"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Password</label>
                                <Link to="/forgot-password" className="font-semibold text-sm text-emerald-600 hover:text-emerald-500 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#0c2420] hover:bg-[#15322d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Logging in...
                                    </>
                                ) : 'Log in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
