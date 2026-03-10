import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
    transactionService,
    categoryService
} from '../services/api';
import { exportToCSV } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Filter,
    Download,
    Plus,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Tag,
    Wallet
} from 'lucide-react';

const Transactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState('expense');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const CATEGORIES = {
        expense: ['Food & Dining', 'Housing', 'Transportation', 'Entertainment', 'Shopping', 'Health & Fitness', 'Utilities', 'Other'],
        income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
    };

    const fetchTransactions = async () => {
        try {
            const res = await transactionService.getTransactions();
            setTransactions(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching transactions (API):', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Create transaction via backend API
            await transactionService.createTransaction({
                description,
                amount: parseFloat(amount),
                category, // The backend handles category creation/mapping
                date,
                type
            });

            // Reset form
            setDescription('');
            setAmount('');
            setCategory(CATEGORIES[type][0]);
            setDate(new Date().toISOString().split('T')[0]);
            setType('expense');
            setIsModalOpen(false);

            // Refresh list dynamically
            fetchTransactions();
        } catch (err) {
            console.error('Failed to create transaction via Supabase:', err);
            setError(err.message || 'Failed to create transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-select first category when type changes if current category is invalid
    useEffect(() => {
        if (!CATEGORIES[type].includes(category)) {
            setCategory(CATEGORIES[type][0]);
        }
    }, [type]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Transactions</h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">Review your income and expense history.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => exportToCSV(transactions, 'transactions_report')}
                        className="flex justify-center items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Transaction
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wallet className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-gray-300 mb-1">No transactions found</h3>
                        <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">Start by adding your first income or expense.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
                        >
                            + Add Transaction
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-white/5">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400 capitalize">
                                            {tx.category_id ? 'Categorized' : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {tx.type === 'expense' ? (
                                                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                                                ) : (
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                                )}
                                                <span className={`text-sm font-bold ${tx.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Transaction</h3>
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

                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}`}
                                >
                                    <ArrowDownRight className="w-4 h-4" />
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}`}
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                    Income
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder-slate-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What was this for?"
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-slate-400"
                                />
                            </div>

// Replace only the parts modified
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    >
                                        {CATEGORIES[type].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    />
                                </div>
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
                                        'Save Transaction'
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

export default Transactions;
