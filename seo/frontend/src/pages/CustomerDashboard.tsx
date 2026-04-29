import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, Briefcase, ShoppingBag, Search, MapPin, DollarSign, Clock, Filter, Star, CheckCircle2, ChevronRight, Globe
} from 'lucide-react';
import Button from '../components/Common/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiService, JobListing, ProductListing } from '../services/api';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsData = await apiService.getJobs();
      if (jobsData.success && jobsData.data) setJobs(jobsData.data);

      const productsData = await apiService.getProducts();
      if (productsData.success && productsData.data) setProducts(productsData.data);
    } catch (error) {
      console.error("Error loading marketplace data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // --- SUB-COMPONENTS ---

  const renderOverview = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:scale-105 transition-transform cursor-pointer" onClick={() => handleTabChange('companies')}>
          <Building2 className="w-10 h-10 mb-4 opacity-80" />
          <h3 className="text-4xl font-bold mb-1">Active</h3>
          <p className="text-blue-100">Browse Marketplace</p>
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:scale-105 transition-transform cursor-pointer" onClick={() => handleTabChange('jobs')}>
          <Briefcase className="w-10 h-10 mb-4 opacity-80" />
          <h3 className="text-4xl font-bold mb-1">{jobs.length}+</h3>
          <p className="text-purple-100">Active Job Openings</p>
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-xl hover:scale-105 transition-transform cursor-pointer" onClick={() => handleTabChange('services')}>
          <ShoppingBag className="w-10 h-10 mb-4 opacity-80" />
          <h3 className="text-4xl font-bold mb-1">{products.length}+</h3>
          <p className="text-pink-100">Professional Services</p>
        </div>
      </div>

      {/* Featured Jobs Preview */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Opportunities</h2>
          <Button variant="outline" onClick={() => handleTabChange('jobs')}>View All Jobs</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 4).map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex gap-4">
              <div className={`w-12 h-12 rounded-lg ${job.logo} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                {job.company.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white">{job.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{job.company}</p>
                <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                </div>
              </div>
              <button
                className="h-fit px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                onClick={() => navigate('/marketplace', { state: { applyJobId: job.id } })}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Content Tools */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Content Tools</h2>
          <Button variant="outline" onClick={() => navigate('/content')}>Open Content Studio</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'blog', title: 'Blog Post Generator', desc: 'Create full SEO-optimized blog posts.' },
            { id: 'social', title: 'Social Media Posts', desc: 'Generate tweets, captions, and posts.' },
            { id: 'video', title: 'Video Content Ideas', desc: 'Get viral video titles and hooks.' },
            { id: 'keywords', title: 'Keyword Suggestions', desc: 'Find high-volume keywords.' },
            { id: 'seo', title: 'SEO Content Analysis', desc: 'Check readability and keyword density.' }
          ].map(tool => (
            <div key={tool.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">{tool.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.desc}</p>
              <div className="mt-auto">
                <Button variant="outline" onClick={() => navigate('/content', { state: { tool: tool.id } })}>Open Workspace</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* For Companies - Demo Access */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">For Companies</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Log in to the demo company account and review applicants, view resumes, and accept/reject applications.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/business-signin')}>Demo Company Login</Button>
            <Button onClick={() => navigate('/dashboard')}>Open Dashboard</Button>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Application Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Check your submitted job/internship applications, messages, and offer letters.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/user-dashboard')}>Check Status</Button>
            <Button variant="outline" onClick={() => navigate('/user-login')}>User Login</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobsBoard = () => (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 shrink-0 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Filter size={16} /> Filters</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Job Type</label>
              <div className="space-y-2">
                {['All', 'Full-time', 'Internship', 'Remote'].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobTypeFilter === type}
                      onChange={() => setJobTypeFilter(type)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Salary Range</label>
              <input type="range" className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>50LPA+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{jobs.length} Jobs Found</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search roles, skills..."
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {jobs.filter(j => jobTypeFilter === 'All' || j.type === jobTypeFilter || (jobTypeFilter === 'Remote' && j.location === 'Remote')).map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-xl ${job.logo} flex items-center justify-center text-white font-bold text-xl`}>
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">{job.company}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                        <Briefcase size={12} /> {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                        <MapPin size={12} /> {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                        <DollarSign size={12} /> {job.salary}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
                        <Clock size={12} /> {job.posted}
                      </span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate('/marketplace', { state: { applyJobId: job.id } })}>Apply Now</Button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 mb-2">Skills Required:</p>
                <div className="flex gap-2">
                  {job.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServicesMarketplace = () => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Business Services Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className={`h-32 ${product.image} w-full flex items-center justify-center`}>
              <ShoppingBag className="text-gray-400 opacity-50 w-12 h-12" />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">{product.category}</span>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                  <Star size={14} fill="currentColor" /> {product.rating}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4">by {product.provider}</p>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{product.price}</span>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center space-x-2">
                <Building2 className="text-blue-600" size={28} />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Marketplace
                </span>
              </div>

              {/* Tabs */}
              <nav className="hidden md:flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Globe },
                  { id: 'companies', label: 'Companies', icon: Building2 },
                  { id: 'jobs', label: 'Jobs', icon: Briefcase },
                  { id: 'services', label: 'Services', icon: ShoppingBag },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                            px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                            ${activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
                        `}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'jobs' && renderJobsBoard()}
            {activeTab === 'services' && renderServicesMarketplace()}
            {activeTab === 'companies' && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Company Directory</h3>
                <p className="text-gray-500">Feature coming soon! Browse top companies and their culture.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomerDashboard;
