import { motion } from 'framer-motion';
import { Zap, Wrench, Target, DollarSign, FileText } from 'lucide-react';

interface DecisionPanelProps {
    onDecisionSelect: (decision: string) => void;
    selectedDecision: string | null;
}

const decisions = [
    {
        id: 'improve_page_speed',
        name: 'Improve Page Speed',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        description: 'Optimize load times for better UX',
        impact: { traffic: '+15%', seo: '+8', revenue: '+12%' }
    },
    {
        id: 'optimize_technical_seo',
        name: 'Optimize Technical SEO',
        icon: Wrench,
        color: 'from-blue-500 to-cyan-500',
        description: 'Fix technical issues and boost rankings',
        impact: { traffic: '+20%', seo: '+12', revenue: '+18%' }
    },
    {
        id: 'target_new_keywords',
        name: 'Target New Keywords',
        icon: Target,
        color: 'from-purple-500 to-pink-500',
        description: 'Expand reach with new keyword targeting',
        impact: { traffic: '+25%', seo: '+10', revenue: '+22%' }
    },
    {
        id: 'increase_ad_budget',
        name: 'Increase Ad Budget',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500',
        description: 'Drive immediate traffic with paid ads',
        impact: { traffic: '+35%', seo: '+2', revenue: '+28%' }
    },
    {
        id: 'improve_content_quality',
        name: 'Improve Content Quality',
        icon: FileText,
        color: 'from-indigo-500 to-blue-500',
        description: 'Create high-quality, engaging content',
        impact: { traffic: '+18%', seo: '+15', revenue: '+20%' }
    }
];

const DecisionPanel = ({ onDecisionSelect, selectedDecision }: DecisionPanelProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40"
        >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-4xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        ⚡ Make a Strategic Decision
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Choose an action to shape your business future
                    </p>
                </div>

                <div className="grid grid-cols-5 gap-3">
                    {decisions.map((decision) => {
                        const Icon = decision.icon;
                        const isSelected = selectedDecision === decision.id;

                        return (
                            <motion.button
                                key={decision.id}
                                onClick={() => onDecisionSelect(decision.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative group ${isSelected ? 'ring-2 ring-white' : ''
                                    }`}
                            >
                                <div className={`
                  bg-gradient-to-br ${decision.color}
                  rounded-xl p-4 h-full
                  transition-all duration-300
                  hover:shadow-lg hover:shadow-${decision.color.split('-')[1]}-500/50
                `}>
                                    {/* Icon */}
                                    <div className="flex justify-center mb-2">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-white font-semibold text-sm text-center mb-2">
                                        {decision.name}
                                    </h3>

                                    {/* Impact preview */}
                                    <div className="text-xs text-white/80 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Traffic:</span>
                                            <span className="font-bold">{decision.impact.traffic}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>SEO:</span>
                                            <span className="font-bold">{decision.impact.seo}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Revenue:</span>
                                            <span className="font-bold">{decision.impact.revenue}</span>
                                        </div>
                                    </div>

                                    {/* Selected indicator */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1"
                                        >
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                        {decision.description}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="mt-4 text-center">
                    <p className="text-gray-400 text-xs">
                        💡 Click a decision to see AI-predicted outcomes in the future timeline
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default DecisionPanel;
