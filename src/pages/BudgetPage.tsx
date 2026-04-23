import React from 'react';
import { BudgetOverviewWidget } from '../components/widgets/BudgetOverviewWidget';
import { BudgetSpendingCategoriesWidget } from '../components/widgets/BudgetSpendingCategoriesWidget';
import { BudgetRecurringCostsWidget } from '../components/widgets/BudgetRecurringCostsWidget';
import { BudgetSavingsCategoriesWidget } from '../components/widgets/BudgetSavingsCategoriesWidget';

const BudgetPage: React.FC = () => {
    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12 pb-24 md:pb-12">
            <BudgetOverviewWidget />
            <BudgetSpendingCategoriesWidget />
            <BudgetRecurringCostsWidget />
            <BudgetSavingsCategoriesWidget />
        </div>
    );
};

export default BudgetPage;
