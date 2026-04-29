import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Briefcase, DollarSign, MapPin } from 'lucide-react';
import Button from '../components/Common/Button';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const JobPostingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobData, setJobData] = useState({
        title: '',
        type: 'Full-time',
        location: 'Remote',
        salary: '',
        description: '',
        requirements: '',
        skills: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setJobData({ ...jobData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobData.title || !jobData.description) {
            toast.error('Please fill in required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiService.postJob({
                ...jobData,
                company: user?.businessName || 'My Company',
                posted: 'Just now',
                logo: 'bg-purple-500', // Mock logo color
                skills: jobData.skills.split(',').map(s => s.trim())
            });

            if (response.success) {
                toast.success('Job posted successfully!');
                navigate('/marketplace');
            } else {
                toast.error('Failed to post job');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 hover:bg-white dark:hover:bg-gray-800"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
                        <h1 className="text-3xl font-bold flex items-center">
                            <Briefcase className="mr-3" size={32} />
                            Post a New Job
                        </h1>
                        <p className="text-purple-100 mt-2">Find the perfect candidate for your business</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* Job Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={jobData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g. Senior Marketing Manager"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
                                <select
                                    name="type"
                                    value={jobData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={jobData.location}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g. Remote, New York"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary Range</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="salary"
                                        value={jobData.salary}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g. $50k - $80k"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={jobData.skills}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder="React, SEO, Marketing..."
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description *</label>
                            <textarea
                                name="description"
                                value={jobData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                                placeholder="Describe the role and responsibilities..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements</label>
                            <textarea
                                name="requirements"
                                value={jobData.requirements}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                                placeholder="Key qualifications..."
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isSubmitting} className="px-8 py-3 text-lg">
                                {isSubmitting ? 'Posting...' : 'Post Job'}
                                {!isSubmitting && <CheckCircle size={20} className="ml-2" />}
                            </Button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default JobPostingPage;
