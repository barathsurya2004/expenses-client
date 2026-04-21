import { createContext } from 'react';

export type ModalType =
  | 'expense'
  | 'savings-expense'
  | 'recurring-cost-detail'
  | 'income'
  | 'transfer'
  | 'goal'
  | 'adjust-target'
  | 'edit-goal'
  | 'edit-transaction'
  | 'quick-add-goal'
  | 'new-spending-type'
  | 'new-savings-type'
  | 'new-recurring-type'
  | null;

export interface ModalContextType {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);
