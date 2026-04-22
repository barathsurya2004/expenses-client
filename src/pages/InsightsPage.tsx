import React, { useState, useEffect, useCallback } from 'react';
import { InsightCard } from '../components/ui/Cards';
import { ProgressBar } from '../components/ui/Common';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { InsightsPageData } from '../services/apiService';
import { Animate } from '../components/ui/Animate';

const InsightsPage: React.FC = () => {
    const [data, setData] = useState<InsightsPageData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const pageData = await apiService.getInsightsPageData();
            setData(pageData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleDataUpdated = () => fetchData();
        window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
        return () => window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    }, [fetchData]);

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ledger-bg">
                <div className="w-10 h-10 border-2 border-ledger-accent/20 border-t-ledger-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12 pb-24 md:pb-12 font-body">
            <Animate type="fade">
                <header>
                    <h1 className="font-headline text-4xl font-bold text-ledger-text tracking-tight">Insights</h1>
                    <p className="text-[13px] text-ledger-muted mt-2">AI-powered analysis · April 2026</p>
                </header>
            </Animate>

            {/* KPI strip */}
            <Animate type="slideUp" delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Savings Rate', val: `${data.recurring.savingsRate}%`, color: 'text-ledger-income', sub: 'above 20% target' },
                        { label: 'Biggest Category', val: data.biggestExpense?.category || 'Food', color: 'text-ledger-accent', sub: `₹${(data.biggestExpense?.amount || 0).toLocaleString()} spent` },
                        { label: 'Over Budget', val: `${data.budgetHealth.overBudgetCount} categories`, color: 'text-ledger-expense', sub: 'need attention' },
                    ].map(k => (
                        <div key={k.label} className="bg-ledger-s2 border border-ledger-border rounded-xl p-6">
                            <div className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">{k.label}</div>
                            <div className={`text-[17px] font-bold ${k.color} mb-1`}>{k.val}</div>
                            <div className="text-[11px] text-ledger-dim font-medium">{k.sub}</div>
                        </div>
                    ))}
                </div>
            </Animate>

            {/* Budget Health */}
            <Animate type="slideUp" delay={0.25}>
                <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${data.budgetHealth.healthBarColor}, transparent)` }} />
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div>
                            <h3 className="font-headline text-xl font-bold text-ledger-text">Budget Health</h3>
                            <p className="text-[12px] text-ledger-muted mt-1 font-body">
                                Across all {data.budgetHealth.totalCategories} categories tracked this month
                            </p>
                        </div>
                        <div className="md:text-right">
                            <span className="font-mono text-4xl font-medium tracking-tight" style={{ color: data.budgetHealth.healthBarColor }}>
                                {data.budgetHealth.healthScore}%
                            </span>
                            <p className="text-[10px] text-ledger-dim font-bold uppercase tracking-[0.15em] mt-2 font-body">
                                {data.budgetHealth.onTrackCount} on track · {data.budgetHealth.overBudgetCount} over
                            </p>
                        </div>
                    </div>

                    <ProgressBar progress={data.budgetHealth.healthScore} color={data.budgetHealth.healthBarColor} height="h-2" />

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

            {/* Insight cards */}
            <div className="space-y-4">
                {data.insights.map((ins, idx) => (
                    <Animate key={ins.id} type="slideUp" delay={0.3 + (idx * 0.1)}>
                        <InsightCard insight={ins} />
                    </Animate>
                ))}
            </div>

            {/* Horizontal bar chart */}
            <Animate type="slideUp" delay={0.5}>
                <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-8">
                    <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] mb-8 font-bold">Spending by Category — April 2026</div>
                    <div className="space-y-4">
                        {data.categoryRows.map(cat => (
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
        </div>
    );
};

export default InsightsPage;
