import React from 'react';
import { TransactionsListWidget } from '../components/widgets/TransactionsListWidget';

const TransactionsPage: React.FC = () => {
  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-10 pb-24 md:pb-12">
      <TransactionsListWidget />
    </div>
  );
};

export default TransactionsPage;
