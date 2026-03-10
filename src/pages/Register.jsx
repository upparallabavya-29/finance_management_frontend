import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validatePassword = (pass) => {
        const rules = [
            { test: /.{8,}/, message: 'Password must be at least 8 characters long.' },
            { test: /[A-Z]/, message: 'Password must contain at least one uppercase letter (A-Z).' },
            { test: /[a-z]/, message: 'Password must contain at least one lowercase letter (a-z).' },
            { test: /[0-9]/, message: 'Password must contain at least one number (0-9).' },
            { test: /[@$!%*?&]/, message: 'Password must contain at least one special character (@$!%*?&).' },
        ];

        for (let rule of rules) {
            if (!rule.test.test(pass)) {
                return rule.message;
            }
        }
        return null; // Valid
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setIsLoading(true);
        try {
            await register({ firstName, lastName, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create an account');
        } finally {
            setIsLoading(false);
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
                    <h2 className="mt-4 text-xl font-bold text-white relative z-10">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-400 relative z-10">Join today and take control of your wealth.</p>
                </div>

                {/* Form Section */}
                <div className="px-8 py-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50 transition-all font-medium"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50 transition-all font-medium"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Secure Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#0c2420] hover:bg-[#15322d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-[0.98]"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
