import React from 'react';
import { motion } from 'framer-motion';

interface TimeStateControllerProps {
    currentTime: string;
    onTimeChange: (time: string) => void;
}

const TimeStateController: React.FC<TimeStateControllerProps> = ({ currentTime, onTimeChange }) => {
    const states = [
        { id: 'past_6m', label: '6M PAST', color: 'blue' },
        { id: 'past_3m', label: '3M PAST', color: 'cyan' },
        { id: 'present', label: 'PRESENT', color: 'emerald' },
        { id: 'future_3m', label: '3M FUTURE', color: 'amber' },
        { id: 'future_6m', label: '6M FUTURE', color: 'rose' }
    ];

    return (
        <div className="flex items-center gap-2 p-1 bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
            {states.map((state) => (
                <motion.button
                    key={state.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onTimeChange(state.id)}
                    className={`
            relative px-6 py-3 rounded-[1.5rem] text-[10px] font-black tracking-widest transition-all
            ${currentTime === state.id
                            ? 'text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                            : 'text-white/40 hover:text-white/60'}
          `}
                >
                    {currentTime === state.id && (
                        <motion.div
                            layoutId="activeTime"
                            className="absolute inset-0 bg-white/10 dark:bg-emerald-500/20 border border-white/20 dark:border-emerald-500/30 rounded-[1.5rem]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{state.label}</span>
                </motion.button>
            ))}
        </div>
    );
};

export default TimeStateController;
