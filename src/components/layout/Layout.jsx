import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-transparent font-sans antialiased overflow-hidden">
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Fixed Top Navbar */}
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
                    <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-10 w-full pb-24 lg:pb-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
