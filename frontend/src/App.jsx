<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import axios from 'axios';

// Configure axios to use backend server
axios.defaults.baseURL = 'http://127.0.0.1:8000';

const navItems = [
  'Overview',
  'Churn Analytics',
  'Prediction',
  'Retention',
  'AI Assistant',
  'Reports',
];

const kpiData = [
  { label: 'Churn Risk', value: '92%', detail: 'High priority', accent: 'from-cyan-400 to-indigo-500' },
  { label: 'Retention Score', value: '78%', detail: 'Improved by 8%', accent: 'from-violet-500 to-fuchsia-500' },
  { label: 'Revenue at Risk', value: '₹19.4L', detail: 'Monthly exposure', accent: 'from-sky-400 to-cyan-300' },
  { label: 'AI Confidence', value: '97%', detail: 'Model certainty', accent: 'from-blue-500 to-purple-500' },
];

const churnTrend = [
  { month: 'Jan', churn: 14, retained: 86 },
  { month: 'Feb', churn: 17, retained: 83 },
  { month: 'Mar', churn: 12, retained: 88 },
  { month: 'Apr', churn: 20, retained: 80 },
  { month: 'May', churn: 18, retained: 82 },
  { month: 'Jun', churn: 15, retained: 85 },
];

const segmentData = [
  { label: 'Loyal', value: 38, color: '#60a5fa' },
  { label: 'Risky', value: 22, color: '#a78bfa' },
  { label: 'Premium', value: 18, color: '#38bdf8' },
  { label: 'Dormant', value: 12, color: '#f472b6' },
  { label: 'New', value: 10, color: '#c084fc' },
];

const factorData = [
  { name: 'Low engagement', value: 29 },
  { name: 'Late payments', value: 21 },
  { name: 'Complaints', value: 18 },
  { name: 'Inactive plan', value: 17 },
  { name: 'Price sensitivity', value: 15 },
];

const behaviorTimeline = [
  { time: '2026-05-21', event: 'Support ticket raised', type: 'warning' },
  { time: '2026-05-23', event: 'Usage drop - 37%', type: 'danger' },
  { time: '2026-05-25', event: 'Billing delay detected', type: 'alert' },
  { time: '2026-05-26', event: 'Premium plan downgrade', type: 'info' },
];

const heatmapData = [
  { region: 'Mumbai', value: 92 },
  { region: 'Bengaluru', value: 77 },
  { region: 'Delhi', value: 83 },
  { region: 'Hyderabad', value: 69 },
  { region: 'Chennai', value: 54 },
];

function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [token, setToken] = useState(localStorage.getItem('neoPulseToken') || '');
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: 'neo_admin', password: 'NeoPulse@2026' });
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', full_name: '', email: '', department: '' });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [predictForm, setPredictForm] = useState({ tenure: 14, complaints: 3, planType: 'Premium', usage: 42, satisfaction: 48, region: 'Mumbai' });
  const [prediction, setPrediction] = useState({ score: 88, class_name: 'High Risk', confidence: 94, reasons: ['Low engagement', 'Late payments', 'Subscription inactivity'] });
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([
    'Offer 20% discount on next renewal',
    'Enable premium support follow-up',
    'Launch a loyalty reward campaign',
  ]);
  const [summary, setSummary] = useState('NeoPulse AI detects high churn pressure in premium segments and recommends immediate retention action for customers with low engagement.');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      axios.get('/api/summary').then((res) => setSummary(res.data.summary)).catch(() => {
        setSummary('Unable to load AI summary. Please re-authenticate if needed.');
      });
    }
  }, [token]);

  const handlePredict = async (event) => {
    event.preventDefault();
    const result = await axios.post('/api/predict', predictForm).then((res) => res.data).catch(() => ({ score: 83, class_name: 'Risky', confidence: 90, reasons: ['Low engagement', 'Late payments'] }));
    setPrediction(result);
    setRecommendations(result.recommendations ?? recommendations);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const formParams = new URLSearchParams();
      formParams.append('username', loginForm.username);
      formParams.append('password', loginForm.password);
      const response = await axios.post('/api/auth/login', formParams, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const accessToken = response.data.access_token;
      setToken(accessToken);
      localStorage.setItem('neoPulseToken', accessToken);
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setLoginError('');
    } catch (error) {
      setLoginError('Login failed. Check credentials and try again.');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/api/auth/register', registerForm);
      setRegisterSuccess('Account created! You can now sign in.');
      setRegisterError('');
      setTimeout(() => { setShowRegister(false); setRegisterSuccess(''); }, 1500);
    } catch (error) {
      setRegisterError(error.response?.data?.detail || 'Registration failed. Try again.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setSummary('NeoPulse AI detects high churn pressure in premium segments and recommends immediate retention action for customers with low engagement.');
    localStorage.removeItem('neoPulseToken');
    delete axios.defaults.headers.common.Authorization;
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 grid place-items-center px-4 py-10">
        <div className="w-full max-w-md glass-card rounded-[36px] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 shadow-xl flex items-center justify-center text-2xl font-bold text-slate-950">N</div>
            <h1 className="text-3xl font-semibold text-white">{showRegister ? 'Create Account' : 'NeoPulse AI Login'}</h1>
            <p className="mt-2 text-slate-400">{showRegister ? 'Register to access your churn prediction command center.' : 'Secure access to your churn prediction command center.'}</p>
          </div>

          {showRegister ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <label className="block text-sm text-slate-300">
                Full Name
                <input required value={registerForm.full_name} onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="Jane Doe" />
              </label>
              <label className="block text-sm text-slate-300">
                Email
                <input required type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="jane@neopulse.ai" />
              </label>
              <label className="block text-sm text-slate-300">
                Username
                <input required value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="jane_analyst" />
              </label>
              <label className="block text-sm text-slate-300">
                Department
                <input value={registerForm.department} onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="Analytics" />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input required type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="••••••••" />
              </label>
              {registerError && <p className="text-sm text-rose-400">{registerError}</p>}
              {registerSuccess && <p className="text-sm text-cyan-400">{registerSuccess}</p>}
              <button type="submit" className="w-full rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition duration-300 hover:-translate-y-0.5">Create account</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block text-sm text-slate-300">
                Username
                <input value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="neo_admin" />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="••••••••" />
              </label>
              {loginError && <p className="text-sm text-rose-400">{loginError}</p>}
              <button type="submit" className="w-full rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition duration-300 hover:-translate-y-0.5">Sign in securely</button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            {showRegister ? (
              <>Already have an account?{' '}<button onClick={() => { setShowRegister(false); setRegisterError(''); setRegisterSuccess(''); }} className="text-cyan-400 hover:underline">Sign in</button></>
            ) : (
              <>Don&apos;t have an account?{' '}<button onClick={() => { setShowRegister(true); setLoginError(''); }} className="text-cyan-400 hover:underline">Register</button></>
            )}
          </p>
          {!showRegister && <p className="mt-3 text-center text-sm text-slate-500">Use <span className="text-slate-100 font-semibold">neo_admin / NeoPulse@2026</span> for demo access.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 overflow-x-hidden">
      <div className="grid lg:grid-cols-[280px_1fr] gap-6 px-4 py-6 lg:px-8">
        <aside className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow max-h-[calc(100vh-48px)] lg:sticky lg:top-4">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 shadow-xl flex items-center justify-center text-2xl font-bold text-slate-950">N</div>
            <div>
              <p className="text-slate-400 uppercase tracking-[0.3em] text-xs">NeoPulse AI</p>
              <h1 className="text-2xl font-semibold">Customer Intelligence</h1>
            </div>
          </div>
          <div className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`w-full text-left rounded-3xl px-4 py-3 transition duration-300 ${activeNav === item ? 'bg-slate-800/70 ring-1 ring-cyan-400/30' : 'hover:bg-white/5'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-10 rounded-[28px] border border-white/10 bg-slate-900/40 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Smart alert</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">High churn pressure in Premium plan customers. Review late payment and support ticket trends.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-3xl bg-cyan-500/10 px-4 py-3 text-cyan-200 ring-1 ring-cyan-400/20">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              AI Risk Detection Enabled
            </div>
          </div>
          <button onClick={handleLogout} className="mt-8 w-full rounded-3xl bg-slate-800/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700/90">Logout</button>
        </aside>

        <main className="space-y-6">
          <section className="glass-card rounded-[36px] border border-white/10 p-8 shadow-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-grid opacity-60 pointer-events-none" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-4">
                <p className="text-cyan-300 uppercase tracking-[0.4em] text-xs">NeoPulse AI Dashboard</p>
                <h2 className="text-4xl font-semibold tracking-tight text-white">Futuristic churn prediction and retention intelligence for modern SaaS teams.</h2>
                <p className="max-w-2xl text-slate-300 leading-7">Monitor risk, explore predictive customer behavior, and apply retention strategies with AI-driven insights and elegant visual controls.</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_80px_rgba(30,41,59,0.18)]">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">Active models</p>
                    <h3 className="mt-3 text-3xl font-semibold text-white">5</h3>
                    <p className="mt-2 text-slate-400 text-sm">Random Forest, XGBoost, Logistic Regression, Decision Tree, AutoML</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_80px_rgba(30,41,59,0.18)]">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">30-day forecast</p>
                    <h3 className="mt-3 text-3xl font-semibold text-white">22% churn</h3>
                    <p className="mt-2 text-slate-400 text-sm">Projected risk for high-value customers over the next month</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-slate-300 text-sm uppercase tracking-[0.3em]">Confidence</p>
                    <p className="mt-3 text-3xl font-semibold text-white">97%</p>
                  </div>
                  <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-400 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950">NeoPulse Core</div>
                </div>
                <div className="mt-8 rounded-[28px] bg-slate-900/80 p-5">
                  <p className="text-slate-400 text-sm mb-4">Executive summary</p>
                  <p className="text-slate-200 leading-6">Predictive churn patterns are strongest in premium customers with late payments and usage drops. Retention engines advise loyalty bonuses and proactive premium support.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <motion.div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {kpiData.map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -6 }}
                    className={`glass-card rounded-[28px] border border-white/10 p-6 shadow-xl bg-gradient-to-br ${stat.accent}`}
                  >
                    <p className="text-slate-200 text-sm uppercase tracking-[0.3em]">{stat.label}</p>
                    <p className="mt-4 text-4xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-3 text-sm text-slate-300">{stat.detail}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow chart-spotlight">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm uppercase text-slate-400 tracking-[0.3em]">Churn analytics</p>
                    <h3 className="text-2xl font-semibold text-white">30-day churn trend</h3>
                  </div>
                  <span className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-cyan-300">Real-time</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={churnTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="retainGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.95} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.12} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <CartesianGrid vertical={false} opacity={0.08} />
                      <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(148, 163, 184, 0.1)' }} />
                      <Area type="monotone" dataKey="churn" stroke="#60a5fa" fill="url(#churnGradient)" strokeWidth={3} />
                      <Area type="monotone" dataKey="retained" stroke="#c084fc" fill="url(#retainGradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-xs">Risk heatmap</p>
                    <h3 className="text-2xl font-semibold text-white">Region impact map</h3>
                  </div>
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-200">AI-based</span>
                </div>
                <div className="space-y-4">
                  {heatmapData.map((item) => (
                    <div key={item.region} className="rounded-3xl bg-slate-950/70 p-4 ring-1 ring-white/5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-slate-300 font-medium">{item.region}</p>
                          <p className="text-xs text-slate-500">Churn heat intensity</p>
                        </div>
                        <p className="text-xl font-semibold text-white">{item.value}%</p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-xs">AI Assistant</p>
                    <h3 className="text-2xl font-semibold text-white">GenAI retention advisor</h3>
                  </div>
                  <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 uppercase tracking-[0.28em]">Chat + Query</div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/10">
                    <p className="text-slate-200 leading-6">"Why are premium telecom customers leaving?"</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/10">
                    <p className="text-slate-200 leading-6">"Show churn in Mumbai for premium users."</p>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await axios.get('/api/analytics').catch(() => null);
                      setAnalytics(res?.data ?? null);
                    }}
                    className="w-full rounded-3xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition duration-300 hover:scale-[1.01]"
                  >Launch Executive Report</button>
                  {analytics && (
                    <div className="rounded-3xl bg-slate-950/80 p-4 border border-white/10 space-y-2 text-sm">
                      <p className="text-slate-400 uppercase tracking-[0.24em] text-xs">Analytics snapshot</p>
                      <p className="text-slate-200">Total predictions: <span className="text-cyan-300 font-semibold">{analytics.total_predictions}</span></p>
                      <p className="text-slate-200">Avg confidence: <span className="text-cyan-300 font-semibold">{analytics.avg_confidence}%</span></p>
                      <p className="text-slate-200">High risk: <span className="text-rose-300 font-semibold">{analytics.risk_distribution?.['High Risk'] ?? 0}</span></p>
                      <p className="text-slate-200">Moderate risk: <span className="text-amber-300 font-semibold">{analytics.risk_distribution?.['Moderate Risk'] ?? 0}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_0.75fr]">
            <div className="grid gap-6">
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Prediction center</p>
                    <h3 className="text-2xl font-semibold text-white">Real-time churn simulation</h3>
                  </div>
                  <div className="rounded-full bg-purple-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-purple-200">Instant scoring</div>
                </div>
                <form onSubmit={handlePredict} className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      Region
                      <select value={predictForm.region} onChange={(e) => setPredictForm({ ...predictForm, region: e.target.value })} className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20">
                        <option>Mumbai</option>
                        <option>Bengaluru</option>
                        <option>Delhi</option>
                        <option>Chennai</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      Plan type
                      <select value={predictForm.planType} onChange={(e) => setPredictForm({ ...predictForm, planType: e.target.value })} className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20">
                        <option>Premium</option>
                        <option>Monthly</option>
                        <option>Annual</option>
                        <option>Basic</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="space-y-2 text-sm text-slate-300">
                      Tenure (months)
                      <input type="number" min="1" value={predictForm.tenure} onChange={(e) => setPredictForm({ ...predictForm, tenure: Number(e.target.value) })} className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      Complaints this month
                      <input type="number" min="0" value={predictForm.complaints} onChange={(e) => setPredictForm({ ...predictForm, complaints: Number(e.target.value) })} className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      Avg usage (%)
                      <input type="number" min="0" max="100" value={predictForm.usage} onChange={(e) => setPredictForm({ ...predictForm, usage: Number(e.target.value) })} className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      Satisfaction score
                      <input type="range" min="0" max="100" value={predictForm.satisfaction} onChange={(e) => setPredictForm({ ...predictForm, satisfaction: Number(e.target.value) })} className="w-full accent-cyan-400" />
                    </label>
                    <div className="rounded-3xl bg-slate-900/70 p-4 border border-white/10">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Model status</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{prediction.class_name}</p>
                      <p className="text-slate-400 mt-1">Confidence {prediction.confidence}%</p>
                    </div>
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 px-6 py-4 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 shadow-glow">Predict churn now</button>
                </form>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-950/80 p-4 border border-white/10">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">Risk score</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{prediction.score}%</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4 border border-white/10">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">Churn class</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{prediction.class_name}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4 border border-white/10">
                    <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">Confidence</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{prediction.confidence}%</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-xs">Explainable AI</p>
                    <h3 className="text-2xl font-semibold text-white">Top contributing factors</h3>
                  </div>
                </div>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={factorData} layout="vertical" margin={{ left: -30, right: 20, top: 10, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.95)' }} contentStyle={{ background: 'rgba(15, 23, 42, 0.98)', border: '1px solid rgba(148, 163, 184, 0.1)' }} />
                      <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="#38bdf8">
                        {factorData.map((entry, index) => (
                          <Cell key={`factor-${index}`} fill={entry.name === 'Low engagement' ? '#8b5cf6' : '#38bdf8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <p className="text-slate-400 uppercase tracking-[0.3em] text-xs">Retention evaluator</p>
                <h3 className="text-2xl font-semibold text-white mt-2">Revenue loss estimator</h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                    <p className="text-slate-400 text-sm">Monthly revenue at risk</p>
                    <p className="mt-3 text-3xl font-semibold text-white">₹19.4L</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                    <p className="text-slate-400 text-sm">Retention impact</p>
                    <p className="mt-3 text-3xl font-semibold text-white">₹15L/year</p>
                  </div>
                </div>
                <div className="mt-6 rounded-[28px] bg-gradient-to-br from-slate-900/80 to-slate-950/70 p-5 border border-white/10">
                  <p className="text-slate-300 text-sm">Projected savings</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                      <p className="text-slate-200">Reduce churn by 10%</p>
                      <p className="mt-3 text-lg font-semibold text-cyan-300">Save ₹15L/year</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                      <p className="text-slate-200">Activate loyalty rewards</p>
                      <p className="mt-3 text-lg font-semibold text-violet-300">Improve retention by 7%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-xs">Customer journey</p>
                    <h3 className="text-2xl font-semibold text-white">Behavior timeline</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {behaviorTimeline.map((event) => (
                    <div key={event.time} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 transition hover:border-cyan-400/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-300">{event.time}</p>
                        <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${event.type === 'danger' ? 'bg-red-500/15 text-rose-300' : event.type === 'warning' ? 'bg-amber-500/15 text-amber-300' : 'bg-cyan-500/15 text-cyan-300'}`}>{event.type}</span>
                      </div>
                      <p className="mt-3 text-slate-100">{event.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            {segmentData.map((segment) => (
              <motion.div
                key={segment.label}
                whileHover={{ y: -8 }}
                className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow"
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-slate-400 text-sm uppercase tracking-[0.3em]">Segment</p>
                    <h4 className="mt-2 text-xl font-semibold text-white">{segment.label}</h4>
                  </div>
                  <div className="h-14 w-14 rounded-3xl bg-white/5 flex items-center justify-center text-xl text-cyan-300">{segment.value}%</div>
                </div>
                <div className="h-32 rounded-[28px] bg-slate-950/70 p-4 border border-white/10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: segment.label, value: segment.value }]} dataKey="value" innerRadius={34} outerRadius={52} paddingAngle={4} startAngle={180} endAngle={-180}>
                        <Cell fill={segment.color} />
                      </Pie>
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </section>

          <section className="glass-card rounded-[36px] border border-white/10 p-8 shadow-glow">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
              <div>
                <p className="text-slate-400 uppercase tracking-[0.28em] text-xs">Model performance</p>
                <h3 className="text-3xl font-semibold text-white mt-3">AI performance matrix</h3>
                <p className="mt-4 text-slate-300 leading-7">NeoPulse AI monitors accuracy, F1 score, ROC-AUC, and drift across customer behavior cohorts. Actionable metrics update automatically as data flows in.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Accuracy</p>
                  <p className="mt-3 text-3xl font-semibold text-white">94%</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">F1 Score</p>
                  <p className="mt-3 text-3xl font-semibold text-white">0.91</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">ROC-AUC</p>
                  <p className="mt-3 text-3xl font-semibold text-white">0.96</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Drift</p>
                  <p className="mt-3 text-3xl font-semibold text-white">3.2%</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
=======
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import AppLayout     from './components/layout/AppLayout'
import Landing       from './pages/Landing'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import Predict       from './pages/Predict'
import History       from './pages/History'
import Insights      from './pages/Insights'
import Settings      from './pages/Settings'
import Profile       from './pages/Profile'
import Upload        from './pages/Upload'
import Admin         from './pages/Admin'
import Simulator     from './pages/Simulator'
import ChatAssistant from './pages/ChatAssistant'
import Segmentation  from './pages/Segmentation'
import Forecast      from './pages/Forecast'

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : children
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index           element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="predict"      element={<Predict />} />
        <Route path="simulator"    element={<Simulator />} />
        <Route path="history"      element={<History />} />
        <Route path="analytics"    element={<Insights />} />
        <Route path="segmentation" element={<Segmentation />} />
        <Route path="forecast"     element={<Forecast />} />
        <Route path="upload"       element={<Upload />} />
        <Route path="chat"         element={<ChatAssistant />} />
        <Route path="settings"     element={<Settings />} />
        <Route path="profile"      element={<Profile />} />
        <Route path="admin"        element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
>>>>>>> 538dba42fdea1356695c9aeda7d25c7cbf503eb0
