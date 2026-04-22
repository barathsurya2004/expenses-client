import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../components/ui/Common';
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
            <div className="min-h-screen flex items-center justify-center bg-ledger-bg">
                <div className="w-10 h-10 border-2 border-ledger-accent/20 border-t-ledger-accent rounded-full animate-spin"></div>
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

    const SectionHeader = ({ title, accentColor, onAdd }: { title: string; accentColor: string; onAdd?: () => void }) => (
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-ledger-border">
            <div className="flex items-center gap-3">
                <div className="w-[3px] h-4 rounded-full" style={{ backgroundColor: accentColor }} />
                <h2 className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold">{title}</h2>
            </div>
            {onAdd && (
                <button onClick={onAdd} className="w-6 h-6 rounded-md bg-ledger-s2 border border-ledger-border flex items-center justify-center text-ledger-muted hover:text-ledger-accent transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
            )}
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12 pb-24 md:pb-12">
            <Animate type="fade">
                <header>
                    <h1 className="font-headline text-4xl font-bold text-ledger-text tracking-tight">Budget</h1>
                    <p className="text-[13px] text-ledger-muted mt-2 font-body">April 2026 · {data.spendingCategories.length + data.savingsCategories.length + data.recurringCards.length} categories tracked</p>
                </header>
            </Animate>

            {/* Overview card */}
            <Animate type="slideUp" delay={0.2}>
                <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ledger-accent to-ledger-income via-transparent" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                        <div>
                            <p className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">Total Spent</p>
                            <p className="font-mono text-2xl font-medium text-ledger-text">₹{data.totalSpent.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">Total Budget</p>
                            <p className="font-mono text-2xl font-medium text-ledger-muted">₹{data.totalBudget.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">Remaining</p>
                            <p className={`font-mono text-2xl font-medium ${data.totalBudget - data.totalSpent < 0 ? 'text-ledger-expense' : 'text-ledger-income'}`}>₹{(data.totalBudget - data.totalSpent).toLocaleString()}</p>
                        </div>
                    </div>
                    <ProgressBar progress={data.totalProgress} color="bg-gradient-to-r from-ledger-income to-ledger-accent" height="h-1.5" />
                    <p className="text-[11px] text-ledger-muted mt-3 font-medium">{Math.round(data.totalProgress)}% of total allocated budget consumed</p>
                </div>
            </Animate>

            <Animate type="slideUp" delay={0.3}>
                <section>
                    <SectionHeader title="Discretionary Spending" accentColor="#C4903D" onAdd={() => openModal('new-spending-type')} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {data.spendingCategories.map(cat => (
                            <div key={cat.name} onClick={handleCardClick} className="cursor-pointer">
                                <BudgetCard category={cat} />
                            </div>
                        ))}
                    </div>
                </section>
            </Animate>

            <Animate type="slideUp" delay={0.4}>
                <section>
                    <SectionHeader title="Fixed Recurring" accentColor="#C46555" onAdd={() => openModal('new-recurring-type')} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {data.recurringCards.map(item => (
                            <div key={item.name} onClick={() => handleRecurringCardClick(item.name)} className="cursor-pointer">
                                <RecurringCostCard item={item} />
                            </div>
                        ))}
                    </div>
                </section>
            </Animate>

            <Animate type="slideUp" delay={0.5}>
                <section>
                    <SectionHeader title="Savings & Investments" accentColor="#6DAD85" onAdd={() => openModal('new-savings-type')} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {data.savingsCategories.map(cat => (
                            <div key={cat.name} onClick={handleCardClick} className="cursor-pointer">
                                <BudgetCard category={cat} />
                            </div>
                        ))}
                    </div>
                </section>
            </Animate>
        </div>
    );
};

export default BudgetPage;
