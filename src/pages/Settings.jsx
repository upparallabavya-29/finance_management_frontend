import React, { useState, useEffect } from 'react';

const Settings = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'System');
    const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Apply theme immediately on change to index.html
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'System') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else if (theme === 'Dark Mode') {
            root.classList.add('dark');
        } else {
            root.classList.add('light');
        }
    }, [theme]);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate an API call
        setTimeout(() => {
            localStorage.setItem('theme', theme);
            localStorage.setItem('currency', currency);
            setIsSaving(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
        }, 800);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 font-bold text-sm animate-in fade-in slide-in-from-top-4 z-50 flex items-center gap-2 transition-all">
                    Settings saved successfully!
                </div>
            )}

            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Settings</h2>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Update your personal details and app preferences.</p>
            </div>

            <div className="glass-card rounded-[24px] p-6 md:p-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">Profile Preferences</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Theme</label>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                                    style={{ WebkitAppearance: 'none' }}
                                >
                                    <option value="System">System (Default)</option>
                                    <option value="Light Mode">Light Mode</option>
                                    <option value="Dark Mode">Dark Mode</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                                    style={{ WebkitAppearance: 'none' }}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-start">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:bg-blue-600 min-w-[150px] justify-center"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
