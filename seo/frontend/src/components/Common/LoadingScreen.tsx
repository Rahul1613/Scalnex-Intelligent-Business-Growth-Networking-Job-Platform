import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface LoadingScreenProps {
    onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                // Random increment for realistic feel
                return prev + Math.floor(Math.random() * 10) + 5;
            });
        }, 150);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (progress === 100 && onComplete) {
            // Small delay after hitting 100% before triggering exit
            setTimeout(onComplete, 800);
        }
    }, [progress, onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-gray-950 overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background radial gradient pulse */}
            <motion.div
                className="absolute w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Icon */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8 relative"
                >
                    <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Rocket className="w-10 h-10 text-white" />
                    </div>
                </motion.div>

                {/* Brand Name with Reveal Effect */}
                <div className="overflow-hidden mb-8">
                    <motion.h1
                        initial={{ y: 40 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95], delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
                    >
                        Scalnex
                    </motion.h1>
                </div>

                {/* Loading Bar Container */}
                <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }} // Smooth steps from state updates
                    />
                </div>

                {/* Percentage Text */}
                <motion.div
                    className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {Math.min(progress, 100)}%
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
