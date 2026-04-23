import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { RecurringCostSummary } from '../../services/apiService';
import { RecurringCostCard } from '../ui/Cards';
import { Animate } from '../ui/Animate';
import { useModal } from '../../hooks/useModal';
import { Skeleton } from '../ui/Skeleton';

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

export const BudgetRecurringCostsWidget: React.FC = () => {
    const { openModal } = useModal();
    const [data, setData] = useState<RecurringCostSummary[] | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const items = await apiService.getRecurringCosts();
            setData(items);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const handleDataUpdated = () => fetchData();
        window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
        return () => window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    }, [fetchData]);

    const handleRecurringCardClick = (categoryName: string) => {
        sessionStorage.setItem('selectedRecurringCostName', categoryName);
        openModal('recurring-cost-detail');
    };

    if (loading || !data) {
        return (
            <section>
                <SectionHeader title="Fixed Recurring" accentColor="#C46555" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Skeleton className="h-44 rounded-xl" />
                    <Skeleton className="h-44 rounded-xl" />
                </div>
            </section>
        );
    }

    return (
        <Animate type="slideUp" delay={0.4}>
            <section>
                <SectionHeader title="Fixed Recurring" accentColor="#C46555" onAdd={() => openModal('new-recurring-type')} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.map(item => (
                        <div key={item.name} onClick={() => handleRecurringCardClick(item.name)} className="cursor-pointer">
                            <RecurringCostCard item={item} />
                        </div>
                    ))}
                </div>
            </section>
        </Animate>
    );
};
