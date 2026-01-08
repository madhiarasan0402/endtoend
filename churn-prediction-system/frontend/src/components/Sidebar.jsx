import React, { useState } from 'react';
import {
    LayoutDashboard,
    UserPlus,
    History,
    Database,
    Settings,
    LogOut,
    ShieldCheck,
    ChevronRight,
    ChevronLeft,
    Moon,
    Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, active, onClick, isCollapsed, colorStyle }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-2xl transition-all group relative ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-500/20'
            : colorStyle || 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400'
            } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} className="shrink-0" />
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-semibold whitespace-nowrap"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
        {!isCollapsed && active && <ChevronRight size={14} className="opacity-50" />}

        {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {label}
            </div>
        )}
    </button>
);

const Sidebar = ({ activeTab, setActiveTab, onLogout, isDarkMode, setIsDarkMode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <motion.div
            animate={{ width: isCollapsed ? '88px' : '288px' }}
            className="enterprise-card h-[calc(100vh-4rem)] p-4 flex flex-col sticky top-8 transition-all duration-300 group/sidebar overflow-visible bg-white dark:bg-slate-900/90"
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-50 cursor-pointer"
            >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            <div className={`flex items-center gap-3 px-2 mb-10 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 dark:shadow-indigo-500/20">
                    <ShieldCheck className="text-white" size={24} />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="overflow-hidden"
                    >
                        <h2 className="text-slate-800 dark:text-white font-bold text-lg leading-none whitespace-nowrap">
                            ChurnShield<span className="text-indigo-600">Pro</span>
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Enterprise AI</p>
                    </motion.div>
                )}
            </div>

            <nav className="flex-1 space-y-2">
                <SidebarItem
                    icon={LayoutDashboard}
                    label="Executive Dashboard"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    icon={UserPlus}
                    label="Predictive Analysis"
                    active={activeTab === 'predict'}
                    onClick={() => setActiveTab('predict')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    icon={History}
                    label="Simulation Logs"
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    icon={Database}
                    label="Feature Store"
                    active={activeTab === 'data'}
                    onClick={() => setActiveTab('data')}
                    isCollapsed={isCollapsed}
                />
            </nav>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <SidebarItem
                    icon={Settings}
                    label="System Settings"
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    icon={LogOut}
                    label="Logout"
                    onClick={onLogout}
                    isCollapsed={isCollapsed}
                    colorStyle="text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                />
            </div>
        </motion.div>
    );
};

export default Sidebar;
