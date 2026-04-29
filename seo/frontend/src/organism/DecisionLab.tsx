import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Info, FlaskConical } from 'lucide-react';

interface DecisionLabProps {
    actions: any[];
    onAction: (id: string) => void;
}

const DecisionLab: React.FC<DecisionLabProps> = ({ actions, onAction }) => {
    return (
        <div className="flex gap-4">
            {actions.map((action) => (
                <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAction(action.id)}
                    className="group relative px-6 py-4 bg-black/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl flex flex-col items-start gap-1 transition-all hover:bg-emerald-500/10 hover:border-emerald-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                        <Zap className="w-12 h-12 text-emerald-500 -mr-4 -mt-4 rotate-12" />
                    </div>

                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-1">
                        <FlaskConical className="w-3 h-3" />
                        Bio-Action
                    </div>
                    <span className="text-white font-bold text-sm">{action.label}</span>
                    <span className="text-white/40 text-[9px] font-mono">CONFIDENCE: 94%</span>
                </motion.button>
            ))}
        </div>
    );
};

export default DecisionLab;
