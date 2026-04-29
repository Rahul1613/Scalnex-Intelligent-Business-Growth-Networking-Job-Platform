import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, Briefcase, ShoppingBag, Building2, ArrowLeft, ExternalLink,
  MessageSquare, Star, Send, Package
} from 'lucide-react';
import Button from '../components/Common/Button';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Job {
  id: number; title: string; description: string; jobType: string; location: string;
  salaryMin: number; salaryMax: number; requirements: string; responsibilities: string;
  benefits: string; applicationsCount: number; createdAt: number;
}

interface Product {
  id: number; name: string; description: string; category: string; price: number;
  productType: string; images: string; availability: string; features: string;
}

interface Business {
  id: number; businessName: string; businessCategory: string; businessDescription: string;
  businessLogo: string; businessAddress: string; businessEmail: string; businessContactNumber: string;
  websiteUrl: string; latitude: number; longitude: number; jobs: Job[]; products: Product[];
}

const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'marketplace'>('overview');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [applicationData, setApplicationData] = useState({ coverLetter: '', resume: '' });
  const [inquiryMessage, setInquiryMessage] = useState('');
  const serverUrl = 'http://127.0.0.1:5001';

  useEffect(() => {
    fetchBusinessDetails();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/marketplace/businesses/${id}`);
      const data = await response.json();
      if (data.success) setBusiness(data.business);
    } catch (error) {
      toast.error('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const handleJobApplication = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for jobs');
      return;
    }
    if (!selectedJob || !user) return;
    try {
      const response = await fetch(`${serverUrl}/api/marketplace/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...applicationData })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Application submitted successfully!');
        setShowApplicationModal(false);
        setApplicationData({ coverLetter: '', resume: '' });
        setSelectedJob(null);
      } else {
        toast.error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const handleProductInquiry = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to inquire about products');
      return;
    }
    if (!selectedProduct || !user) return;
    try {
      const response = await fetch(`${serverUrl}/api/marketplace/products/${selectedProduct.id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: inquiryMessage })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Inquiry sent successfully!');
        setShowInquiryModal(false);
        setInquiryMessage('');
        setSelectedProduct(null);
      } else {
        toast.error(data.error || 'Failed to send inquiry');
      }
    } catch (error) {
      toast.error('Failed to send inquiry');
    }
  };

  const openGoogleMaps = () => {
    if (business?.latitude && business?.longitude) {
      window.open(`https://www.google.com/maps?q=${business.latitude},${business.longitude}`, '_blank');
    } else if (business?.businessAddress) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.businessAddress)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Business not found</h3>
          <Button onClick={() => navigate('/marketplace')}><ArrowLeft size={16} className="mr-2" />Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={() => navigate(-1)}
              className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft size={16} className="mr-2" />Back to Companies
            </Button>
          </motion.div>
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              {business.businessLogo ? (
                <img src={business.businessLogo} alt={business.businessName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Building2 className="text-white" size={64} />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{business.businessName}</h1>
              <p className="text-lg text-purple-600 dark:text-purple-400 font-medium mb-4">{business.businessCategory}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {business.businessAddress && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin size={18} className="mr-2 flex-shrink-0" />
                    <span>{business.businessAddress}</span>
                  </div>
                )}
                {business.businessContactNumber && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Phone size={18} className="mr-2 flex-shrink-0" />
                    <span>{business.businessContactNumber}</span>
                  </div>
                )}
                {business.businessEmail && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail size={18} className="mr-2 flex-shrink-0" />
                    <span>{business.businessEmail}</span>
                  </div>
                )}
                {business.websiteUrl && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Globe size={18} className="mr-2 flex-shrink-0" />
                    <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors">
                      {business.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={openGoogleMaps}><MapPin size={18} className="mr-2" />View on Map</Button>
                {business.websiteUrl && (
                  <Button variant="outline" onClick={() => window.open(business.websiteUrl, '_blank')}>
                    <ExternalLink size={18} className="mr-2" />Visit Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button onClick={() => setActiveTab('overview')} className={`py-4 border-b-2 font-semibold transition-colors ${activeTab === 'overview' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Overview
            </button>
            <button onClick={() => setActiveTab('jobs')} className={`py-4 border-b-2 font-semibold transition-colors flex items-center ${activeTab === 'jobs' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Briefcase size={18} className="mr-2" />Jobs ({business.jobs?.length || 0})
            </button>
            <button onClick={() => setActiveTab('marketplace')} className={`py-4 border-b-2 font-semibold transition-colors flex items-center ${activeTab === 'marketplace' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <ShoppingBag size={18} className="mr-2" />Marketplace ({business.products?.length || 0})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About {business.businessName}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{business.businessDescription || 'No description available.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <Briefcase className="mb-3" size={32} />
                <h3 className="text-3xl font-bold mb-1">{business.jobs?.length || 0}</h3>
                <p className="text-blue-100">Open Positions</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <ShoppingBag className="mb-3" size={32} />
                <h3 className="text-3xl font-bold mb-1">{business.products?.length || 0}</h3>
                <p className="text-purple-100">Products & Services</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <Star className="mb-3" size={32} />
                <h3 className="text-3xl font-bold mb-1">4.8</h3>
                <p className="text-pink-100">Average Rating</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'jobs' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {business.jobs && business.jobs.length > 0 ? (
              business.jobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">{job.jobType}</span>
                        {job.location && <span className="flex items-center text-gray-600 text-sm"><MapPin size={14} className="mr-1" />{job.location}</span>}
                      </div>
                    </div>
                    <Button onClick={() => { setSelectedJob(job); setShowApplicationModal(true); }}>
                      <Send size={18} className="mr-2" />Apply Now
                    </Button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{job.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                <Briefcase className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No open positions</h3>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'marketplace' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {business.products && business.products.length > 0 ? (
              business.products.map((product) => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                    {product.images ? <img src={product.images.split(',')[0]} alt={product.name} className="w-full h-full object-cover" /> : <Package className="text-white" size={64} />}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                    <p className="text-sm text-purple-600 font-medium mb-2">{product.category} • {product.productType}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                    {product.price && <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">${product.price.toLocaleString()}</div>}
                    <Button className="w-full" onClick={() => { setSelectedProduct(product); setShowInquiryModal(true); }}>
                      <MessageSquare size={18} className="mr-2" />Inquire Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No products or services</h3>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Apply for {selectedJob.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">at {business.businessName}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Letter</label>
                <textarea value={applicationData.coverLetter} onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })} rows={6} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="Tell us why you're a great fit..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resume/CV Link</label>
                <input type="text" value={applicationData.resume} onChange={(e) => setApplicationData({ ...applicationData, resume: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="https://drive.google.com/your-resume" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleJobApplication} className="flex-1">Submit Application</Button>
              <Button variant="outline" onClick={() => { setShowApplicationModal(false); setSelectedJob(null); setApplicationData({ coverLetter: '', resume: '' }); }} className="flex-1">Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showInquiryModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Inquire about {selectedProduct.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Send a message to {business.businessName}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Message</label>
              <textarea value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} rows={6} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" placeholder="I'm interested in this product/service..." />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleProductInquiry} className="flex-1">Send Inquiry</Button>
              <Button variant="outline" onClick={() => { setShowInquiryModal(false); setSelectedProduct(null); setInquiryMessage(''); }} className="flex-1">Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BusinessDetailPage;
