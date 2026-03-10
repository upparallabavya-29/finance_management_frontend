import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Simulated password reset call
            if (resetPassword) {
                await resetPassword(email);
            } else {
                // Fallback timeout simulation if AuthContext not yet updated
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            setIsSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f5f8] px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden relative">

                {/* Back Button */}
                <Link to="/login" className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors z-20 flex items-center gap-2 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                {/* Header */}
                <div className="bg-[#0c2420] px-8 pt-16 pb-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl"></div>

                    <h2 className="mt-4 text-2xl font-bold text-white relative z-10">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-400 relative z-10">Enter your email to receive reset instructions.</p>
                </div>

                {/* Content Section */}
                <div className="px-8 py-10">
                    {isSubmitted ? (
                        <div className="text-center animate-in fade-in zoom-in duration-500 py-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                                We sent a password reset link to <br />
                                <span className="font-bold text-gray-700">{email}</span>
                            </p>
                            <Link
                                to="/login"
                                className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-[0.98]"
                            >
                                Return to Log in
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6 animate-in fade-in duration-500" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
                                    {error}
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#0c2420] hover:bg-[#15322d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
