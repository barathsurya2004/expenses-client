import React, { useState, useEffect, useCallback } from 'react';
import { TopAppBar } from '../components/ui/Common';
import { InsightCard } from '../components/ui/Cards';
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
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-surface text-on-surface min-h-screen pb-32 pt-20 selection:bg-primary selection:text-on-primary">
            <TopAppBar title="Vault" />

            <main className="max-w-5xl mx-auto px-6 space-y-6">
                <Animate type="fade" duration={0.8}>
                    <section className="space-y-1 pt-4">
                        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Insights</h2>
                        <p className="text-on-surface-variant text-[13px] font-medium">
                            {data.header.monthLabel}
                            &nbsp;·&nbsp;Day {data.header.dayOfMonth} of {data.header.daysInMonth}
                            &nbsp;·&nbsp;{data.header.daysRemaining} days remaining
                        </p>
                    </section>
                </Animate>


                <Animate type="slideUp" delay={0.22}>
                    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15 space-y-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-base font-bold tracking-tight text-on-surface">Budget Health</h3>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">
                                    Across all {data.budgetHealth.totalCategories} categories this month
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold tracking-tight" style={{ color: data.budgetHealth.healthBarColor }}>
                                    {data.budgetHealth.healthScore}%
                                </span>
                                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-0.5">
                                    {data.budgetHealth.onTrackCount} on track · {data.budgetHealth.overBudgetCount} over
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${data.budgetHealth.healthScore}%`, background: data.budgetHealth.healthBarColor }}
                            />
                        </div>

                        {data.overBudgetCategories.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#f87171' }}>
                                    Over Budget
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {data.overBudgetCategories.map(category => (
                                        <div key={category.name} className="flex items-center justify-between bg-surface-container-highest rounded-lg px-3 py-2.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="material-symbols-outlined text-[15px]" style={{ color: category.colorHex }}>
                                                    {category.icon}
                                                </span>
                                                <span className="text-[12px] text-on-surface font-medium truncate">{category.name}</span>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <span className="text-[12px] font-bold" style={{ color: '#f87171' }}>
                                                    +{category.percentage - 100}%
                                                </span>
                                                <span className="block text-[10px] text-on-surface-variant">
                                                    ₹{Math.round(category.overage).toLocaleString()} over
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.onTrackCategories.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4ade80' }}>
                                    Within Budget
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {data.onTrackCategories.slice(0, 8).map(category => (
                                        <div key={category.name} className="flex items-center gap-1.5 bg-surface-container-highest rounded-lg px-3 py-1.5">
                                            <span className="material-symbols-outlined text-primary text-[13px]">
                                                {category.icon}
                                            </span>
                                            <span className="text-[11px] text-on-surface-variant font-medium">{category.name}</span>
                                            <span className="text-[11px] font-bold text-on-surface">{category.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Animate><section className="grid grid-cols-2 gap-4">
                    {data.pulseStats.map((stat, index) => (
                        <Animate key={stat.label} type="slideUp" delay={0.08 + index * 0.05}>
                            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 flex flex-col gap-1.5 h-full">
                                <span className="material-symbols-outlined text-primary text-[20px]">{stat.icon}</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
                                <p className="text-xl font-bold tracking-tight" style={stat.colorHex ? { color: stat.colorHex } : {}}>
                                    {stat.value}
                                </p>
                                <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">{stat.sub}</p>
                            </div>
                        </Animate>
                    ))}
                </section>


                <section className="grid gap-5">
                    <Animate type="slideUp" delay={0.28}>
                        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15 space-y-5 h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-base font-bold tracking-tight text-on-surface">Spend by Day</h3>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">
                                        Peak: {data.peakDay}s
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">calendar_today</span>
                            </div>
                            <div className="flex items-end gap-2 h-28">
                                {data.daySpend.map(day => (
                                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                                        <div
                                            className="w-full rounded-t-md"
                                            style={{
                                                height: `${day.heightPercent}%`,
                                                background: day.isPeak ? '#aac7ff' : '#2a2a2d',
                                                minHeight: '5px',
                                            }}
                                        />
                                        <span
                                            className="text-[9px] font-black uppercase tracking-wide"
                                            style={{ color: day.isPeak ? '#aac7ff' : undefined }}
                                        >
                                            {day.day.slice(0, 2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-surface-container-highest rounded-lg px-4 py-3 space-y-0.5">
                                <p className="text-[11px] text-on-surface-variant">
                                    Highest spending on <span className="text-primary font-bold">{data.peakDay}s</span>
                                    {data.daySpend.find(day => day.isPeak)?.amount
                                        ? ` · ₹${Math.round(data.daySpend.find(day => day.isPeak)?.amount ?? 0).toLocaleString()} this month`
                                        : ''}.
                                </p>
                            </div>
                        </div>
                    </Animate>

                    <Animate type="slideUp" delay={0.33}>
                        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15 space-y-5 h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-base font-bold tracking-tight text-on-surface">Visit Frequency</h3>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">
                                        Times visited · not by amount
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">repeat</span>
                            </div>
                            <div className="space-y-3.5">
                                {data.topMerchants.length === 0 && (
                                    <p className="text-[13px] text-on-surface-variant text-center py-6">No transactions yet</p>
                                )}
                                {data.topMerchants.map(merchant => (
                                    <div key={merchant.merchant} className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[10px] font-black text-on-surface-variant w-3">{merchant.rank}</span>
                                                <span className="text-[12px] text-on-surface font-medium truncate">{merchant.merchant}</span>
                                            </div>
                                            <span className="text-[11px] text-on-surface-variant font-bold shrink-0 ml-2">{merchant.count}×</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${merchant.progress}%`,
                                                    background: '#aac7ff',
                                                    opacity: merchant.opacity,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Animate>
                </section>

                <section className="grid grid-cols-2 gap-4">
                    <Animate type="slideUp" delay={0.36}>
                        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 flex flex-col gap-2 h-full">
                            <span className="material-symbols-outlined text-[20px]" style={{ color: '#f87171' }}>arrow_circle_up</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Biggest Expense</p>
                            <p className="text-xl font-bold tracking-tight text-on-surface">
                                {data.biggestExpense ? `₹${data.biggestExpense.amount.toLocaleString()}` : '—'}
                            </p>
                            <p className="text-[12px] text-on-surface-variant font-medium truncate">
                                {data.biggestExpense?.merchant ?? 'No transactions'}
                            </p>
                            <p className="text-[10px] text-on-surface-variant/60">{data.biggestExpense?.category ?? ''}</p>
                        </div>
                    </Animate>

                    <Animate type="slideUp" delay={0.4}>
                        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 flex flex-col gap-2 h-full">
                            <span className="material-symbols-outlined text-primary text-[20px]">autorenew</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Recurring Burden</p>
                            <p className="text-xl font-bold tracking-tight text-on-surface">{data.recurring.recurringPct}%</p>
                            <p className="text-[12px] text-on-surface-variant font-medium">of income is fixed costs</p>
                            {data.recurring.recurringTotal > 0 && (
                                <p className="text-[10px] text-on-surface-variant/60">₹{data.recurring.recurringTotal.toLocaleString()} / month</p>
                            )}
                        </div>
                    </Animate>

                    <Animate type="slideUp" delay={0.44} className="col-span-2">
                        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 flex flex-col gap-3 h-full">
                            <span className="material-symbols-outlined text-primary text-[20px]">donut_small</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Income Split</p>
                            <div className="w-full h-2 rounded-full overflow-hidden flex">
                                <div style={{ width: `${Math.min(Math.max(data.recurring.savingsRate, 0), 100)}%`, background: '#4ade80' }} />
                                <div style={{ width: `${Math.min(data.recurring.recurringPct, Math.max(0, 100 - data.recurring.savingsRate))}%`, background: '#aac7ff' }} />
                                <div style={{ flex: 1, background: '#2a2a2d' }} />
                            </div>
                            <div className="space-y-1">
                                {[
                                    { label: 'Saved', pct: data.recurring.savingsRate, color: '#4ade80' },
                                    { label: 'Recurring', pct: data.recurring.recurringPct, color: '#aac7ff' },
                                    { label: 'Discretionary', pct: data.recurring.discretionaryPct, color: '#2a2a2d' },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between text-[11px]">
                                        <span className="flex items-center gap-1.5 text-on-surface-variant">
                                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: row.color }} />
                                            {row.label}
                                        </span>
                                        <span className="font-bold text-on-surface">{row.pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Animate>
                </section>



                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Animate type="slideUp" delay={0.5} className="col-span-2">
                        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15 space-y-6 h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-base font-bold tracking-tight text-on-surface">Cash Flow</h3>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Income vs Expenses</p>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant transition-colors">
                                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]">more_horiz</span>
                                </button>
                            </div>
                            <div className="h-48 relative w-full flex items-end">
                                <div className="absolute inset-0 grid grid-cols-5 gap-4 opacity-10">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="border-l border-outline-variant h-full" />)}
                                </div>
                                <div className="absolute inset-0 w-full h-full">
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#aac7ff" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#aac7ff" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,40 C20,35 30,45 50,20 C70,-5 80,30 100,10 L100,50 L0,50 Z" fill="url(#chartGradient)" />
                                        <path d="M0,40 C20,35 30,45 50,20 C70,-5 80,30 100,10" fill="none" stroke="#aac7ff" strokeLinecap="round" strokeWidth="0.8" />
                                        <circle cx="100" cy="10" fill="#131316" r="1.5" stroke="#aac7ff" strokeWidth="0.8" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] text-on-surface-variant font-black tracking-widest uppercase px-1">
                                {data.last6Months.map((month, index) => (
                                    <span key={month} className={index === data.last6Months.length - 1 ? 'text-primary' : ''}>{month}</span>
                                ))}
                            </div>
                        </div>
                    </Animate>

                    <Animate type="slideUp" delay={0.55} className="col-span-2">
                        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15 flex flex-col items-center space-y-5 h-full">
                            <div className="w-full flex justify-between items-start">
                                <div>
                                    <h3 className="text-base font-bold tracking-tight text-on-surface">Categories</h3>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Budget compliance</p>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">pie_chart</span>
                            </div>
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="#2a2a2d" strokeWidth="7" />
                                    <circle
                                        cx="50" cy="50" fill="none" r="45"
                                        stroke={data.healthBarColorHex}
                                        strokeDasharray="282.7"
                                        strokeDashoffset={282.7 - (data.budgetHealth.healthScore / 100) * 282.7}
                                        strokeLinecap="round" strokeWidth="7"
                                    />
                                </svg>
                                <div className="text-center absolute">
                                    <span className="block text-xl font-bold tracking-tight text-on-surface">{data.budgetHealth.healthScore}%</span>
                                    <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Healthy</span>
                                </div>
                            </div>
                            <div className="w-full space-y-2.5">
                                {data.categoryRows.map(category => (
                                    <div key={category.name} className="flex items-center justify-between text-[12px] font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.colorHex }} />
                                            <span className="text-on-surface-variant">{category.name}</span>
                                        </div>
                                        <span className="font-bold" style={{ color: category.percentage > 100 ? '#f87171' : undefined }}>
                                            {category.percentage}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Animate>
                </section>
                {data.insights.map((insight, index) => (
                    <Animate key={insight.id} type="slideUp" delay={0.1 * (index + 1)}>
                        <InsightCard insight={insight} />
                    </Animate>
                ))}
            </main>
        </div>
    );
};

export default InsightsPage;
