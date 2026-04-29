import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface CountUpStatsProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    live?: boolean;
    incrementAmount?: number;
    incrementInterval?: number;
}

const CountUpStats: React.FC<CountUpStatsProps> = ({
    end,
    duration = 2,
    suffix = '',
    prefix = '',
    decimals = 0,
    live = false,
    incrementAmount = 1,
    incrementInterval = 3000
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            // Easing function (easeOutExpo)
            const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

            const currentCount = ease * end;
            setCount(currentCount);

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, end, duration]);

    // Live update effect
    useEffect(() => {
        if (!live || !isInView) return;

        // Wait for initial animation to (likely) finish before starting live updates
        const startDelay = setTimeout(() => {
            const interval = setInterval(() => {
                setCount(prev => prev + incrementAmount);
            }, incrementInterval);

            return () => clearInterval(interval);
        }, duration * 1000);

        return () => clearTimeout(startDelay);
    }, [live, isInView, incrementAmount, incrementInterval, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {prefix}
            {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {suffix}
        </span>
    );
};

export default CountUpStats;
