import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { Insight } from '../../types';
import { InsightCard } from '../ui/Cards';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const InsightsAIListWidget: React.FC = () => {
    const [data, setData] = useState<Insight[] | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const insights = await apiService.getInsights();
            setData(insights);
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
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((ins, idx) => (
                <Animate key={ins.id} type="slideUp" delay={0.3 + (idx * 0.1)}>
                    <InsightCard insight={ins} />
                </Animate>
            ))}
        </div>
    );
};
