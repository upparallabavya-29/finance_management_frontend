import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/api';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, PieChart, Calendar } from 'lucide-react';

const Budgets = () => {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [category, setCategory] = useState('Food & Dining');
    const [limitAmount, setLimitAmount] = useState('');
    const [period, setPeriod] = useState('monthly');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const CATEGORIES = [
        'Food & Dining', 'Housing', 'Transportation',
        'Entertainment', 'Shopping', 'Health & Fitness',
        'Utilities', 'Personal Care', 'Education', 'Other'
    ];

    const fetchBudgets = async () => {
        try {
            const res = await budgetService.getBudgets();
            setBudgets(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching budgets (API):', error);
            setBudgets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await budgetService.createBudget({
                category,
                limit_amount: parseFloat(limitAmount),
                period,
                user_id: user?.id
            });

            // Reset form and close modal
            setCategory('Food & Dining');
            setLimitAmount('');
            setPeriod('monthly');
            setIsModalOpen(false);

            // Refresh budgets list
            fetchBudgets();
        } catch (err) {
            console.error('Failed to create budget via Supabase:', err);
            setError(err.message || 'Failed to create budget');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Budgets</h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">Control your spending and stick to your limits.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4" />
                    New Budget
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.length === 0 ? (
                        <div className="col-span-full bg-white dark:bg-slate-900 shadow rounded-xl p-8 text-center border border-dashed border-slate-300 dark:border-white/10">
                            <PieChart className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-gray-300 mb-1">No budgets set yet</h3>
                            <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">Create your first budget to start managing your expenses.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
                            >
                                + Create a Budget
                            </button>
                        </div>
                    ) : (
                        budgets.map(budget => {
                            const spent = budget.spent_amount || 0;
                            const limit = budget.amount; // Changed from limit_amount
                            const progress = limit > 0 ? (spent / limit) * 100 : 0;
                            const isOverBudget = progress > 100;
                            const isNearLimit = progress > 85 && !isOverBudget;

                            let barColor = 'bg-emerald-500 dark:bg-emerald-400';
                            if (isOverBudget) barColor = 'bg-rose-500 dark:bg-rose-400';
                            else if (isNearLimit) barColor = 'bg-amber-500 dark:bg-amber-400';

                            return (
                                <div key={budget.id} className="bg-white dark:bg-slate-900 shadow rounded-xl p-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                                <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{budget.categories?.name || 'Category'}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 mt-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Ends {new Date(budget.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-6">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className={isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-gray-300'}>
                                                ${spent.toFixed(2)}
                                            </span>
                                            <span className="text-slate-500 dark:text-gray-500">/ ${limit.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-medium">
                                            <span className={isOverBudget ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-gray-400'}>
                                                {progress.toFixed(1)}% Used
                                            </span>
                                            <span className={isOverBudget ? 'text-rose-500 dark:text-rose-400 font-bold' : 'text-slate-400'}>
                                                {isOverBudget ? `Over by $${(spent - limit).toFixed(2)}` : `$${(limit - spent).toFixed(2)} left`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* Create Budget Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Budget</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Limit Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={limitAmount}
                                    onChange={(e) => setLimitAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-slate-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Period</label>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Create Budget'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
