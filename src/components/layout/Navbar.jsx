import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings as SettingsIcon, LogOut, Menu } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);

    // Extract display name
    const displayName = user?.email ? user.email.split('@')[0] : 'User';
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const handleLogout = () => {
        setIsProfileOpen(false);
        logout();
        navigate('/login');
    };

    const handleNavigate = (path) => {
        setIsProfileOpen(false);
        navigate(path);
    };

    return (
        <div className="relative z-40 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 bg-transparent border-b border-slate-200 dark:border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search Bar - Hidden on small mobile, visible on sm and up */}
                <div className="hidden sm:block flex-1 max-w-md">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search transactions, budgets..."
                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-11 pr-4 text-sm text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>
            {/* Right side Actions */}
            <div className="flex items-center gap-6">
                {/* Notification */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        onBlur={() => setTimeout(() => setIsNotifOpen(false), 150)}
                        className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-all"
                    >
                        <Bell className="w-5 h-5" />
                        {hasUnread && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#050510]"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-white/5">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setHasUnread(false)}
                                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                    Mark all as read
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                                {[
                                    { icon: '💸', title: 'Budget exceeded', desc: 'Food & Dining is over budget by $862', time: 'Just now', unread: true },
                                    { icon: '✅', title: 'Transaction added', desc: 'New expense of $150 recorded', time: '2h ago', unread: true },
                                    { icon: '📊', title: 'Monthly report ready', desc: 'Your March summary is available', time: '1d ago', unread: false },
                                ].map((n, i) => (
                                    <div
                                        key={i}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${n.unread ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}
                                    >
                                        <span className="text-xl mt-0.5">{n.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{n.desc}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 dark:text-gray-500 whitespace-nowrap mt-1">{n.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/5 text-center">
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => { setIsNotifOpen(false); navigate('/settings'); }}
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        onBlur={() => setTimeout(() => setIsProfileOpen(false), 150)}
                        className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shadow-inner">
                            <img
                                src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=3b82f6&color=fff`}
                                alt="Avatar"
                                className="w-full h-full object-cover opacity-80"
                            />
                        </div>
                        <div className="hidden sm:block text-left mr-1">
                            <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{capitalizedName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-gray-500">Premium Plan</p>
                        </div>
                        <ChevronDown className={clsx("w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-transform duration-200", isProfileOpen && "rotate-180")} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5">
                                <p className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email || 'user@example.com'}</p>
                            </div>

                            <div className="py-1">
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleNavigate('/settings')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                                    Your Profile
                                </button>
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleNavigate('/settings')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                                >
                                    <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                                    Settings
                                </button>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-white/5 my-1"></div>

                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
