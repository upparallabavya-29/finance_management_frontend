import { useState, useEffect } from 'react';
import { Landmark, Plus, Calendar, Trash2, Edit2, AlertCircle, TrendingDown, Percent } from 'lucide-react';
import { debtService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Debts = () => {
    const { user } = useAuth();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        total_amount: '',
        balance: '',
        interest_rate: '',
        due_date: ''
    });

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            const { data } = await debtService.getDebts();
            setDebts(data.data);
        } catch (error) {
            console.error('Error fetching debts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await debtService.createDebt(formData);
            setIsModalOpen(false);
            setFormData({ title: '', total_amount: '', balance: '', interest_rate: '', due_date: '' });
            fetchDebts();
        } catch (error) {
            console.error('Error creating debt:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await debtService.deleteDebt(id);
                fetchDebts();
            } catch (error) {
                console.error('Error deleting debt:', error);
            }
        }
    };

    const calculatePaid = (total, balance) => {
        const paid = total - balance;
        return Math.max(0, Math.min(Math.round((paid / total) * 100), 100));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Debt Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your liabilities and plan your path to freedom</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl transition-all shadow-lg hover:shadow-slate-500/30 font-medium whitespace-nowrap"
                >
                    <Plus size={20} />
                    <span>Add Debt</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
            ) : debts.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-100 dark:bg-slate-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
                        <Landmark className="text-slate-600 dark:text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No active debts</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">You're currently debt-free according to our records!</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                    >
                        Add Debt Record
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {debts.map((debt) => {
                        const progress = calculatePaid(debt.total_amount, debt.balance);

                        return (
                            <div key={debt.id} className="group bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-900 dark:text-white border border-slate-100 dark:border-white/5">
                                        <TrendingDown size={24} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(debt.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{debt.title}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                <Percent size={14} className="text-slate-400" />
                                                <span>{debt.interest_rate}% Interest</span>
                                            </div>
                                            {debt.due_date && (
                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span>Due: {new Date(debt.due_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Repaid: {progress}%</span>
                                            <span className="text-slate-900 dark:text-white font-bold">₹{debt.balance.toLocaleString()} remaining</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-slate-900 dark:bg-white transition-all duration-1000 ease-out rounded-full"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Total Principal</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">₹{debt.total_amount.toLocaleString()}</p>
                                        </div>
                                        <button
                                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                        >
                                            Add Payment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[40px] p-8 w-full max-w-lg shadow-2xl border border-white/10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add Debt Record</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Debt Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Home Loan, Credit Card, Personal Loan"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-500 outline-none transition-all dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Total Principal (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-500 outline-none transition-all dark:text-white"
                                        value={formData.total_amount}
                                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Current Balance (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-500 outline-none transition-all dark:text-white"
                                        value={formData.balance}
                                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-500 outline-none transition-all dark:text-white"
                                        value={formData.interest_rate}
                                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-500 outline-none transition-all dark:text-white"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-90 transition-all"
                                >
                                    Add Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Debts;
