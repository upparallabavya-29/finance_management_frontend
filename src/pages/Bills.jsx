import { useState, useEffect } from 'react';
import { Receipt, Plus, Calendar, Trash2, Edit2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { billService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Bills = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        due_date: '',
        is_recurring: false
    });

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const { data } = await billService.getBills();
            setBills(data.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await billService.createBill(formData);
            setIsModalOpen(false);
            setFormData({ title: '', amount: '', due_date: '', is_recurring: false });
            fetchBills();
        } catch (error) {
            console.error('Error creating bill:', error);
        }
    };

    const toggleStatus = async (bill) => {
        try {
            const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
            await billService.updateBill(bill.id, { status: newStatus });
            fetchBills();
        } catch (error) {
            console.error('Error updating bill status:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                await billService.deleteBill(id);
                fetchBills();
            } catch (error) {
                console.error('Error deleting bill:', error);
            }
        }
    };

    const getStatusInfo = (bill) => {
        if (bill.status === 'paid') return { label: 'Paid', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle };

        const dueDate = new Date(bill.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate < today) return { label: 'Overdue', color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10', icon: AlertCircle };
        return { label: 'Pending', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10', icon: Clock };
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Bill Reminders
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Never miss a payment with automated tracking</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-lg hover:shadow-rose-500/30 font-medium whitespace-nowrap"
                >
                    <Plus size={20} />
                    <span>Add New Bill</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                </div>
            ) : bills.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="bg-rose-50 dark:bg-rose-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Receipt className="text-rose-600 dark:text-rose-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No bills added yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Start tracking your upcoming expenses!</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                    >
                        Add Your First Bill
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bills.map((bill) => {
                        const statusInfo = getStatusInfo(bill);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={bill.id} className="group bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusInfo.color}`}>
                                        <StatusIcon size={14} />
                                        {statusInfo.label}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(bill.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{bill.title}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1">
                                            <Calendar size={14} />
                                            <span>Due: {new Date(bill.due_date).toLocaleDateString()}</span>
                                            {bill.is_recurring && (
                                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] rounded-md font-bold uppercase tracking-wider">Recurring</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white">₹{bill.amount.toLocaleString()}</span>
                                        <button
                                            onClick={() => toggleStatus(bill)}
                                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${bill.status === 'paid'
                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    : 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700'
                                                }`}
                                        >
                                            {bill.status === 'paid' ? 'Mark Pending' : 'Mark as Paid'}
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
                    <div className="relative bg-white dark:bg-slate-900 rounded-[40px] p-8 w-full max-w-lg shadow-2xl border border-white/10 glass">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add New Bill</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Bill Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Rent, Electricity, Internet"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-rose-500 outline-none transition-all dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Amount (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-rose-500 outline-none transition-all dark:text-white"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">Due Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-rose-500 outline-none transition-all dark:text-white"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-1">
                                <input
                                    type="checkbox"
                                    id="is_recurring"
                                    className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 bg-slate-50 dark:bg-slate-800 border-none"
                                    checked={formData.is_recurring}
                                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                                />
                                <label htmlFor="is_recurring" className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">This is a recurring bill</label>
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
                                    className="flex-1 px-6 py-3.5 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 hover:bg-rose-700 transition-all"
                                >
                                    Save Bill
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bills;
