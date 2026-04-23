import React from 'react';
import { DashboardBalanceWidget } from '../components/widgets/DashboardBalanceWidget';
import { DashboardRecentTransactionsWidget } from '../components/widgets/DashboardRecentTransactionsWidget';
import { DashboardCategoriesWidget } from '../components/widgets/DashboardCategoriesWidget';
import { DashboardInsightsWidget } from '../components/widgets/DashboardInsightsWidget';
import { DashboardGoalsWidget } from '../components/widgets/DashboardGoalsWidget';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 pb-24 md:pb-12">
      <DashboardBalanceWidget />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Recent Activity */}
        <div className="lg:col-span-7">
          <DashboardRecentTransactionsWidget />
        </div>

        {/* Breakdown + Insights */}
        <div className="lg:col-span-5 space-y-10">
          <DashboardCategoriesWidget />
          <DashboardInsightsWidget />
        </div>
      </div>

      <DashboardGoalsWidget />
    </div>
  );
};

export default DashboardPage;
