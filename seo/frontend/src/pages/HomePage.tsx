import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Target,
  Shield,
  Rocket,
  CheckCircle,
  Bot,
  Globe2,
  BarChart3,
  Briefcase,
  Layout,
  Code2,
  Cpu,
  Sparkles,
  ArrowRight,
  Zap,
  Github,
  Send,
  Loader2,
  User as UserIcon
} from 'lucide-react';
// Removed Swiper slider in redesigned landing page
import Button from '../components/Common/Button';
import TypewriterEffect from '../components/TypewriterEffect';
import Footer from '../components/Layout/Footer';
// Live previews of real features (scaled, non-interactive)
// Live previews of real features (scaled, non-interactive)
import FeatureGallery from '../components/FeatureGallery';
import CountUpStats from '../components/Common/CountUpStats';
import apiService, { PlatformStats } from '../services/api';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';

const HomePage: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [realStats, setRealStats] = useState<PlatformStats>({
    active_users: 0,
    keywords_tracked: 0,
    uptime: 99.9,
    support: '24/7'
  });

  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string, confidence?: number, follow_up_questions?: string[]}[]>([
    { role: 'assistant', content: 'Hi there! 👋 Ask me anything about Scalnex platform features and capabilities. I\'m here to help!' }
  ]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAskQuestion = async (e?: React.FormEvent, followUp?: string) => {
    e?.preventDefault();
    const userQ = followUp || query.trim();
    if (!userQ) return;
    
    const userMsg = { role: 'user' as const, content: userQ };
    setMessages(prev => [...prev, userMsg]);
    if (!followUp) setQuery('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/platform_bot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQ, answer_type: 'short' })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant' as const, 
          content: data.answer,
          confidence: data.confidence,
          follow_up_questions: data.follow_up_questions
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant' as const, 
          content: data.error || "Sorry, I'm having connection issues." 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant' as const, 
        content: "System error: Could not reach central core." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    // Fetch real stats on mount
    apiService.getPlatformStats().then(response => {
      if (response.success && response.data) {
        setRealStats(response.data);
      }
    });
  }, []);

  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pf, setPf] = useState(1); // parallax factor by viewport
  const [reduceMotion, setReduceMotion] = useState(false);
  const navigate = useNavigate();

  // Removed legacy toolkits slider data in new layout

  const teamMembers = [
    {
      name: 'Sujal Patil',
      role: 'Team Member',
      image: '/team/sujal-patil.png',
      bio: 'Visionary leader driving innovation at Scalnex.',
      social: { twitter: '#', linkedin: '#' }
    },
    {
      name: 'Rahul Sisode',
      role: 'Team Member ',
      image: '/team/rahul-sisode.jpg',
      bio: 'Expert developer building robust solutions for business growth.',
      social: { twitter: '#', github: '#' }
    },
    {
      name: 'Omkar Waghralkar',
      role: 'Team Member',
      image: '/team/team-member-3.jpeg',
      bio: 'Creative designer crafting exceptional user experiences.',
      social: { linkedin: '#', dribbble: '#' }
    }
  ];



  // features data removed (unused)

  // Removed legacy SEO tools card grid in redesigned landing page


  // Slider logic removed

  // Legacy handlers removed in redesigned landing page

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  // Viewport-aware parallax factor (smaller on mobile) and reduced motion support
  useEffect(() => {
    const computePf = () => {
      const w = window.innerWidth;
      if (w < 640) return 0.5;
      if (w < 1024) return 0.8;
      return 1;
    };
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPref = () => setReduceMotion(mq.matches);
    const set = () => setPf(computePf());
    set();
    onPref();
    window.addEventListener('resize', set);
    mq.addEventListener?.('change', onPref);
    return () => window.removeEventListener('resize', set);
  }, []);

  // If reduced motion is requested, minimize parallax intensity
  const parallaxFactor = reduceMotion ? 0 : pf;

  // Lock scroll and add ESC to close when gallery open
  useEffect(() => {
    if (isGalleryOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setIsGalleryOpen(false); } };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = original; window.removeEventListener('keydown', onKey); };
    }
  }, [isGalleryOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    if (isUserMenuOpen) {
      const onClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-user-menu]')) {
          setIsUserMenuOpen(false);
        }
      };
      document.addEventListener('click', onClickOutside);
      return () => document.removeEventListener('click', onClickOutside);
    }
  }, [isUserMenuOpen]);

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950`}>
      {/* Page content wrapper gets the background scale/blur when gallery open */}
      <div className={`transition-transform duration-300 ${isGalleryOpen ? 'scale-[0.96] filter blur-[1px] md:blur-[2px]' : ''}`}>
        {/* 1) HERO SECTION */}
        <section className="relative overflow-hidden" onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) / r.width;
          const y = (e.clientY - r.top - r.height / 2) / r.height;
          setMouse({ x, y });
        }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-indigo-600/15 dark:from-blue-500/15 dark:via-purple-500/10 dark:to-indigo-500/15"></div>
          <div className="pointer-events-none absolute -inset-[20%] opacity-60">
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ transform: `translate3d(${mouse.x * (12 * parallaxFactor)}px, ${mouse.y * (12 * parallaxFactor)}px, 0)` }}
              className="absolute left-1/3 top-20 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tr from-blue-600/25 to-transparent blur-3xl"
            />
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              style={{ transform: `translate3d(${mouse.x * (-16 * parallaxFactor)}px, ${mouse.y * (-10 * parallaxFactor)}px, 0)` }}
              className="absolute right-1/4 -bottom-10 w-[42rem] h-[42rem] rounded-full bg-gradient-to-bl from-purple-600/25 to-transparent blur-3xl"
            />
            <motion.div
              aria-hidden
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
              style={{ transform: `translate3d(${mouse.x * (8 * parallaxFactor)}px, ${mouse.y * (-6 * parallaxFactor)}px, 0)` }}
              className="absolute left-10 top-1/2 w-64 h-64 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/5 backdrop-blur will-change-transform"
            />
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 relative">
            {/* mouse-follow spotlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-60"
              style={{ background: `radial-gradient(600px at ${50 + mouse.x * 20}% ${50 + mouse.y * 20}%, rgba(255,255,255,0.15), transparent 60%)` }}
            />
            <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: 'easeOut' }} className="flex flex-col items-center text-center gap-2">
              <div>
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 text-xs text-gray-700 dark:text-gray-300 mb-5">
                  <Rocket className="w-4 h-4 mr-2 text-primary-600" /> All-in-one AI Growth Platform
                </div>
                <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: 'easeOut' }} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Grow faster with
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    <TypewriterEffect words={["AI SEO", "Content Generation", "Smart Analytics", "Marketplace"]} speed={80} delay={3000} />
                  </span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }} className="mt-5 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Instant audits, AI-assisted content, actionable analytics, and a built‑in marketplace—everything you need to scale.</motion.p>
                <div className="mt-10 flex flex-col items-center gap-6">
                  {/* Main CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="relative" data-user-menu>
                      <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          size="lg"
                          className="px-8 py-4"
                          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        >
                          Get Started Free
                          <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${isUserMenuOpen ? 'rotate-90' : ''}`} />
                        </Button>
                      </motion.div>

                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                        >
                          <div className="p-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { setIsUserMenuOpen(false); navigate('/user-login'); }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <span className="text-lg">👤</span>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">User</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Individual account</div>
                              </div>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" size="lg" className="px-8 py-4" onClick={() => setIsGalleryOpen(true)}>
                        Explore Features
                      </Button>
                    </motion.div>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">

                  {/* Active Users */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4 text-center"
                  >
                    <Users className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      <CountUpStats end={realStats.active_users} suffix="+" duration={2} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
                  </motion.div>

                  {/* Business Accounts */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4 text-center"
                  >
                    <Briefcase className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      <CountUpStats end={realStats.business_accounts || 0} suffix="+" duration={2} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Business Accounts</div>
                  </motion.div>

                  {/* Uptime */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4 text-center"
                  >
                    <Shield className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      <CountUpStats end={realStats.uptime} suffix="%" decimals={1} duration={2} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
                  </motion.div>

                  {/* Support */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4 text-center"
                  >
                    <Target className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{realStats.support}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Support</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PRODUCT STORY (RICH GRID) */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6">
                  Why Scalnex?
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Stop juggling <span className="text-gray-400 dark:text-gray-600">multiple tools</span>.<br />
                  Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">scaling</span>.
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Most growth teams waste hours switching between SEO crawlers, content writers, and analytics dashboards. Scalnex brings it all together in one intelligent operating system.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { title: 'Technical SEO', desc: 'Real-time audits & fixes', icon: Search, color: 'text-blue-500' },
                    { title: 'AI Content', desc: 'Blog posts in seconds', icon: Sparkles, color: 'text-purple-500' },
                    { title: 'Analytics', desc: 'Unified growth metrics', icon: BarChart3, color: 'text-indigo-500' },
                    { title: 'Hiring', desc: 'Find top talent fast', icon: Briefcase, color: 'text-pink-500' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-900 ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-20 dark:opacity-40" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
                      <Cpu className="w-8 h-8 text-blue-500 mb-4" />
                      <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-2 w-12 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 opacity-80">
                      <Code2 className="w-8 h-8 text-purple-500 mb-4" />
                      <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-2 w-10 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-12">
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 opacity-90">
                      <Layout className="w-8 h-8 text-indigo-500 mb-4" />
                      <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-2 w-16 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
                      <Globe2 className="w-8 h-8 text-pink-500 mb-4" />
                      <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-2 w-14 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2) FEATURE SHOWCASE (ADVANCED ANIMATIONS) */}
        <section className="py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-32">

            {/* Feature 1: SEO Audit (Scanning Animation) */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-[2rem] blur-2xl -z-10 group-hover:blur-3xl transition-all duration-500" />
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900 relative">
                  {/* Browser Chrome */}
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  {/* Content */}
                  <div className="p-6 relative h-72 bg-white dark:bg-gray-950 overflow-hidden">
                    <div className="space-y-3 opacity-50">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                      <div className="h-32 bg-gray-100 dark:bg-gray-900 rounded w-full mt-4 border border-gray-200 dark:border-gray-800" />
                    </div>

                    {/* Scanning Beam */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/10 to-blue-500/0 border-b-2 border-blue-500/30"
                      animate={{ top: ['-10%', '110%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Floating Score Badge */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-green-500 text-green-600 dark:text-green-400 px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 z-10"
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <CheckCircle className="w-5 h-5" />
                      SEO Score: 98/100
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold tracking-wide uppercase mb-6">
                  <Zap className="w-3 h-3 mr-1" /> Audit & Fix
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Foundational SEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Perfected</span></h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Stop guessing. Get instant, prioritized technical audits that tell you exactly what to fix to improve your site health and rankings.
                </p>
                <div className="space-y-6">
                  {[
                    { title: 'Automated technical audits scans', desc: 'Deep crawl of every page to find broken links and errors.' },
                    { title: 'Actionable on-page recommendations', desc: 'Step-by-step guides to fix H1s, meta tags, and speed.' },
                    { title: 'White-label PDF reports for clients', desc: 'Impress clients with branded, professional reports.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 2: AI Content (Typing Animation) */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold tracking-wide uppercase mb-6">
                  <Sparkles className="w-3 h-3 mr-1" /> AI Content
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Content that <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Ranks</span></h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Generate SEO-optimized articles, social posts, and ad copy in seconds. Our AI understands search intent and your brand voice.
                </p>
                <div className="space-y-6">
                  {[
                    { title: 'One-click blog post generation', desc: 'From topic to full article with headings and images.' },
                    { title: 'Built-in keyword optimization', desc: 'Automatically includes LSI keywords for better ranking.' },
                    { title: 'Plagiarism-free & undetectable', desc: '100% original content that passes AI detection.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[2rem] blur-2xl -z-10 group-hover:blur-3xl transition-all duration-500" />
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="h-full bg-gray-50 dark:bg-gray-900 p-6 flex flex-col min-h-[320px]">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                      <Bot className="w-8 h-8 p-1.5 bg-purple-600 rounded-lg text-white" />
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">AI Writer</div>
                        <div className="text-xs text-green-500">Generating...</div>
                      </div>
                    </div>
                    <div className="font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300 flex-1">
                      <TypewriterEffect
                        words={["The future of SEO is automated.", "Scalnex allows you to dominate search results without hiring an agency.", "Start your growth journey today."]}
                        speed={35}
                        delay={100}
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Unified Data (Interactive Dashboard) */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-[2rem] blur-2xl -z-10 group-hover:blur-3xl transition-all duration-500" />
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900 p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <h4 className="font-bold text-gray-900 dark:text-white">Revenue Growth</h4>
                    <span className="text-green-500 text-sm font-medium">+124%</span>
                  </div>
                  {/* Animated Bar Chart */}
                  <div className="flex items-end justify-between h-48 gap-2">
                    {[30, 45, 35, 60, 50, 75, 90, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-gray-400">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-6">
                  <BarChart3 className="w-3 h-3 mr-1" /> Unified Data
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Growth at a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Glance</span></h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Connect your data sources and get a single truth for your growth metrics. Track keywords, traffic, and revenue in real-time.
                </p>
                <div className="space-y-6">
                  {[
                    { title: 'Consolidated performance dashboards', desc: 'All your metrics from GSC, GA4, and social in one place.' },
                    { title: 'Competitor tracking & benchmarking', desc: 'Spy on competitors and steal their best performing keywords.' },
                    { title: 'Customizable data exports', desc: 'Schedule reports to be sent to your team automatically.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3) HOW IT WORKS */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">From zero to <span className="text-blue-600">growth</span></h2>
              <p className="text-gray-600 dark:text-gray-400">Three simple steps to supercharge your business.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />

              {[
                { t: 'Connect Data', d: 'Add your website to start the audit.', i: Globe2, c: 'bg-blue-600' },
                { t: 'Get Insights', d: 'AI identifies gaps and opportunities.', i: Bot, c: 'bg-purple-600' },
                { t: 'Take Action', d: 'Publish content and fix issues instantly.', i: Rocket, c: 'bg-indigo-600' }
              ].map((s, idx) => {
                const Icon = s.i;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col items-center text-center group"
                  >
                    <div className={`w-24 h-24 rounded-3xl ${s.c} text-white flex items-center justify-center mb-6 shadow-xl shadow-blue-900/10 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.t}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">{s.d}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>




        {/* 4) WHO IT'S FOR */}
        <section className="py-24 bg-gray-50 dark:bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Built for modern teams</h2>
              <p className="text-gray-600 dark:text-gray-400">Whether you're solo or scaling, we've got you covered.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { t: 'Startups', c: 'Launch fast with AI-assisted growth', i: Rocket, color: 'blue' },
                { t: 'Agencies', c: 'Deliver client results at scale', i: Briefcase, color: 'purple' },
                { t: 'Creators', c: 'Create, optimize, publish faster', i: Sparkles, color: 'pink' },
                { t: 'Enterprises', c: 'Unified intelligence & security', i: Shield, color: 'indigo' }
              ].map((p, idx) => {
                const Icon = p.i;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="rounded-2xl border-2 border-transparent hover:border-blue-500/20 bg-white dark:bg-gray-900 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${p.color}-50 dark:bg-${p.color}-900/20 text-${p.color}-600 dark:text-${p.color}-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{p.t}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.c}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5) TRUST & PRODUCT DEPTH (BENTO GRID) */}
        <section className="py-32 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900/50 dark:via-gray-900 dark:to-gray-900/50"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              >
                All‑in‑one <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-violet-600">Growth Platform</span>
              </motion.h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to scale, integrated into one seamless workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
              {/* 1. Main Card - Analytics (Span 2 cols, full height on desktop) */}
              <motion.div
                className="md:col-span-2 md:row-span-2 rounded-3xl bg-gray-900 text-white overflow-hidden relative group shadow-2xl border border-gray-800"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <BarChart3 className="w-64 h-64 text-blue-500" />
                </div>
                <div className="p-8 relative z-10 flex flex-col h-full">
                  <div className="mb-auto">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-500/30">
                      Command Center
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-400 max-w-sm">Real-time view of your entire growth engine.</p>
                  </div>

                  {/* Mock UI - Large Chart */}
                  <div className="mt-8 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
                        <div className="text-3xl font-bold">$124,500 <span className="text-green-400 text-sm font-normal">▲ 12%</span></div>
                      </div>
                      <div className="flex gap-2">
                        {['1D', '1W', '1M', '1Y'].map(t => (
                          <div key={t} className={`px-3 py-1 rounded-lg text-xs cursor-pointer ${t === '1M' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t}</div>
                        ))}
                      </div>
                    </div>
                    <div className="h-40 flex items-end justify-between gap-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                        <div key={i} className="w-full bg-gradient-to-t from-blue-600/50 to-blue-500 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 2. Side Card Top - SEO */}
              <motion.div
                className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg relative overflow-hidden group"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">SEO Intelligence</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Rank tracking & opportunities.</p>

                  {/* Mock UI - List */}
                  <div className="space-y-3">
                    {[
                      { k: 'seo tools', r: '#1', v: '22k' },
                      { k: 'audit software', r: '#3', v: '18k' },
                      { k: 'keyword scanner', r: '#1', v: '12k' }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">{row.k}</div>
                        <div className="flex gap-3 text-xs">
                          <span className="text-green-600 font-bold">{row.r}</span>
                          <span className="text-gray-400">{row.v}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* 3. Side Card Bottom - Content */}
              <motion.div
                className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg relative overflow-hidden group"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Content Engine</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">AI-driven publishing workflow.</p>

                  {/* Mock UI - Editor */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex gap-2 mb-3">
                      <div className="h-1.5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-1.5 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full" />
                      <div className="h-1 w-5/6 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full" />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <div className="px-2 py-1 rounded bg-purple-600 text-white text-[10px]">Publish</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-500 dark:text-gray-400 opacity-70">
              <div className="flex items-center gap-2 select-none">
                <Shield className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-wide">SOC2 TYPE II READY</span>
              </div>
              <div className="flex items-center gap-2 select-none">
                <Target className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-wide">99.99% UPTIME SLA</span>
              </div>
              <div className="flex items-center gap-2 select-none">
                <Users className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-wide">BATTLE-TESTED AT SCALE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Scalnex Team Section - Premium Redesign */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900/50" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase mb-6"
              >
                Our Visionaries
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Scalnex Team</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                The minds behind the platform. Scale smarter, grow faster.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Card Background with Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                  <div className="relative h-full bg-white dark:bg-gray-800 rounded-[1.4rem] p-4 flex flex-col shadow-xl">
                    {/* Image Container */}
                    <div className="relative w-48 h-48 mx-auto overflow-hidden rounded-full mb-4 bg-gray-100 dark:bg-gray-700">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                        }}
                      />
                      {/* Social Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        {Object.keys(member.social).map((platform, i) => (
                          <a key={i} href="#" className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110">
                            {platform === 'twitter' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                            {platform === 'linkedin' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>}
                            {platform === 'github' && <Github className="w-4 h-4" />}
                            {platform === 'dribbble' && <Globe2 className="w-4 h-4" />}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center px-2 pb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{member.name}</h3>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">{member.role}</div>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm line-clamp-3">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Chatbot Modal */}
        {isChatbotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={toggleChatbot}
            ></div>

            {/* Chatbot Container - Mobile-like format */}
            <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl h-[80vh] max-h-[700px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-600 flex flex-col">
              {/* Header - Mobile app style */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">AI Assistant</h3>
                    <p className="text-xs sm:text-sm text-purple-100">Online • Ready to help</p>
                  </div>
                </div>
                <button
                  onClick={toggleChatbot}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors bg-white/10 backdrop-blur-sm"
                  aria-label="Close chatbot"
                  title="Close chatbot"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="chatbot-scroll-area flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                 {messages.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                       <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'}`}>
                          {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                       </div>
                       <div className={`max-w-[85%] text-sm ${msg.role === 'user' ? '' : ''}`}>
                         <div className={`p-3 rounded-2xl ${
                             msg.role === 'user' 
                             ? 'bg-blue-600 text-white rounded-tr-none' 
                             : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none leading-relaxed whitespace-pre-wrap border border-gray-100 dark:border-gray-600 shadow-sm'
                         }`}>
                            {msg.content}
                         </div>
                         
                         {/* Follow-up Questions for Assistant */}
                         {msg.role === 'assistant' && msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
                           <div className="mt-2 space-y-1">
                             <p className="text-xs font-medium text-gray-600 dark:text-gray-300 px-1">Quick follow-ups:</p>
                             <div className="space-y-1">
                               {msg.follow_up_questions.map((q, i) => (
                                 <button
                                   key={i}
                                   onClick={() => handleAskQuestion(undefined, q)}
                                   className="block w-full text-left px-2 py-1 rounded text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors truncate"
                                   title={q}
                                 >
                                   → {q}
                                 </button>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                    </div>
                 ))}
                 {isTyping && (
                    <div className="flex items-center gap-3 text-gray-400">
                       <Bot className="h-5 w-5 text-purple-400" />
                       <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-600 shadow-sm">
                         <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                       </div>
                    </div>
                 )}
                 <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white dark:bg-gray-800">
                 <form onSubmit={handleAskQuestion} className="relative flex items-center">
                    <input 
                       type="text"
                       value={query}
                       onChange={e => setQuery(e.target.value)}
                       placeholder="Ask about Scalnex features..."
                       className="w-full bg-gray-100 dark:bg-gray-900 border border-transparent text-gray-900 dark:text-white rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button 
                       type="submit"
                       disabled={isTyping || !query.trim()}
                       aria-label="Send message"
                       title="Send message"
                       className="absolute right-2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-full disabled:opacity-50 transition-colors"
                    >
                       <Send className="h-4 w-4 ml-0.5" />
                    </button>
                 </form>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Only visible on HomePage */}
        <Footer />

      </div>

      {/* Feature Gallery Overlay */}
      <FeatureGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />

      {/* Floating Chatbot Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.3 }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-green-600 to-gray-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
        onClick={toggleChatbot}
        aria-label="Open AI Assistant"
        title="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default HomePage;


