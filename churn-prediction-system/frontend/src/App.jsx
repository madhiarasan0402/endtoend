import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import Sidebar from './components/Sidebar';

import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import Login from './components/Login';
import { Clock, Database, Settings as SettingsIcon, AlertCircle, CheckCircle2, Info, Moon, Sun, ShieldCheck, Activity, Sparkles } from 'lucide-react';
import api from './api';
import toast, { Toaster } from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardView = ({ stats }) => {
  if (!stats || !stats.risk_distribution) return (
    <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-3xl border-2 border-dashed border-slate-300">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
        <Database size={32} className="text-slate-300" />
      </div>
      <h3 className="text-slate-400 font-black uppercase tracking-widest text-sm">Initializing Enterprise Data...</h3>
      <p className="text-slate-300 text-[10px] mt-2 font-bold uppercase">Synchronizing with core telemetry clusters</p>
    </div>
  );
  const chartData = {
    labels: stats.risk_distribution.map(d => d.label),
    datasets: [{
      data: stats.risk_distribution.map(d => d.value),
      backgroundColor: stats.risk_distribution.map(d => d.color),
      borderWidth: 0,
      hoverOffset: 15
    }]
  };
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Row: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { color: "indigo", label: "Revenue at Critical Risk", value: `$${stats.monthly_revenue_at_risk.toLocaleString()}`, sub: "Monthly Recurring Revenue (MRR)", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { color: "rose", label: "Churn Rate Velocity", value: `${stats.churn_rate}%`, sub: "Historical average in dataset", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
          { color: "emerald", label: "Interventions Active", value: stats.active_interventions, sub: "Successful retention workflows", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }
        ].map((metric, i) => (
          <div key={i} className={`enterprise-card p-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 dark:opacity-10 dark:group-hover:opacity-20 transition-opacity text-${metric.color}-600 dark:text-${metric.color}-400`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={metric.icon} />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase mb-1">{metric.label}</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white line-clamp-1">{metric.value}</h3>
            <p className="text-slate-900 dark:text-slate-400 text-xs mt-3 font-bold">{metric.sub}</p>
          </div>
        ))}
      </div>

      {/* Middle Row: Main Analysis Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="glass-panel p-8 rounded-3xl lg:col-span-12 flex flex-col border border-slate-300 dark:border-slate-800 dark:shadow-none bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Enterprise Risk Allocation</h2>
              <p className="text-slate-500 text-xs mt-1 font-bold">Real-time segmentation of total customer base</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-black text-slate-900 dark:text-white uppercase">Live Telemetry</div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="h-72 relative">
              <Doughnut data={chartData} options={{ cutout: '80%', plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.total_customers.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase">Database Size</span>
              </div>
            </div>
            <div className="space-y-4">
              {stats.risk_distribution.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-300 dark:border-slate-800 flex items-center justify-between hover:border-indigo-100 dark:hover:bg-slate-800 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{item.label}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Insights & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 enterprise-card p-8 bg-indigo-900 dark:bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles className="h-40 w-40 text-emerald-400" />
          </div>
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 backdrop-blur-md border border-emerald-500/20">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Neural Strategy Engine</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase mt-0.5">Autonomous intelligence recommendations</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-default">
                <p className="text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Target segment</p>
                <p className="text-sm font-bold leading-relaxed">Short-term contracts show 2.4x higher risk velocity than enterprise tiers.</p>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-emerald-400"></div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-default">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest">Growth trigger</p>
                <p className="text-sm font-bold leading-relaxed">Fiber Optic cross-selling correlated with 15% better retention LTV.</p>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-indigo-400"></div>
                </div>
              </div>
            </div>
            <div className="mt-10 flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
              <Info size={12} />
              Inference Confidence: 94.2% • Engine v2.5.0-S
            </div>
          </div>
        </div>

        <div className="enterprise-card p-8 bg-white dark:bg-slate-900 flex flex-col justify-center border border-slate-300 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase mb-8 tracking-widest flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Operational Health
          </h4>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-3 text-[10px] font-black uppercase">
                <span className="text-slate-400">Model Version</span>
                <span className="text-slate-900 dark:text-white">v2.5.1-PRO</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-full w-full bg-slate-900 dark:bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-3 text-[10px] font-black uppercase">
                <span className="text-slate-400">Data Freshness</span>
                <span className="text-indigo-600">LIVE SYNC</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-full w-[98%] bg-indigo-500 rounded-full"></div>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase italic">
              <ShieldCheck size={12} /> Encrypted at rest (AES-256)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogsView = ({ logs, isDarkMode }) => {
  return (
    <div className="enterprise-card p-8 bg-white dark:bg-slate-900 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-indigo-500/10 flex items-center justify-center border border-slate-300 dark:border-indigo-500/20">
            <Clock className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">System Simulation History</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Audit trail of neural churn risk assessments</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-900 text-[10px] font-black text-slate-900 dark:text-white uppercase cursor-default">All Protocols</div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase cursor-not-allowed">Filters Opt-Out</div>
        </div>
      </div>
      <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'white', border: 'none', '.dark &': { backgroundColor: 'transparent' } }}>
        <Table sx={{ minWidth: 650 }} aria-label="simulation logs table">
          <TableHead>
            <TableRow sx={{ borderBottom: '1.5px solid #e2e8f0', '.dark &': { borderBottom: '1.5px solid #1e293b' } }}>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Identifier</TableCell>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Probability</TableCell>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Risk Level</TableCell>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0e0d0dff', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Date/Time</TableCell>
              <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Protocol</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs?.map((log) => (
              <TableRow
                key={log.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s' }}
              >
                <TableCell component="th" scope="row" sx={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>
                  {log.customer_id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 w-40">
                    <LinearProgress
                      variant="determinate"
                      value={log.prediction_prob * 100}
                      sx={{
                        flexGrow: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: log.risk_level === 'High' ? '#ef4444' : log.risk_level === 'Medium' ? '#f59e0b' : '#10b981'
                        }
                      }}
                    />
                    <span className={`text-xs font-black ${log.risk_level === 'High' ? 'text-rose-600' : log.risk_level === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {(log.prediction_prob * 100).toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.risk_level}
                    size="small"
                    sx={{
                      fontSize: '10px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      height: 24,
                      backgroundColor: log.risk_level === 'High' ? '#fee2e2' : log.risk_level === 'Medium' ? '#fef3c7' : '#dcfce7',
                      color: log.risk_level === 'High' ? '#b91c1c' : log.risk_level === 'Medium' ? '#b45309' : '#15803d',
                      border: '1px solid currentColor',
                      borderRadius: '8px'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  {new Date(log.prediction_date).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>
                  SHA-256V2
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};


const FeatureStoreView = ({ features, isDarkMode }) => {
  if (!features) return null;
  const allFeatures = [...features.categorical.map(f => ({ ...f, type: 'Categorical' })), ...features.numerical.map(f => ({ ...f, type: 'Numerical' }))];

  return (
    <div className="enterprise-card p-8 bg-white dark:bg-slate-900 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-indigo-500/10 flex items-center justify-center border border-slate-300 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
          <Database size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Enterprise Feature Store</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Neural feature space and attribute importance weights</p>
        </div>
      </div>
      <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'white', border: 'none', '.dark &': { backgroundColor: 'transparent' } }}>
        <Table sx={{ minWidth: 650 }} aria-label="feature store table">
          <TableHead>
            <TableRow sx={{ borderBottom: '1.5px solid #e2e8f0', '.dark &': { borderBottom: '1.5px solid #1e293b' } }}>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Type</TableCell>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Feature Name</TableCell>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Source</TableCell>
              <TableCell sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Drift</TableCell>
              <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#000000', textTransform: 'uppercase', py: 2, letterSpacing: '0.05em' }}>Importance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allFeatures.map((f, i) => (
              <TableRow key={i} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <span className={`text-[10px] font-black uppercase ${f.type === 'Categorical' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    {f.type}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase leading-none">{f.name}</p>
                  <p className="text-[10px] text-slate-900 mt-1 line-clamp-1 font-semibold">{f.desc}</p>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">CRM / Cloud Billing</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Stable
                  </div>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={f.importance}
                    size="small"
                    sx={{
                      fontSize: '9px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      height: 20,
                      backgroundColor: f.importance === 'Extreme' ? '#fff1f2' : '#f8fafc',
                      color: f.importance === 'Extreme' ? '#e11d48' : '#475569',
                      border: '1px solid currentColor',
                      borderRadius: '6px'
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};


const SettingsView = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="glass-panel p-8 rounded-3xl border border-slate-300 shadow-2xl dark:border-slate-800 dark:shadow-none bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <SettingsIcon size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Account Parameters</h2>
        </div>
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-indigo-500/10 border border-slate-300 dark:border-indigo-500/20 flex items-center justify-center text-3xl font-black text-indigo-600 dark:text-indigo-400 uppercase">
              {user.username.slice(0, 2)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user.full_name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Enterprise Administrator • Role: Superuser</p>
              <div className="flex items-center gap-2 mt-3 font-bold">
                <div className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-[10px] uppercase">Verified Account</div>
                <div className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 text-[10px] uppercase">2FA Active</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-300 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Username Reference</label>
              <input readOnly value={user.username} className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-600 dark:text-slate-400 outline-none font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Session Protocol</label>
              <div className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="font-bold text-sm">TLS 1.3 Encryption Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="glass-panel p-8 rounded-3xl border-rose-200 dark:border-rose-500/20 bg-rose-50/10 dark:bg-rose-500/5 border shadow-2xl dark:shadow-none">
        <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase mb-4">Danger Zone</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">Permanently terminate the enterprise session and purge local neural weights.</p>
        <button className="px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-none">Emergency Deauth</button>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [features, setFeatures] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [statsRes, logsRes, featuresRes] = await Promise.all([
            api.get('/stats'),
            api.get('/logs'),
            api.get('/features')
          ]);
          setStats(statsRes.data);
          setLogs(logsRes.data);
          setFeatures(featuresRes.data);
        } catch (error) {
          console.error("Data syncing error:", error);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.error('System Access Terminated - Logged Out', {
      position: 'top-right',
      style: { background: '#ef4444', color: '#fff', fontWeight: 'bold', borderRadius: '12px' }
    });
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Access Granted - Welcome ${userData.full_name}`, {
      position: 'top-right',
      style: { background: '#10b981', color: '#fff', fontWeight: 'bold', borderRadius: '12px' }
    });
  };

  if (!user) return (
    <>
      <Login onLoginSuccess={handleLoginSuccess} />
      <Toaster />
    </>
  );

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'predict': return 'Predictive Analysis';
      case 'history': return 'Simulation Logs';
      case 'data': return 'Feature Store';
      case 'settings': return 'System Parameters';
      default: return 'ChurnShield Pro';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} font-sans selection:bg-indigo-500/20 transition-all duration-500`}>
      <Toaster />
      <div className="flex max-w-[1600px] mx-auto min-h-screen p-4 md:p-8 gap-8">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        <main className="flex-1 space-y-8 animate-in fade-in duration-700 overflow-hidden">
          <header className="pt-6 pb-6 mb-6 border-b border-slate-300 dark:border-slate-800 px-4 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase leading-none">Production Environment</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{getHeaderTitle()}</h1>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 shadow-sm"
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
                </button>
                <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center gap-2.5 transition-all hover:border-slate-400 dark:hover:border-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white uppercase shadow-sm">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{user.full_name}</p>
                    <p className="text-[9px] text-indigo-600 dark:text-indigo-400 mt-1 uppercase font-black tracking-widest flex items-center gap-1">
                      <ShieldCheck size={10} /> System Administrator
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8">
            {activeTab === 'dashboard' && <DashboardView stats={stats} />}
            {activeTab === 'predict' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                <div className="lg:col-span-8">
                  <PredictionForm setPrediction={setPrediction} setLoading={setLoading} />
                </div>
                <div className="h-full lg:col-span-4">
                  {loading ? (
                    <div className="glass-panel h-full rounded-3xl flex flex-col items-center justify-center p-12 text-center animate-pulse border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-2xl border-4 border-indigo-600/20 border-t-indigo-600 animate-spin"></div>
                        <ShieldCheck className="absolute inset-0 m-auto text-indigo-600" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Processing Neural Weights</h3>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 max-w-xs">Connecting to enterprise feature store for advanced telemetry analysis...</p>
                    </div>
                  ) : prediction ? (
                    <ResultCard result={prediction} />
                  ) : (
                    <div className="glass-panel h-full rounded-3xl flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-black/50 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                        <Activity size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-400 dark:text-slate-600">Telemetry Standby</h3>
                      <p className="text-slate-300 dark:text-slate-700 text-xs mt-2 max-w-[200px] leading-relaxed uppercase font-bold">Initialize prediction to begin neural analysis</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'history' && <LogsView logs={logs} isDarkMode={isDarkMode} />}
            {activeTab === 'data' && <FeatureStoreView features={features} isDarkMode={isDarkMode} />}
            {activeTab === 'settings' && <SettingsView user={user} />}
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
