import { useState, useEffect } from 'react';
import {
    Zap, TrendingUp, TrendingDown, Info, AlertTriangle,
    CheckCircle2, ArrowRight, Lightbulb, BarChart3
} from 'lucide-react';
import { insightService } from '../services/api';

const Insights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await insightService.getOverview();
                setData(res.data.data);
            } catch (error) {
                console.error('Error fetching insights:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    const getStatusStyles = (type) => {
        switch (type) {
            case 'warning': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
            case 'success': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
            case 'info': return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
            default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-white/5';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={20} />;
            case 'success': return <CheckCircle2 size={20} />;
            case 'info': return <Info size={20} />;
            default: return <Zap size={20} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const { summary, topCategory, insights } = data || {};

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
                    Financial Insights
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Smart analysis of your spending patterns and financial health.</p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 size={120} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Spending Trend</p>
                    <div className="mt-4 flex items-end gap-3">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white">₹{summary?.currentTotal.toLocaleString()}</h2>
                        <div className={`flex items-center gap-1 mb-1 font-bold ${summary?.changePct > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {summary?.changePct > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{Math.abs(summary?.changePct || 0).toFixed(1)}%</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Compared to last month (₹{summary?.prevTotal.toLocaleString()})</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={120} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Top Spending Area</p>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-4">{topCategory?.name || 'N/A'}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Highest expenditure this month: ₹{topCategory?.amount.toLocaleString()}</p>
                </div>
            </div>

            {/* Smart Insights Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                        <Lightbulb size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Recommendations</h3>
                </div>

                {insights?.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[32px] p-12 text-center border border-slate-100 dark:border-white/5">
                        <p className="text-slate-500 dark:text-slate-400">Keep recording your transactions to unlock personalized insights!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights?.map((insight, idx) => (
                            <div
                                key={idx}
                                className={`p-6 rounded-[28px] border-2 transition-all hover:scale-[1.02] duration-300 flex flex-col justify-between ${getStatusStyles(insight.type)}`}
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-white dark:bg-slate-900/50 rounded-xl shadow-sm">
                                            {getIcon(insight.type)}
                                        </div>
                                        <h4 className="font-black text-lg">{insight.title}</h4>
                                    </div>
                                    <p className="opacity-90 leading-relaxed font-medium">{insight.description}</p>
                                </div>
                                <button className="mt-6 flex items-center gap-2 text-sm font-black uppercase tracking-wider group/btn">
                                    Take Action
                                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pro Tips / Educational Section */}
            <div className="bg-indigo-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/40">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-2xl"></div>

                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-3xl font-black mb-4">Financial Freedom Method</h3>
                    <p className="text-indigo-100 text-lg leading-relaxed">
                        Follow the 50/30/20 rule: Allocate <span className="text-white font-bold underline decoration-indigo-300 underline-offset-4">50% for Needs</span>,
                        <span className="text-white font-bold underline decoration-indigo-300 underline-offset-4 ml-1">30% for Wants</span>, and
                        <span className="text-white font-bold underline decoration-indigo-300 underline-offset-4 ml-1">20% for Savings</span>.
                        Your current profile suggests optimization in your "Dining" category could boost your monthly savings by 15%.
                    </p>
                    <button className="mt-8 px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black hover:bg-slate-50 transition-colors shadow-xl">
                        Explore Budgeting
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Insights;
