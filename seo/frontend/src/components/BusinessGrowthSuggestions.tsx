import React, { useState, useEffect } from 'react';
import {
  Plus,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  RotateCcw,
  Play,
  Globe,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BusinessData {
  businessName: string;
  websiteUrl: string;
  businessCategory: string;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  impact: string;
  timeToComplete: string;
  completed: boolean;
}

const BusinessGrowthSuggestions: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [startedTasks, setStartedTasks] = useState<Set<string>>(new Set());
  const [goals, setGoals] = useState<{ id: string, title: string, progress: number, deadline: string, completed: boolean }[]>([]);

  // Load business data and goals on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        // If no user, use mock data for demonstration
        setBusinessData({
          businessName: 'Demo Business',
          websiteUrl: 'https://example.com',
          businessCategory: 'Technology'
        });
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');

        // Load Business Profile
        const businessRes = await fetch(`http://127.0.0.1:5001/api/business/${user.id}`);
        const businessData = await businessRes.json();

        if (businessData.business) {
          setBusinessData({
            businessName: businessData.business.businessName,
            websiteUrl: businessData.business.websiteUrl,
            businessCategory: businessData.business.businessCategory
          });
          if (businessData.business.websiteUrl) {
            await fetchAIRecommendations(businessData.business.websiteUrl, businessData.business.businessCategory);
          }
        } else {
          setBusinessData({
            businessName: user.businessName || 'Your Business',
            websiteUrl: user.websiteUrl || 'https://yourbusiness.com',
            businessCategory: (user as any).businessCategory || user.industry || 'General'
          });
        }

        // Load Goals
        if (token) {
          const goalsRes = await fetch('http://127.0.0.1:5001/api/goals', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const goalsData = await goalsRes.json();
          if (goalsData.goals) {
            setGoals(goalsData.goals);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const fetchAIRecommendations = async (websiteUrl: string, category: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/growth-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl, category })
      });

      const data = await response.json();
      if (data.recommendations) {
        setAiRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    }
  };

  // Helper function to get progress bar width
  const getProgressWidth = (progress: number) => {
    return { '--progress-width': `${progress}%` } as React.CSSProperties;
  };


  // Sample data for recommended actions
  const recommendedActions = [
    {
      id: '1',
      title: 'Optimize Meta Descriptions',
      description: 'Update meta descriptions for your top 20 pages to improve click-through rates',
      category: 'SEO',
      priority: 'High',
      impact: 'High',
      timeToComplete: '2 hours',
      completed: false
    },
    {
      id: '2',
      title: 'Create Social Media Content Calendar',
      description: 'Plan and schedule content for the next month across all platforms',
      category: 'Social',
      priority: 'Medium',
      impact: 'Medium',
      timeToComplete: '4 hours',
      completed: false
    },
    {
      id: '3',
      title: 'Fix Mobile Page Speed Issues',
      description: 'Optimize images and reduce JavaScript bundle size for mobile users',
      category: 'Technical',
      priority: 'High',
      impact: 'High',
      timeToComplete: '6 hours',
      completed: false
    },
    {
      id: '4',
      title: 'Set Up Google Analytics Goals',
      description: 'Configure conversion tracking for lead generation and sales',
      category: 'Analytics',
      priority: 'Medium',
      impact: 'High',
      timeToComplete: '1 hour',
      completed: true
    },
    {
      id: '5',
      title: 'Research Competitor Keywords',
      description: 'Analyze competitor strategies and identify new keyword opportunities',
      category: 'SEO',
      priority: 'Low',
      impact: 'Medium',
      timeToComplete: '3 hours',
      completed: false
    }
  ];

  const categories = ['all', 'SEO', 'Content', 'Ads', 'Social', 'Technical'];
  const priorities = ['all', 'High', 'Medium', 'Low'];

  // Combine AI recommendations with default recommendations
  const allRecommendations = aiRecommendations.length > 0 ? aiRecommendations : recommendedActions;

  const filteredActions = allRecommendations.filter(action => {
    const categoryMatch = selectedCategory === 'all' || action.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || action.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleAddGoal = async () => {
    const goalTitle = prompt('Enter your new goal:');
    if (goalTitle && goalTitle.trim()) {
      const deadline = prompt('Enter deadline (e.g., Dec 31, 2024):');
      const token = localStorage.getItem('auth_token');

      try {
        const res = await fetch('http://127.0.0.1:5001/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: goalTitle.trim(),
            deadline: deadline?.trim() || 'Not set',
            progress: 0,
            completed: false
          })
        });

        if (res.ok) {
          const data = await res.json();
          setGoals(prev => [...prev, data.goal]);
          alert(`✅ Goal "${goalTitle}" added successfully!`);
        }
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    }
  };

  const handleStartTask = (taskTitle: string, taskId: string) => {
    setStartedTasks(prev => {
      const newSet = new Set(prev);
      newSet.add(taskId);
      return newSet;
    });
    alert(`🚀 Task Started: "${taskTitle}"\n\nGood luck! Mark the checkbox when completed.`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SEO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Content': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Ads': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Social': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'Technical': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading growth suggestions...</p>
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Business Listed Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please list your business first to get personalized growth recommendations.
        </p>
        <a
          href="/list-business"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          List Your Business
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Business Growth Suggestions
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          AI-powered recommendations to accelerate your business growth
        </p>
        {businessData && (
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm">
            <Globe className="w-4 h-4" />
            <span>Analyzing: <strong>{businessData.businessName}</strong></span>
          </div>
        )}
      </div>

      {/* Weekly Goals Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Target className="w-6 h-6 mr-3 text-blue-600" />
            Weekly Goals
          </h2>
          <button
            onClick={handleAddGoal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                {goal.completed && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={getProgressWidth(goal.progress)}
                  ></div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>Due {goal.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Filter className="w-6 h-6 mr-3 text-blue-600" />
            Recommended Actions
          </h2>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedPriority('all');
              setCompletedTasks(new Set());
              setStartedTasks(new Set());
              alert('✅ Filters and task status reset successfully!');
            }}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by priority"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions List */}
        <div className="space-y-4">
          {filteredActions.map((action) => (
            <div key={action.id} className={`p-6 rounded-xl border-2 transition-all duration-200 ${completedTasks.has(action.id)
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={completedTasks.has(action.id)}
                    onChange={() => toggleTaskCompletion(action.id)}
                    className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    aria-label={`Mark ${action.title} as completed`}
                  />

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${completedTasks.has(action.id)
                        ? 'text-green-800 dark:text-green-200 line-through'
                        : 'text-gray-900 dark:text-white'
                        }`}>
                        {action.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(action.category)}`}>
                        {action.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>

                    <p className={`text-gray-600 dark:text-gray-400 mb-4 ${completedTasks.has(action.id) ? 'line-through' : ''
                      }`}>
                      {action.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Impact: <span className="font-medium">{action.impact}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Time: <span className="font-medium">{action.timeToComplete}</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {!completedTasks.has(action.id) && (
                  <button
                    onClick={() => handleStartTask(action.title, action.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${startedTasks.has(action.id)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {startedTasks.has(action.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>In Progress</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Start Task</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Growth Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance Trend</h3>
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">+15%</div>
              <div className="text-gray-600 dark:text-gray-400">traffic increase this month</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">+8%</div>
              <div className="text-gray-600 dark:text-gray-400">conversion rate improvement</div>
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Next Milestone</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">350</div>
              <div className="text-gray-600 dark:text-gray-400">visitors away from 2K goal</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                style={getProgressWidth(82)}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Estimated completion: 2 weeks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessGrowthSuggestions;
