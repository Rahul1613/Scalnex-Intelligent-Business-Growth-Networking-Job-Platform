import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Import feature pages for preview
import DashboardPage from '../pages/DashboardPage';
import ContentPage from '../pages/ContentPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import MarketplacePage from '../pages/MarketplacePage';

interface FeatureGalleryProps {
    isOpen: boolean;
    onClose: () => void;
}

const features = [
    {
        id: 'dashboard',
        title: 'SEO Intelligence',
        description: 'Real-time technical audits and insights to boost your rankings.',
        component: <DashboardPage />,
        color: 'from-blue-600 to-cyan-600',
    },
    {
        id: 'content',
        title: 'AI Content Generator',
        description: 'Create SEO-optimized articles and social posts in seconds.',
        component: <ContentPage />,
        color: 'from-purple-600 to-pink-600',
    },
    {
        id: 'analytics',
        title: 'Smart Analytics',
        description: 'Track growth, revenue, and traffic with actionable metrics.',
        component: <AnalyticsPage />,
        color: 'from-indigo-600 to-blue-600',
    },
    {
        id: 'marketplace',
        title: 'Hiring Marketplace',
        description: 'Find top talent or fast-track your career in growth marketing.',
        component: <MarketplacePage />,
        color: 'from-orange-500 to-red-500',
    },
];

const FeatureGallery: React.FC<FeatureGalleryProps> = ({ isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle scroll (wheel) navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleWheel = (e: WheelEvent) => {
            // Prevent default page scroll
            e.preventDefault();

            if (isScrolling) return;

            if (e.deltaY > 50) {
                // Scroll down -> Next feature
                if (currentIndex < features.length - 1) {
                    setIsScrolling(true);
                    setCurrentIndex((prev) => prev + 1);
                    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);
                }
            } else if (e.deltaY < -50) {
                // Scroll up -> Previous feature
                if (currentIndex > 0) {
                    setIsScrolling(true);
                    setCurrentIndex((prev) => prev - 1);
                    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);
                }
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleWheel);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [isOpen, currentIndex, isScrolling]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                if (currentIndex < features.length - 1) setCurrentIndex(prev => prev + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, onClose]);

    // Reset index when opened
    useEffect(() => {
        if (isOpen) setCurrentIndex(0);
    }, [isOpen]);



    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Navigation Dots */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                        {features.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="w-full h-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12">

                        {/* Left Side: Info */}
                        <div className="lg:w-1/3 text-white space-y-6 z-10">
                            <motion.div
                                key={`text-${currentIndex}`}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    {features[currentIndex].title}
                                </h2>
                                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                                    {features[currentIndex].description}
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentIndex === 0}
                                        className="p-4 rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentIndex(prev => Math.min(features.length - 1, prev + 1))}
                                        disabled={currentIndex === features.length - 1}
                                        className="p-4 rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Side: Feature Preview (The sliding part) */}
                        <div className="relative lg:w-2/3 w-full h-[60vh] lg:h-[80vh] flex items-center justify-center perspective-1000">
                            {features.map((feature, idx) => {
                                // Only render current, prev, and next for performance
                                if (Math.abs(idx - currentIndex) > 1) return null;

                                let position = 0; // 0 = active, 1 = next, -1 = prev
                                if (idx > currentIndex) position = 1;
                                else if (idx < currentIndex) position = -1;

                                return (
                                    <motion.div
                                        key={feature.id}
                                        className="absolute w-full h-full flex items-center justify-center transform-style-3d will-change-transform"
                                        initial={{ scale: 0.8, opacity: 0, x: 100 }}
                                        animate={{
                                            scale: position === 0 ? 1 : 0.8,
                                            opacity: position === 0 ? 1 : 0,
                                            x: position === 0 ? 0 : position * 100,
                                            zIndex: position === 0 ? 10 : 0
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-gray-900 group`}>
                                            {/* Top Bar Decoration */}
                                            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 flex items-center px-4 space-x-2 z-10">
                                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                            </div>

                                            {/* Content Container - Scaled to fit */}
                                            <div className="w-[150%] h-[150%] origin-top-left scale-[0.66] pt-12 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                                                {feature.component}
                                            </div>

                                            {/* Interactive hint overlay */}
                                            <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors pointer-events-none" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeatureGallery;
