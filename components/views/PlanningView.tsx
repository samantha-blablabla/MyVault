import React from 'react';
import { InvestmentRoadmap } from '../dashboard/InvestmentRoadmap';
import { StrategyWidget } from '../dashboard/StrategyWidget';

export const PlanningView: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    Kế hoạch tài chính
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Định hướng và mục tiêu dài hạn.
                </p>
            </div>

            {/* Strategy Radar */}
            <div className="h-[24rem]">
                <StrategyWidget />
            </div>

            {/* Roadmap */}
            <InvestmentRoadmap />
        </div>
    );
};
