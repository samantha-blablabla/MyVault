import React from 'react';
import { WealthProjection } from '../dashboard/WealthProjection';
import { FinancialGoalsDashboard } from '../dashboard/FinancialGoalsDashboard';
import { FinancialSimulatorWidget } from '../dashboard/FinancialSimulatorWidget';

export const PlanningView: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    Financial War Room
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                    Trung tâm hoạch định và tự do tài chính.
                </p>
            </div>

            {/* Top: Wealth Projection */}
            <div>
                <WealthProjection />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Goals Dashboard (2/3 width) */}
                <div className="lg:col-span-2">
                    <FinancialGoalsDashboard />
                </div>

                {/* Right: Simulator (1/3 width) */}
                <div className="lg:col-span-1">
                    <FinancialSimulatorWidget />
                </div>
            </div>
        </div>
    );
};
