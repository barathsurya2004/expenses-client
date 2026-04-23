import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { CategorySpending } from '../../types';
import { BudgetCard } from '../ui/Cards';
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

export const BudgetSavingsCategoriesWidget: React.FC = () => {
    const { openModal } = useModal();
    const navigate = useNavigate();
    const [data, setData] = useState<CategorySpending[] | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const categories = await apiService.getCategorySavings();
            setData(categories);
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

    const handleCardClick = () => {
        navigate('/transactions');
    };

    if (loading || !data) {
        return (
            <section>
                <SectionHeader title="Savings & Investments" accentColor="#6DAD85" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Skeleton className="h-44 rounded-xl" />
                    <Skeleton className="h-44 rounded-xl" />
                </div>
            </section>
        );
    }

    return (
        <Animate type="slideUp" delay={0.5}>
            <section>
                <SectionHeader title="Savings & Investments" accentColor="#6DAD85" onAdd={() => openModal('new-savings-type')} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.map(cat => (
                        <div key={cat.name} onClick={handleCardClick} className="cursor-pointer">
                            <BudgetCard category={cat} />
                        </div>
                    ))}
                </div>
            </section>
        </Animate>
    );
};
