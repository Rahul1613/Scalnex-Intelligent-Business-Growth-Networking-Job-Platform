import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Users, TrendingUp, FileText, Settings, User, BarChart3, Briefcase, Heart, Zap, ArrowRight, Target, Map
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

/**
 * Simplified Dashboard
 * Focused on quick utility access with minimal clutter.
 */
const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#030712] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl text-center max-w-md backdrop-blur-3xl"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Zap className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Authentication required to access tools.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Authenticate Now
          </button>
        </motion.div>
      </div>
    );
  }

  const sections = [
    { id: 'seo-tools', label: 'SEO Tools', icon: Search, path: '/seo-tools', color: 'bg-blue-500', desc: 'Audit & Optimize' },
    { id: 'geo-analyzer', label: 'Geo Analyzer', icon: Map, path: '/geo-analyzer', color: 'bg-indigo-600', desc: 'Location Intelligence' },
    { id: 'reach-opt', label: 'Reach Optimization', icon: Target, path: '/reach-optimization', color: 'bg-emerald-500', desc: 'Expand Visibility' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', color: 'bg-purple-500', desc: 'Deep Data Audit' },
    { id: 'sentiment', label: 'Sentiment & Rep', icon: Heart, path: '/sentiment-analysis', color: 'bg-rose-500', desc: 'Public Perception' },
    { id: 'growth-tips', label: 'Growth Tips', icon: TrendingUp, path: '/growth-tips', color: 'bg-amber-500', desc: 'ROI Strategies' },
    { id: 'employees', label: 'Employees', icon: Users, path: '/employees', color: 'bg-cyan-500', desc: 'Team Resilience' },
    { id: 'recruitment', label: 'Recruitment', icon: Briefcase, path: '/recruitment-details', color: 'bg-indigo-500', desc: 'Talent Acquisition' },
    { id: 'products', label: 'Product Details', icon: FileText, path: '/product-details', color: 'bg-slate-500', desc: 'Asset Inventory' },
    { id: 'content', label: 'Content Studio', icon: FileText, path: '/content', color: 'bg-fuchsia-500', desc: 'Media Hub' },
    { id: 'profile', label: 'Personal Profile', icon: User, path: '/profile', color: 'bg-gray-600', desc: 'Identity Specs' },
    { id: 'settings', label: 'Core Settings', icon: Settings, path: '/settings', color: 'bg-zinc-700', desc: 'System Config' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Simplified Header */}
        <div className="pt-4">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Quick access to your tools and insights.</p>
        </div>

        {/* Action Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                variants={itemVariants}
                onClick={() => navigate(section.path)}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group relative flex flex-col items-start p-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm hover:shadow-md transition-all text-left overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-xl ${section.color} text-white flex items-center justify-center mb-8 shadow-sm transition-transform duration-500`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-black dark:text-white uppercase tracking-tight">{section.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">{section.desc}</p>
                </div>

                <div className="absolute top-8 right-8 text-gray-200 dark:text-white/5">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
