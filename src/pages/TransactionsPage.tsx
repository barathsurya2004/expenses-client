import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/ui/Common';
import { TransactionItem } from '../components/ui/Cards';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { GroupedTransactions } from '../services/apiService';
import { Animate } from '../components/ui/Animate';
import { useModal } from '../hooks/useModal';

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransactions[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await apiService.getTransactionsGrouped();
      setGroupedTransactions(data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-32 pt-20 antialiased">
      <TopAppBar
        title="Transactions"
        showBack
        onBack={() => navigate(-1)}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <Animate type="fade">
          <header className="space-y-1 py-2">
            <h2 className="text-xl font-bold tracking-tight text-on-surface">History</h2>
            <p className="text-[13px] font-medium text-on-surface-variant">Review all your recent activity.</p>
          </header>
        </Animate>

        <div className="space-y-8">
          {groupedTransactions.map((group, groupIndex) => (
            <div key={group.date} className="space-y-3">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-2 flex items-center gap-3">
                {group.label}
                <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
              </h3>

              <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
                <div className="divide-y divide-outline-variant/10">
                  {group.items.map((transaction, index) => (
                    <Animate key={transaction.id} type="slideUp" delay={(groupIndex * 0.1) + (index * 0.05)} className="hover:bg-surface-container transition-colors">
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem('editTransactionId', transaction.id);
                          openModal('edit-transaction');
                        }}
                        className="w-full p-4 text-left"
                      >
                        <TransactionItem transaction={transaction} />
                      </button>
                    </Animate>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;
