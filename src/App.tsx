import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MobileNavbar from './components/MobileNavbar'
import BudgetPage from './pages/BudgetPage'
import DashboardPage from './pages/DashboardPage'
import InsightsPage from './pages/InsightsPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import WishlistPage from './pages/WishlistPage'
import WishlistItemPage from './pages/WishlistItemPage'
import TransactionsPage from './pages/TransactionsPage'
import { Modal } from './components/ui/Modal'
import { useModal } from './hooks/useModal'
import {
  ExpenseModalContent,
  SavingsExpenseModalContent,
  RecurringCostDetailModalContent,
  IncomeModalContent,
  TransferModalContent,
  AddGoalModalContent,
  AdjustTargetModalContent,
  EditGoalModalContent,
  EditTransactionModalContent,
  QuickAddGoalModalContent,
  NewRecurringCostModalContent,
  NewBudgetTypeModalContent
} from './components/modals/ActionModals'

function App() {
  const location = useLocation();
  const { activeModal, closeModal } = useModal();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'expense': return <ExpenseModalContent />;
      case 'savings-expense': return <SavingsExpenseModalContent />;
      case 'recurring-cost-detail': return <RecurringCostDetailModalContent />;
      case 'income': return <IncomeModalContent />;
      case 'transfer': return <TransferModalContent />;
      case 'goal': return <AddGoalModalContent />;
      case 'adjust-target': return <AdjustTargetModalContent />;
      case 'edit-goal': return <EditGoalModalContent />;
      case 'edit-transaction': return <EditTransactionModalContent />;
      case 'quick-add-goal': return <QuickAddGoalModalContent />;
      case 'new-spending-type': return <NewBudgetTypeModalContent kind="spending" />;
      case 'new-savings-type': return <NewBudgetTypeModalContent kind="savings" />;
      case 'new-recurring-type': return <NewRecurringCostModalContent />;
      default: return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'expense': return 'Add Expense';
      case 'savings-expense': return 'Add Savings Expense';
      case 'recurring-cost-detail': {
        const recurringCostName = typeof window !== 'undefined' ? sessionStorage.getItem('selectedRecurringCostName') : null;
        return recurringCostName ? `${recurringCostName} Details` : 'Recurring Cost';
      }
      case 'income': return 'Add Income';
      case 'transfer': return 'Transfer Funds';
      case 'goal': return 'Create New Goal';
      case 'adjust-target': return 'Adjust Goal Target';
      case 'edit-goal': return 'Edit Goal';
      case 'edit-transaction': return 'Edit Transaction';
      case 'quick-add-goal': return 'Quick Add Funds';
      case 'new-spending-type': return 'Create Spending Type';
      case 'new-savings-type': return 'Create Savings Type';
      case 'new-recurring-type': return 'Create Recurring Type';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen pb-10 md:pb-28">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/wishlist/:id" element={<WishlistItemPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <MobileNavbar />

      {/* Global Modal */}
      <Modal
        isOpen={activeModal !== null}
        onClose={closeModal}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  )
}

export default App
