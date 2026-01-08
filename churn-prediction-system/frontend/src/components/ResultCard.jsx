import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ChevronDown, ChevronUp, Activity, Share2, Download, AlertCircle, CheckCircle2, Info, Sparkles } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

const ResultCard = ({ result }) => {
    const [showDetails, setShowDetails] = useState(true);

    if (!result) return null;

    const { churn_prediction, churn_probability, risk_level, explanations } = result;
    const percentage = Math.round(churn_probability * 100);

    const isHighRisk = risk_level === 'High';
    const isMediumRisk = risk_level === 'Medium';

    const handleDownload = async () => {
        try {
            const loadingToast = toast.loading('Generating Report...');
            const response = await api.post('/report', { data: result }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ChurnReport_${result.customer_id || 'Analysis'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report Downloaded', { id: loadingToast });
        } catch (error) {
            console.error("Download failed", error);
            toast.error('Download Failed');
        }
    };

    const data = {
        labels: ['Churn Risk', 'Retention'],
        datasets: [
            {
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    isHighRisk ? '#f43f5e' : isMediumRisk ? '#fbbf24' : '#10b981',
                    '#f1f5f9'
                ],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="enterprise-card p-8 bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-full border border-slate-200 dark:border-slate-800 relative"
        >
            <div className={`absolute top-0 left-0 w-full h-2 ${isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Neural Analysis Result</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium italic">Derived from ensemble feature importance</p>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${isHighRisk ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' : isMediumRisk ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'}`}>
                    {risk_level} Risk
                </div>
            </div>

            <div className="flex flex-col items-center justify-center mb-10">
                <div className="relative">
                    <div className="w-56 h-56 mx-auto">
                        <Doughnut
                            data={data}
                            options={{
                                cutout: '80%',
                                plugins: { legend: { display: false } },
                                animation: { duration: 2000, easing: 'easeOutElastic' }
                            }}
                        />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-6xl font-black text-slate-900 dark:text-white">{percentage}%</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Probability</span>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-800">
                                <Activity size={16} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">Analysis Details</span>
                        </div>
                        {showDetails ? <ChevronUp size={20} className="text-slate-400 dark:text-slate-600" /> : <ChevronDown size={20} className="text-slate-400 dark:text-slate-600" />}
                    </button>

                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-4 px-2 mb-4"
                            >
                                {explanations?.map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-bold uppercase">
                                            <span className="text-slate-500 dark:text-slate-400">{item.feature}</span>
                                            <span className={item.impact > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}>
                                                {item.impact > 0 ? '+' : ''}{item.impact.toFixed(3)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(Math.abs(item.impact) * 40, 100)}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={`h-full rounded-full ${item.impact > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-5">
                            <Info size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Suggestions</h4>
                        </div>
                        <ul className="space-y-3">
                            {isHighRisk ? (
                                <>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Priority Outreach: Initiate direct executive-level account review.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Migrate to Multi-Year: Offer 25% retention incentive for 24mo commitment.</p>
                                    </li>
                                </>
                            ) : isMediumRisk ? (
                                <>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Value Audit: Send personalized ROI report for current services.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Product Highlight: Feature automated add-ons matching usage patterns.</p>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Loyalty Rewards: Enable "Enterprise Advantage" referral bonus tier.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Upsell Cycle: Introduce advanced AI-telemetry module for Q3 expansion.</p>
                                    </li>
                                </>
                            )}
                        </ul>

                        {explanations && explanations.length > 0 && explanations[0].impact > 0.1 && (
                            <div className="mt-5 p-4 bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 rounded-2xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                                    <h4 className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">AI Insight Strategy</h4>
                                </div>
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    "Critical focus required on <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase underline decoration-indigo-200 dark:decoration-indigo-500/30 underline-offset-4">{explanations[0].feature}</span>. This parameter is the primary driver for current churn probability. Recommend immediate intervention in this specific vertical."
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Bar - Contained & Responsive */}
            <div className="mt-8 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3 bg-slate-50/50 dark:bg-slate-800/20">
                <button onClick={handleDownload} className="flex-1 bg-black dark:bg-black border-2 border-black dark:border-black text-white py-3.5 px-4 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2.5 shadow-md whitespace-nowrap overflow-hidden force-black-btn hover:scale-[1.02] active:scale-[0.98]">
                    <Download size={14} className="text-white shrink-0" />
                    <span className="truncate">Download Report</span>
                </button>
                <button className="flex-1 bg-black dark:bg-black border-2 border-black dark:border-black text-white py-3.5 px-4 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2.5 shadow-md whitespace-nowrap overflow-hidden force-black-btn hover:scale-[1.02] active:scale-[0.98]">
                    <Share2 size={14} className="text-white shrink-0" />
                    <span className="truncate">Intelligence Push</span>
                </button>
            </div>

        </motion.div>
    );
};

export default ResultCard;
