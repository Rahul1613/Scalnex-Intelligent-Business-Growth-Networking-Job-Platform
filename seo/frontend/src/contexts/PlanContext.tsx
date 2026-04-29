import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type PlanLevel = 'free' | 'pro' | 'agency';

interface PlanDetails {
    maxUsage: number;
    features: string[];
    name: string;
}

const PLAN_LIMITS: Record<PlanLevel, PlanDetails> = {
    free: {
        name: 'Free',
        maxUsage: 10,
        features: ['basic_seo', 'basic_analytics']
    },
    pro: {
        name: 'Pro',
        maxUsage: 1000,
        features: ['basic_seo', 'advanced_seo', 'bi_suite', 'marketing_automation']
    },
    agency: {
        name: 'Agency',
        maxUsage: 10000,
        features: ['basic_seo', 'advanced_seo', 'bi_suite', 'marketing_automation', 'custom_reports', 'multi_tenant']
    }
};

interface PlanContextType {
    planLevel: PlanLevel;
    usageCount: number;
    isFeatureEnabled: (feature: string) => boolean;
    canPerformAction: () => boolean;
    upgradePlan: (level: PlanLevel) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [planLevel, setPlanLevel] = useState<PlanLevel>('free');
    const [usageCount, setUsageCount] = useState(0);

    useEffect(() => {
        if (user) {
            // @ts-ignore
            setPlanLevel(user.planLevel || 'free');
            // @ts-ignore
            setUsageCount(user.usageCount || 0);
        }
    }, [user]);

    const isFeatureEnabled = (feature: string) => {
        return PLAN_LIMITS[planLevel].features.includes(feature);
    };

    const canPerformAction = () => {
        return usageCount < PLAN_LIMITS[planLevel].maxUsage;
    };

    const upgradePlan = (level: PlanLevel) => {
        // In real app, this would involve a payment flow
        setPlanLevel(level);
    };

    return (
        <PlanContext.Provider value={{ planLevel, usageCount, isFeatureEnabled, canPerformAction, upgradePlan }}>
            {children}
        </PlanContext.Provider>
    );
};

export const usePlan = () => {
    const context = useContext(PlanContext);
    if (context === undefined) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
};
