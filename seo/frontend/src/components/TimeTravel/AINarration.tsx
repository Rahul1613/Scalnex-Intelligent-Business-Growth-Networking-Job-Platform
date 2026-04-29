import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AINarrationProps {
    text: string;
}

const AINarration = ({ text }: AINarrationProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 max-w-2xl"
        >
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-2xl"></div>

                {/* Main content */}
                <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="flex items-start space-x-4">
                        {/* AI Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white animate-pulse" />
                            </div>
                        </div>

                        {/* Text content */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-sm font-semibold text-blue-400">AI Narrator</h3>
                                <div className="flex space-x-1">
                                    <motion.div
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                        className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                        className="w-1.5 h-1.5 bg-pink-400 rounded-full"
                                    />
                                </div>
                            </div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-white text-base leading-relaxed"
                            >
                                {text}
                            </motion.p>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full opacity-50"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full opacity-50"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default AINarration;
