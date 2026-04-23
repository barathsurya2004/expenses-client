import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { BudgetHealthStats } from '../../services/apiService';
import { ProgressBar } from '../ui/Common';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const InsightsBudgetHealthWidget: React.FC = () => {
    const [data, setData] = useState<BudgetHealthStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const health = await apiService.getBudgetHealthStats();
            setData(health);
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

    if (loading || !data) {
        return <Skeleton className="h-64 rounded-2xl" />;
    }

    return (
        <Animate type="slideUp" delay={0.25}>
            <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${data.healthBarColor}, transparent)` }} />

                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div>
                        <h3 className="font-headline text-xl font-bold text-ledger-text">Budget Health</h3>
                        <p className="text-[12px] text-ledger-muted mt-1 font-body">
                            Across all {data.totalCategories} categories tracked this month
                        </p>
                    </div>
                    <div className="md:text-right">
                        <span className="font-mono text-4xl font-medium tracking-tight" style={{ color: data.healthBarColor }}>
                            {data.healthScore}%
                        </span>
                        <p className="text-[10px] text-ledger-dim font-bold uppercase tracking-[0.15em] mt-2 font-body">
                            {data.onTrackCount} on track · {data.overBudgetCount} over
                        </p>
                    </div>
                </div>

                <ProgressBar progress={data.healthScore} color={data.healthBarColor} height="h-2" />

                {data.overBudgetCategories.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-[3px] h-3 bg-ledger-expense rounded-full" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ledger-expense font-body">
                                Attention Required
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.overBudgetCategories.map(category => (
                                <div key={category.name} className="flex items-center justify-between bg-ledger-bg/40 border border-ledger-border rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-ledger-faint flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[15px]" style={{ color: category.colorHex }}>
                                                {category.icon}
                                            </span>
                                        </div>
                                        <span className="text-[13px] text-ledger-text font-medium truncate">{category.name}</span>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <span className="text-[13px] font-mono font-bold text-ledger-expense">
                                            +{category.percentage - 100}%
                                        </span>
                                        <span className="block text-[10px] text-ledger-dim font-medium">
                                            ₹{Math.round(category.overage).toLocaleString()} over
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.onTrackCategories.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-ledger-border/40">
                        <div className="flex items-center gap-2">
                            <div className="w-[3px] h-3 bg-ledger-income rounded-full" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ledger-income font-body">
                                Within Budget
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.onTrackCategories.map(category => (
                                <div key={category.name} className="flex items-center gap-2 bg-ledger-bg/40 border border-ledger-border rounded-lg px-3 py-1.5">
                                    <span className="material-symbols-outlined text-ledger-accent text-[14px]">
                                        {category.icon}
                                    </span>
                                    <span className="text-[11px] text-ledger-muted font-medium font-body">{category.name}</span>
                                    <span className="text-[11px] text-ledger-text font-bold font-mono">{category.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Animate>
    );
};
