import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar, ProgressBar } from '../components/ui/Common';
import { BudgetCard, RecurringCostCard } from '../components/ui/Cards';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { BudgetSummary } from '../services/apiService';
import { Animate } from '../components/ui/Animate';
import { useModal } from '../hooks/useModal';

const BudgetPage: React.FC = () => {
    const { openModal } = useModal();
    const navigate = useNavigate();
    const [data, setData] = useState<BudgetSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const summary = await apiService.getBudgetSummary();
            setData(summary);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleDataUpdated = () => {
            fetchData();
        };
        window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
        return () => {
            window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
        };
    }, [fetchData]);

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleCardClick = () => {
        navigate('/transactions');
    };

    const handleRecurringCardClick = (categoryName: string) => {
        sessionStorage.setItem('selectedRecurringCostName', categoryName);
        openModal('recurring-cost-detail');
    };

    return (
        <div className="bg-background text-on-background min-h-screen pb-32 pt-20">
            <TopAppBar title="Vault" />

            <main className="px-6 max-w-4xl mx-auto space-y-10">
                <Animate type="fade" duration={0.8}>
                    <section className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Budgets</h1>
                        <p className="text-[13px] font-medium text-on-surface-variant">Track your monthly allocations and expenses.</p>
                    </section>
                </Animate>

                <Animate type="slideUp" delay={0.2}>
                    <section>
                        <div className="bg-surface-container-low rounded-xl p-6 sm:p-8 ghost-border relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Monthly Budget</p>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-3xl font-bold tracking-tighter">₹{data.totalSpent.toLocaleString()}</span>
                                    <span className="text-[13px] font-medium text-on-surface-variant pb-1">/ ₹{data.totalBudget.toLocaleString()}</span>
                                </div>
                                <ProgressBar progress={data.totalProgress} color="bg-gradient-to-r from-primary to-primary-container" height="h-3" />
                                <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                    <span>₹{(data.totalBudget - data.totalSpent).toLocaleString()} Remaining</span>
                                    <span>{Math.round(data.totalProgress)}% Utilized</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </Animate>

                <Animate type="slideUp" delay={0.3}>
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-base font-bold text-on-surface">Spending</h2>
                            <button
                                onClick={() => openModal('new-spending-type')}
                                className="w-7 h-7 rounded-full bg-white/5 backdrop-blur-sm ghost-border flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">add</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.spendingCategories.map(cat => (
                                <div key={cat.name} onClick={handleCardClick} className="cursor-pointer">
                                    <BudgetCard category={cat} />
                                </div>
                            ))}
                        </div>
                    </section>
                </Animate>

                <Animate type="slideUp" delay={0.4}>
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-base font-bold text-on-surface">Savings</h2>
                            <button
                                onClick={() => openModal('new-savings-type')}
                                className="w-7 h-7 rounded-full bg-white/5 backdrop-blur-sm ghost-border flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">add</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.savingsCategories.map(cat => (
                                <div key={cat.name} onClick={handleCardClick} className="cursor-pointer">
                                    <BudgetCard category={cat} />
                                </div>
                            ))}
                        </div>
                    </section>
                </Animate>

                <Animate type="slideUp" delay={0.5}>
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-base font-bold text-on-surface">Recurring</h2>
                            <button
                                onClick={() => openModal('new-recurring-type')}
                                className="w-7 h-7 rounded-full bg-white/5 backdrop-blur-sm ghost-border flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">add</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.recurringCards.map(item => (
                                <div key={item.name} onClick={() => handleRecurringCardClick(item.name)} className="cursor-pointer">
                                    <RecurringCostCard item={item} />
                                </div>
                            ))}
                        </div>
                    </section>
                </Animate>
            </main>
        </div>
    );
};

export default BudgetPage;
