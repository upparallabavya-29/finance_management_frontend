import { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Calendar, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { savingsService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Goals = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        target_amount: '',
        current_amount: '',
        deadline: ''
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const { data } = await savingsService.getGoals();
            setGoals(data.data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await savingsService.createGoal(formData);
            setIsModalOpen(false);
            setFormData({ title: '', target_amount: '', current_amount: '', deadline: '' });
            fetchGoals();
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await savingsService.deleteGoal(id);
                fetchGoals();
            } catch (error) {
                console.error('Error deleting goal:', error);
            }
        }
    };

    const calculateProgress = (current, target) => {
        return Math.min(Math.round((current / target) * 100), 100);
    };

    const getSuggestion = (goal) => {
        if (!goal.deadline) return null;
        const deadlineDate = new Date(goal.deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);

        if (diffMonths <= 0) return "Deadline passed! Consider extending the target date.";

        const remaining = goal.target_amount - goal.current_amount;
        if (remaining <= 0) return "Goal achieved! Excellent work.";

        const monthlyNeeded = remaining / diffMonths;
        return `To reach your target, you need to save ₹${monthlyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} per month.`;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Savings Goals
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress and reach your financial milestones</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 font-medium whitespace-nowrap"
                >
                    <Plus size={20} />
                    <span>New Goal</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : goals.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target className="text-indigo-600 dark:text-indigo-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No goals set yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Start by setting your first savings goal!</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                    >
                        Create Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const progress = calculateProgress(goal.current_amount, goal.target_amount);
                        const suggestion = getSuggestion(goal);

                        return (
                            <div key={goal.id} className="group bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{goal.title}</h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">₹{goal.current_amount.toLocaleString()} saved</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{goal.target_amount.toLocaleString()}</span>
                                    </div>

                                    {/* Progress Bar Container */}
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-1000 ease-out rounded-full relative"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white">{progress}%</span>
                                        {goal.deadline && (
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                <Calendar size={14} />
                                                <span>By {new Date(goal.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Smart Suggestion */}
                                    {suggestion && (
                                        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                                <AlertCircle className="text-indigo-500 flex-shrink-0" size={16} />
                                                <span>{suggestion}</span>
                                            </div>
                                        </div>
                                    )}
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
                    <div className="relative bg-white dark:bg-slate-900 rounded-[40px] p-8 w-full max-w-lg shadow-2xl border border-white/10 glass">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Goal</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Goal Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. New Car, Vacation"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Target Amount (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        value={formData.target_amount}
                                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Initial Saving (Optional)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        value={formData.current_amount}
                                        onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Deadline (Optional)</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
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
                                    className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
                                >
                                    Start Saving
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;
