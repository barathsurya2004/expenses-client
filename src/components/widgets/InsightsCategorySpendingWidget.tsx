import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { InsightsPageData } from '../../services/apiService';
import { ProgressBar } from '../ui/Common';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const InsightsCategorySpendingWidget: React.FC = () => {
    const [data, setData] = useState<InsightsPageData['categoryRows'] | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const distribution = await apiService.getSpendingDistribution();
            setData(distribution);
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
        <Animate type="slideUp" delay={0.5}>
            <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-8">
                <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] mb-8 font-bold">Spending by Category — April 2026</div>
                <div className="space-y-4">
                    {data.map(cat => (
                        <div key={cat.name} className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.colorHex }} />
                            <div className="w-28 text-[12px] text-ledger-muted text-right font-medium truncate">{cat.name}</div>
                            <div className="flex-1">
                                <ProgressBar progress={cat.percentage} color={cat.colorHex} height="h-[4px]" />
                            </div>
                            <div className="w-20 font-mono text-[12px] text-ledger-text text-right">₹{Math.round((cat.percentage / 100) * 14000).toLocaleString()}</div>
                            <div className={`w-10 text-[11px] text-right font-medium ${cat.percentage > 100 ? 'text-ledger-expense' : 'text-ledger-dim'}`}>{Math.round(cat.percentage)}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </Animate>
    );
};
