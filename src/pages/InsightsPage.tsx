import React from 'react';
import { InsightsPulseStatsWidget } from '../components/widgets/InsightsPulseStatsWidget';
import { InsightsBudgetHealthWidget } from '../components/widgets/InsightsBudgetHealthWidget';
import { InsightsAIListWidget } from '../components/widgets/InsightsAIListWidget';
import { InsightsCategorySpendingWidget } from '../components/widgets/InsightsCategorySpendingWidget';

const InsightsPage: React.FC = () => {
    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12 pb-24 md:pb-12 font-body">
            <InsightsPulseStatsWidget />
            <InsightsBudgetHealthWidget />
            <InsightsAIListWidget />
            <InsightsCategorySpendingWidget />
        </div>
    );
};

export default InsightsPage;
