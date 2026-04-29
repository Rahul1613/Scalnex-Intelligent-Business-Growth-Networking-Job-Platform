import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Lightbulb,
  Rocket,
  ChevronRight,
  CheckCircle,
  Star,
  BarChart3,
  Search,
  Share2
} from 'lucide-react';

interface Tip {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  impact: 'High' | 'Medium' | 'Low';
  timeframe: string;
}

const GrowthTipsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [implementedTips, setImplementedTips] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load implemented tips from database on mount
  useEffect(() => {
    const loadImplementedTips = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5001/api/implemented-tips/${user.id}`);
        const data = await response.json();

        if (data.implementedTips) {
          const tipIds = new Set<string>(data.implementedTips.map((tip: any) => tip.tipId as string));
          setImplementedTips(tipIds);
        }
      } catch (error) {
        console.error('Error loading implemented tips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImplementedTips();
  }, [user]);

  const categories = [
    { id: 'all', name: 'All Tips', icon: TrendingUp, color: 'blue' },
    { id: 'marketing', name: 'Marketing', icon: Rocket, color: 'purple' },
    { id: 'seo', name: 'SEO', icon: Search, color: 'green' },
    { id: 'social', name: 'Social Media', icon: Share2, color: 'pink' },
    { id: 'conversion', name: 'Conversion', icon: Target, color: 'orange' },
    { id: 'revenue', name: 'Revenue', icon: DollarSign, color: 'emerald' },
  ];

  const tips: Tip[] = [
    {
      id: '1',
      title: 'Optimize Your Google My Business Profile',
      description: 'Complete your GMB profile with accurate information, photos, and regular posts. Respond to reviews promptly to boost local SEO and attract nearby customers.',
      category: 'seo',
      difficulty: 'Beginner',
      impact: 'High',
      timeframe: '2-3 hours'
    },
    {
      id: '2',
      title: 'Create a Content Calendar',
      description: 'Plan and schedule content 30 days in advance across all platforms. Consistency builds audience trust and improves engagement rates by up to 80%.',
      category: 'marketing',
      difficulty: 'Beginner',
      impact: 'High',
      timeframe: '4-5 hours'
    },
    {
      id: '3',
      title: 'Implement Email Marketing Automation',
      description: 'Set up automated email sequences for welcome, abandoned cart, and re-engagement. Email marketing has an average ROI of $42 for every $1 spent.',
      category: 'marketing',
      difficulty: 'Intermediate',
      impact: 'High',
      timeframe: '1-2 days'
    },
    {
      id: '4',
      title: 'Add Live Chat to Your Website',
      description: 'Install a live chat widget to capture leads and answer questions instantly. Can increase conversions by 20-40% by reducing friction in the buying process.',
      category: 'conversion',
      difficulty: 'Beginner',
      impact: 'High',
      timeframe: '1-2 hours'
    },
    {
      id: '5',
      title: 'Optimize Page Load Speed',
      description: 'Compress images, minify code, and use CDN. Every 1-second delay in page load can reduce conversions by 7%. Aim for under 3 seconds load time.',
      category: 'seo',
      difficulty: 'Intermediate',
      impact: 'High',
      timeframe: '3-4 hours'
    },
    {
      id: '6',
      title: 'Create Customer Testimonial Videos',
      description: 'Record short video testimonials from satisfied customers. Video testimonials can increase conversion rates by up to 34% compared to text reviews.',
      category: 'marketing',
      difficulty: 'Intermediate',
      impact: 'High',
      timeframe: '1 week'
    },
    {
      id: '7',
      title: 'Run Retargeting Ad Campaigns',
      description: 'Target visitors who left without converting. Retargeting ads have 10x higher CTR than regular display ads and can boost conversions by 150%.',
      category: 'conversion',
      difficulty: 'Advanced',
      impact: 'High',
      timeframe: '2-3 days'
    },
    {
      id: '8',
      title: 'Start a Weekly Blog',
      description: 'Publish valuable, SEO-optimized content weekly. Businesses that blog get 67% more leads than those that don\'t. Focus on solving customer problems.',
      category: 'seo',
      difficulty: 'Intermediate',
      impact: 'High',
      timeframe: 'Ongoing'
    },
    {
      id: '9',
      title: 'Implement A/B Testing',
      description: 'Test headlines, CTAs, colors, and layouts. Even small changes can yield 20-30% improvement in conversion rates. Test one element at a time.',
      category: 'conversion',
      difficulty: 'Intermediate',
      impact: 'Medium',
      timeframe: '2 weeks'
    },
    {
      id: '10',
      title: 'Create Instagram Reels',
      description: 'Post 3-5 short-form videos per week. Reels get 22% more engagement than regular posts and can rapidly grow your follower base.',
      category: 'social',
      difficulty: 'Beginner',
      impact: 'High',
      timeframe: '2-3 hours/week'
    },
    {
      id: '11',
      title: 'Launch a Referral Program',
      description: 'Incentivize customers to refer friends with discounts or rewards. Referred customers have 16% higher lifetime value than non-referred customers.',
      category: 'revenue',
      difficulty: 'Intermediate',
      impact: 'High',
      timeframe: '1 week'
    },
    {
      id: '12',
      title: 'Optimize for Voice Search',
      description: 'Use natural language and question-based keywords. 50% of all searches will be voice searches by 2025. Focus on local "near me" queries.',
      category: 'seo',
      difficulty: 'Advanced',
      impact: 'Medium',
      timeframe: '3-5 days'
    },
    {
      id: '13',
      title: 'Create Lead Magnets',
      description: 'Offer free resources (eBooks, templates, checklists) in exchange for email addresses. Can increase your email list by 200-400% in 90 days.',
      category: 'marketing',
      difficulty: 'Intermediate',
      impact: 'High',
      timeframe: '3-4 days'
    },
    {
      id: '14',
      title: 'Use Social Proof',
      description: 'Display customer count, reviews, and trust badges prominently. Adding social proof can increase conversions by up to 15%.',
      category: 'conversion',
      difficulty: 'Beginner',
      impact: 'Medium',
      timeframe: '2-3 hours'
    },
    {
      id: '15',
      title: 'Start LinkedIn Networking',
      description: 'Connect with 10-15 prospects daily and provide value. B2B businesses generate 80% of social media leads from LinkedIn.',
      category: 'social',
      difficulty: 'Beginner',
      impact: 'High',
      timeframe: '30 min/day'
    }
  ];

  const filteredTips = selectedCategory === 'all'
    ? tips
    : tips.filter(tip => tip.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleImplementTip = async (tipId: string, tipTitle: string) => {
    if (!user?.id) {
      alert('Please log in to save your progress');
      return;
    }

    try {
      if (implementedTips.has(tipId)) {
        // Remove from database
        const response = await fetch(`http://127.0.0.1:5001/api/implemented-tips/${user.id}/${tipId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setImplementedTips(prev => {
            const newSet = new Set(prev);
            newSet.delete(tipId);
            return newSet;
          });
          alert(`✅ "${tipTitle}" removed from your action plan`);
        } else {
          throw new Error(data.error || 'Failed to remove tip');
        }
      } else {
        // Add to database
        const response = await fetch('http://127.0.0.1:5001/api/implemented-tips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            tipId,
            tipTitle
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setImplementedTips(prev => new Set(prev).add(tipId));
          alert(`🚀 Great! "${tipTitle}" added to your action plan!\n\nStart implementing this strategy and track your progress.\n\nYour progress is now saved!`);
        } else {
          throw new Error(data.error || 'Failed to add tip');
        }
      }
    } catch (error) {
      console.error('Error updating tip:', error);
      alert('Failed to update tip. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 mb-4">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Expert Growth Strategies</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Business Growth Tips
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Proven strategies to accelerate your business growth, boost revenue, and dominate your market
          </p>
        </div>

        {/* Progress Tracker */}
        {implementedTips.size > 0 && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  🎯 Your Progress: {implementedTips.size} / {tips.length} Tips
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {Math.round((implementedTips.size / tips.length) * 100)}% Complete
                </p>
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {implementedTips.size}
              </div>
            </div>
            <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(implementedTips.size / tips.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Tips</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{tips.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">High Impact</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {tips.filter(t => t.impact === 'High').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-xl">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">For Beginners</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {tips.filter(t => t.difficulty === 'Beginner').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-xl">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isActive
                    ? `bg-${category.color}-600 text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  {isActive && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {category.id === 'all' ? tips.length : tips.filter(t => t.category === category.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map((tip) => (
            <div
              key={tip.id}
              className={`group rounded-2xl p-6 border-2 hover:shadow-xl transition-all duration-300 ${implementedTips.has(tip.id)
                ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {tip.title}
                    </h3>
                    {implementedTips.has(tip.id) && (
                      <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                    {tip.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                  <span className={`text-xs font-semibold ${getImpactColor(tip.impact)}`}>
                    {tip.impact} Impact
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4" />
                  <span>{tip.timeframe}</span>
                </div>
              </div>

              <button
                onClick={() => handleImplementTip(tip.id, tip.title)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all group-hover:shadow-lg ${implementedTips.has(tip.id)
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{implementedTips.has(tip.id) ? 'In Progress' : 'Implement Now'}</span>
                {!implementedTips.has(tip.id) && (
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
          <div className="flex flex-wrap items-center justify-center gap-4">
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GrowthTipsPage;


