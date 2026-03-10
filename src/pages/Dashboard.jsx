import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Target,
    MoreVertical,
    Calendar,
    ArrowRight,
    Landmark,
    ReceiptText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionService, budgetService, savingsService, billService, debtService } from '../services/api';
import { supabase } from '../services/supabase';

// Summary Card Component
const SummaryCard = ({ title, amount, change, icon: Icon, color, glowColor, onHide, onViewDetails, onEdit }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="glass-card rounded-[40px] p-10 relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 min-h-[240px] flex flex-col justify-center border-white/20 dark:border-white/10">
            <div className={`absolute -top-10 -right-10 w-40 h-40 blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-500`} style={{ backgroundColor: glowColor }}></div>
            <div className={`absolute -bottom-10 -left-10 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`} style={{ backgroundColor: glowColor }}></div>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-5 rounded-[22px] bg-white/10 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500 ${color}`}>
                    <Icon className="w-10 h-10" />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-40 glass-card rounded-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => onViewDetails && onViewDetails(title)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => onEdit && onEdit(title)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                Edit Widget
                            </button>
                            <div className="h-px bg-white/5 my-1"></div>
                            <button
                                onClick={() => onHide && onHide(title)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="w-full text-left px-4 py-2 text-[13px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                Hide
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-1 z-10 relative">
                <p className="text-sm font-black text-slate-500 dark:text-gray-400 tracking-[0.2em] uppercase mb-2">{title}</p>
                <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">${amount}</h3>
                <div className="flex items-center gap-1.5 pt-1">
                    <span className={`text-base font-bold ${change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {change}
                    </span>
                    <span className="text-[13px] text-gray-500 font-medium">from last month</span>
                </div>
            </div>
        </div>
    );
};

// Chart Container Component
const ChartWrapper = ({ title, children, subtitle, activeFilter = 'M', onFilterChange }) => (
    <div className="glass-card rounded-[24px] p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {onFilterChange && (
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                    {['W', 'M', 'Y'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => onFilterChange(filter)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${activeFilter === filter
                                ? 'bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/20'
                                : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white border border-transparent'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            )}
        </div>
        <div className="flex-1 min-h-[220px]">
            {children}
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Chart Filter States
    const [trendFilter, setTrendFilter] = useState('M');
    const [categoryFilter, setCategoryFilter] = useState('M');

    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [bills, setBills] = useState([]);
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const results = await Promise.allSettled([
                transactionService.getTransactions(),
                budgetService.getBudgets(),
                savingsService.getGoals(),
                billService.getBills(),
                debtService.getDebts()
            ]);

            const [transRes, budgetRes, goalRes, billRes, debtRes] = results;

            if (transRes.status === 'fulfilled') setTransactions(transRes.value.data?.data || []);
            else console.error('Error fetching transactions:', transRes.reason);

            if (budgetRes.status === 'fulfilled') {
                setBudgets(budgetRes.value.data?.data || []);
            } else console.error('Error fetching budgets:', budgetRes.reason);

            if (goalRes.status === 'fulfilled') setGoals(goalRes.value.data?.data || []);
            else console.error('Error fetching goals:', goalRes.reason);

            if (billRes.status === 'fulfilled') setBills(billRes.value.data?.data || []);
            else console.error('Error fetching bills:', billRes.reason);

            if (debtRes.status === 'fulfilled') setDebts(debtRes.value.data?.data || []);
            else console.error('Error fetching debts:', debtRes.reason);


        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const netSavings = totalIncome - totalExpenses;


    const summaries = [
        { title: 'Total Income', amount: totalIncome.toLocaleString(), change: '+0.0%', icon: ArrowUpRight, color: 'text-emerald-400', glowColor: '#10b981' },
        { title: 'Total Expenses', amount: totalExpenses.toLocaleString(), change: '-0.0%', icon: ArrowDownRight, color: 'text-rose-400', glowColor: '#ef4444' },
        { title: 'Net Savings', amount: netSavings.toLocaleString(), change: '+0.0%', icon: Wallet, color: 'text-blue-400', glowColor: '#3b82f6' },
    ];

    // Compute basic trend purely based on existing transactions
    const monthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 };
        if (t.type === 'income') acc[month].income += parseFloat(t.amount);
        if (t.type === 'expense') acc[month].expense += parseFloat(t.amount);
        return acc;
    }, {});
    const trendData = Object.values(monthlyData).length > 0 ? Object.values(monthlyData) : [
        { name: 'Jan', income: 0, expense: 0 }, { name: 'Feb', income: 0, expense: 0 }
    ];

    const categoryColors = ['#f43f5e', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6'];
    const catDataMap = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
        // Handle properly populated categories from backend, or fallback to 'Uncategorized'
        const catName = t.categories?.name || t.category_id || 'Uncategorized';
        // Capitalize category name for display
        const displayCatName = catName.charAt(0).toUpperCase() + catName.slice(1);
        acc[displayCatName] = (acc[displayCatName] || 0) + parseFloat(t.amount);
        return acc;
    }, {});

    const categoryData = Object.entries(catDataMap).map(([name, value], idx) => ({
        name, value, color: categoryColors[idx % categoryColors.length]
    }));

    if (totalIncome > 0 && netSavings > 0) {
        // Inject Remaining Balance
        categoryData.push({
            name: 'Remaining Balance',
            value: netSavings,
            color: '#10b981' // Green for balance
        });
    }

    if (categoryData.length === 0) {
        categoryData.push({ name: 'No Data', value: 100, color: '#94a3b8' });
    }

    const budgetData = budgets.map(b => ({
        name: b.categories?.name || 'Budget',
        current: parseFloat(b.spent_amount || 0),
        total: parseFloat(b.amount || 0)
    }));

    if (budgetData.length === 0) {
        budgetData.push({ name: 'No Budgets', current: 0, total: 100 });
    }

    const handleHideCard = (title) => {
        alert(`Hidden ${title}`);
    };

    const handleViewDetails = (title) => {
        if (title.includes('Income') || title.includes('Expenses')) navigate('/transactions');
        else navigate('/transactions');
    };

    const handleEditWidget = (title) => {
        alert(`Opening edit settings for ${title}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Welcome, {user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'User')}
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 sm:mt-2">Manage your wealth and track your financial growth.</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <button className="flex-1 sm:flex-none glass px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white flex justify-center items-center gap-2 transition-all">
                        <Calendar className="w-4 h-4" />
                        Custom Date
                    </button>
                    <button
                        onClick={() => navigate('/transactions')}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
                    >
                        + New Entry
                    </button>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {summaries.map((s, idx) => (
                    <SummaryCard
                        key={idx}
                        {...s}
                        onHide={handleHideCard}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditWidget}
                    />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-8">
                    <ChartWrapper
                        title="Income vs Expenses"
                        subtitle="Cash flow analysis"
                        activeFilter={trendFilter}
                        onFilterChange={setTrendFilter}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} barCategoryGap="30%" barGap={4}>
                                <CartesianGrid vertical={false} stroke="rgba(100,116,139,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    dy={8}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(100,116,139,0.06)', radius: 8 }}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                    }}
                                    formatter={(value, name) => [`$${parseFloat(value).toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 600 }}
                                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                                />
                                <Bar dataKey="income" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>

                {/* Debt Summary Card */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Landmark size={20} className="text-slate-500" />
                                Active Debts
                            </h3>
                            <button onClick={() => navigate('/debts')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:underline">Manage Debts</button>
                        </div>

                        {debts.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                                You are currently debt-free. Keep it up!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {debts.slice(0, 4).map(debt => {
                                    const progress = Math.min(Math.round(((debt.total_amount - debt.balance) / debt.total_amount) * 100), 100);
                                    return (
                                        <div key={debt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3 border border-slate-100 dark:border-white/5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-white block">{debt.title}</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md uppercase font-bold">{debt.interest_rate}% Interest</span>
                                                </div>
                                                <span className="text-slate-900 dark:text-white font-bold">₹{debt.balance.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-900 dark:bg-white transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Bills Card */}
                <div className="lg:col-span-12">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ReceiptText size={20} className="text-rose-500" />
                                Upcoming Bills
                            </h3>
                            <button onClick={() => navigate('/bills')} className="text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline">View All</button>
                        </div>

                        {bills.filter(b => b.status === 'pending').length === 0 ? (
                            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                                All caught up! No pending bills.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {bills.filter(b => b.status === 'pending').slice(0, 4).map(bill => (
                                    <div key={bill.id} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-slate-900 dark:text-white truncate">{bill.title}</span>
                                            <span className="text-rose-600 dark:text-rose-400 font-bold">₹{bill.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <Calendar size={12} />
                                            <span>Due: {new Date(bill.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Savings Goals Card */}
                <div className="lg:col-span-12">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Target size={20} className="text-indigo-500" />
                                Savings Goals
                            </h3>
                            <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
                        </div>

                        {goals.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                                No savings goals set. Start planning for your future today!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {goals.slice(0, 3).map(goal => {
                                    const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
                                    return (
                                        <div key={goal.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-slate-900 dark:text-white truncate">{goal.title}</span>
                                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <span>₹{goal.current_amount.toLocaleString()}</span>
                                                <span>Target: ₹{goal.target_amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie Chart Card */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 h-full border border-slate-100 dark:border-white/5 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Income Allocation</h3>
                        <div className="flex items-center gap-6">
                            {/* Donut Chart */}
                            <div className="flex-shrink-0">
                                <ResponsiveContainer width={160} height={160}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={50}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px' }}
                                            formatter={(value, name) => [`${parseFloat(value).toFixed(2)}`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend — 2-column grid with percentages */}
                            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                                {categoryData
                                    .filter(c => c.name !== 'No Data')
                                    .map((c, i) => {
                                        const total = categoryData.reduce((sum, d) => sum + d.value, 0);
                                        const pct = total > 0 ? ((c.value / total) * 100).toFixed(0) : 0;
                                        return (
                                            <div key={i} className="flex items-center gap-2 min-w-0">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                                                <span className="text-[12px] text-slate-600 dark:text-gray-300 truncate">{c.name}</span>
                                                <span className="text-[12px] font-bold text-slate-800 dark:text-white ml-auto">{pct}%</span>
                                            </div>
                                        );
                                    })
                                }
                                {categoryData.length === 1 && categoryData[0].name === 'No Data' && (
                                    <p className="col-span-2 text-xs text-slate-400 text-center pt-2">No income or expense data yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Transactions, Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-8">
                    <div className="glass-card rounded-[24px] p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                            <button
                                onClick={() => navigate('/transactions')}
                                className="text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
                            {transactions.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No transactions found.</p>
                            ) : (
                                transactions.map((transaction) => (
                                    <div key={transaction.id} className="p-4 border-b border-white/5 flex justify-between items-center group hover:bg-white/[0.02] transition-colors rounded-xl">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900 dark:text-white">{transaction.description}</p>
                                            <div className="flex gap-3 text-xs text-slate-500 dark:text-gray-400">
                                                <span>{transaction.date}</span>
                                                <span className="px-2 py-0.5 bg-white/5 rounded-md uppercase tracking-wider font-semibold">{transaction.type}</span>
                                            </div>
                                        </div>
                                        <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Budget Usage */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="glass-card rounded-[24px] p-6 h-full flex flex-col cursor-pointer hover:bg-slate-200/50 dark:hover:bg-white/[0.04] transition-colors" onClick={() => navigate('/budgets')}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Budget Usage</h3>
                            <button className="p-1 text-slate-400 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
                            {budgets.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No budgets found.</p>
                            ) : (
                                budgets.map((budget) => {
                                    const spent = parseFloat(budget.spent_amount || 0);
                                    const limit = parseFloat(budget.amount || 0);
                                    const progress = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
                                    const isOver = spent > limit;
                                    const catName = budget.categories?.name || budget.period || 'Budget';

                                    return (
                                        <div key={budget.id} className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-700 dark:text-gray-300 font-medium capitalize">{catName}</span>
                                                <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-slate-900 dark:text-white'}`}>${limit.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                                <div
                                                    className={`${isOver ? 'bg-rose-500' : 'bg-blue-500'} h-1.5 rounded-full transition-all duration-700`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-tighter">{budget.period} budget</p>
                                                <p className={`text-[10px] font-bold ${isOver ? 'text-rose-400' : 'text-slate-400'}`}>
                                                    {isOver ? `Over by $${(spent - limit).toFixed(2)}` : `$${spent.toFixed(2)} / $${limit.toFixed(2)}`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
