import React, { useState, useEffect } from 'react';
import { useMatch } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import type { CategorySpending, Goal } from '../../types';
import { useModal } from '../../hooks/useModal';
import type { RecurringCostSummary } from '../../services/apiService';

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
};

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ledger-dim mb-1.5 ml-0.5 font-body">
    {children}
  </p>
);

const InputField: React.FC<{
  label: string;
  placeholder: string;
  type?: string;
  icon?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
}> = ({ label, placeholder, type = 'text', icon, value, onChange, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative group">
        {icon && (
          <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] pointer-events-none transition-colors duration-150 ${focused ? 'text-ledger-accent' : 'text-ledger-dim'}`}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-ledger-s2 border rounded-[12px] text-[13.5px] font-medium text-ledger-text outline-none transition-all duration-150 font-body ${icon ? 'pl-[42px]' : 'px-4'} pr-4 py-3 ${focused ? 'border-ledger-accent/50 shadow-[0_0_0_3px_rgba(196,144,61,0.05)]' : 'border-ledger-border'}`}
        />
      </div>
      {hint && <p className="text-[10px] text-ledger-dim/60 mt-1.5 ml-0.5">{hint}</p>}
    </div>
  );
};

const SelectField: React.FC<{
  label: string;
  icon?: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}> = ({ label, icon, value, onChange, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative group">
        {icon && (
          <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] pointer-events-none z-10 transition-colors duration-150 ${focused ? 'text-ledger-accent' : 'text-ledger-dim'}`}>
            {icon}
          </span>
        )}
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-ledger-dim pointer-events-none">
          expand_more
        </span>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full appearance-none bg-ledger-s2 border rounded-[12px] text-[13.5px] font-medium text-ledger-text outline-none cursor-pointer transition-all duration-150 font-body ${icon ? 'pl-[42px]' : 'px-4'} pr-9 py-3 ${focused ? 'border-ledger-accent/50 shadow-[0_0_0_3px_rgba(196,144,61,0.05)]' : 'border-ledger-border'}`}
        >
          {children}
        </select>
      </div>
    </div>
  );
};

const TextareaField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}> = ({ label, placeholder, value, onChange, rows = 3 }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-ledger-s2 border rounded-[12px] text-[13.5px] font-medium text-ledger-text outline-none transition-all duration-150 font-body px-4 py-3 resize-none ${focused ? 'border-ledger-accent/50 shadow-[0_0_0_3px_rgba(196,144,61,0.05)]' : 'border-ledger-border'}`}
      />
    </div>
  );
};

const PrimaryButton: React.FC<{ label: string; icon: string; onClick?: () => void; disabled?: boolean }> = ({ label, icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="group relative w-full py-3.5 mt-2 rounded-[12px] bg-ledger-accent text-ledger-bg text-[11.5px] font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 overflow-hidden transition-all duration-150 hover:bg-[#D4A050] active:scale-[0.98] disabled:bg-ledger-faint disabled:text-ledger-dim disabled:cursor-not-allowed disabled:shadow-none shadow-[0_4px_16px_rgba(196,144,61,0.15)] font-body"
  >
    {label}
    <span className="material-symbols-outlined text-[17px]">{icon}</span>
  </button>
);

const GhostButton: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full py-3 rounded-[12px] bg-transparent border border-ledger-border text-ledger-muted text-[11.5px] font-semibold tracking-[0.08em] transition-all duration-150 hover:bg-ledger-s3 hover:text-ledger-text active:scale-[0.98] font-body"
  >
    {label}
  </button>
);

const CategorySelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  kind?: 'spending' | 'savings' | 'recurring';
}> = ({ label, value, onChange, kind }) => {
  const [categories, setCategories] = useState<CategorySpending[]>([]);

  useEffect(() => {
    apiService.getCategories().then(data => {
      if (kind) {
        setCategories(data.filter(c => c.kind === kind));
      } else {
        setCategories(data);
      }
    });
  }, [kind]);

  return (
    <SelectField label={label} icon="category" value={value} onChange={onChange}>
      <option value="" disabled className="bg-[#181614]">Select category</option>
      {categories.map(cat => (
        <option key={cat.name} value={cat.name} className="bg-[#181614] text-ledger-text">{cat.name}</option>
      ))}
    </SelectField>
  );
};

const iconOptions = [
  'category', 'restaurant', 'directions_car', 'home', 'flight', 'savings',
  'medical_services', 'shopping_bag', 'account_balance_wallet', 'subscriptions',
  'payments', 'work', 'laptop_mac', 'watch', 'school', 'pets', 'bolt', 'movie',
  'sports_esports', 'local_cafe', 'fitness_center', 'flag'
] as const;

const COLORS = [
  { key: 'primary', hex: '#C4903D' },
  { key: 'secondary', hex: '#A87AC9' },
  { key: 'tertiary', hex: '#4ABFAB' },
  { key: 'tertiary-container', hex: '#5A9BE8' },
  { key: 'error', hex: '#C46555' },
  { key: 'blue-400', hex: '#60A5FA' },
  { key: 'green-400', hex: '#4ADE80' },
] as const;

const IconPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex flex-col">
    <FieldLabel>Icon</FieldLabel>
    <div className="grid grid-cols-7 gap-1.5 rounded-[12px] border border-ledger-border bg-ledger-s1/60 p-2.5">
      {iconOptions.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          title={option}
          className={`h-9 rounded-lg border transition-all duration-120 flex items-center justify-center ${value === option ? 'border-ledger-accent/60 bg-ledger-accent/10 text-ledger-accent' : 'border-transparent bg-ledger-s2 text-ledger-dim hover:text-ledger-muted'}`}
        >
          <span className="material-symbols-outlined text-[17px]">{option}</span>
        </button>
      ))}
    </div>
  </div>
);

const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex flex-col">
    <FieldLabel>Color</FieldLabel>
    <div className="flex flex-wrap gap-2.5 rounded-[12px] border border-ledger-border bg-ledger-s1/60 p-3">
      {COLORS.map(({ key, hex }) => {
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={key}
            className={`w-8 h-8 rounded-full transition-all duration-150 relative ${isSelected ? 'scale-115 opacity-100 ring-2 ring-white ring-offset-2 ring-offset-ledger-bg shadow-[0_0_0_3px_rgba(255,255,255,0.1)]' : 'opacity-65 scale-100'}`}
            style={{ backgroundColor: hex }}
          />
        );
      })}
    </div>
  </div>
);

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2.5 bg-ledger-expense/10 border border-ledger-expense/25 rounded-[12px] px-4 py-3 transition-all">
    <span className="material-symbols-outlined text-[16px] text-ledger-expense">error_outline</span>
    <p className="text-[12px] text-ledger-expense font-medium font-body">{message}</p>
  </div>
);

const TypeBadge: React.FC<{ label: string; color?: string }> = ({ label, color = '#C4903D' }) => (
  <div 
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-opacity-10 transition-all"
    style={{ backgroundColor: `${color}14`, borderColor: `${color}30` }}
  >
    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color }}>{label}</span>
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number; color?: string; h?: number }> = ({ value, max, color = '#C4903D', h = 4 }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full rounded-full bg-ledger-faint overflow-hidden" style={{ height: h }}>
      <div 
        className="h-full rounded-full transition-all duration-700 ease-out" 
        style={{ width: `${pct}%`, backgroundColor: color }} 
      />
    </div>
  );
};

export const ExpenseModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: '', merchant: '', category: '', date: new Date().toISOString().split('T')[0] });

  const handleAdd = async () => {
    if (!form.amount || !form.merchant || !form.category) return;
    setLoading(true);
    await apiService.addTransaction({
      amount: Number(form.amount),
      merchant: form.merchant,
      category: form.category,
      date: form.date,
      type: 'expense',
      icon: 'receipt_long'
    });
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField label="Amount" placeholder="₹ 0.00" type="number" icon="currency_rupee" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <InputField label="Merchant" placeholder="Where did you spend?" icon="storefront" value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} />
      <CategorySelect label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} kind="spending" />
      <InputField label="Date" placeholder="" type="date" icon="calendar_today" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      <PrimaryButton label={loading ? "Adding..." : "Add Expense"} icon="receipt_long" onClick={handleAdd} disabled={loading} />
    </div>
  );
};

export const SavingsExpenseModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: '', merchant: '', category: '', date: new Date().toISOString().split('T')[0] });

  const handleAdd = async () => {
    if (!form.amount || !form.merchant || !form.category) return;
    setLoading(true);
    await apiService.addTransaction({
      amount: Number(form.amount),
      merchant: form.merchant,
      category: form.category,
      date: form.date,
      type: 'expense',
      icon: 'savings'
    });
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField label="Amount" placeholder="₹ 0.00" type="number" icon="currency_rupee" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <InputField label="Merchant" placeholder="Where did you put it?" icon="storefront" value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} />
      <CategorySelect label="Savings Category" value={form.category} onChange={v => setForm({ ...form, category: v })} kind="savings" />
      <InputField label="Date" placeholder="" type="date" icon="calendar_today" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      <PrimaryButton label={loading ? "Adding..." : "Add to Savings"} icon="savings" onClick={handleAdd} disabled={loading} />
    </div>
  );
};

export const IncomeModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: '', source: '', date: new Date().toISOString().split('T')[0] });

  const handleAdd = async () => {
    if (!form.amount || !form.source) return;
    setLoading(true);
    await apiService.addTransaction({
      amount: Number(form.amount),
      merchant: form.source,
      category: 'Income',
      date: form.date,
      type: 'income',
      icon: 'payments'
    });
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField label="Amount" placeholder="₹ 0.00" type="number" icon="payments" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <InputField label="Source" placeholder="Salary, Freelance, etc." icon="source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
      <InputField label="Date" placeholder="" type="date" icon="calendar_today" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      <PrimaryButton label={loading ? "Adding..." : "Add Income"} icon="add_chart" onClick={handleAdd} disabled={loading} />
    </div>
  );
};

export const TransferModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: '', from: '', to: '', note: '' });

  const handleTransfer = async () => {
    if (!form.amount || !form.from || !form.to) return;
    setLoading(true);
    await apiService.addTransaction({
      amount: Number(form.amount),
      merchant: `Transfer: ${form.from} ➔ ${form.to}`,
      category: 'Transfer',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      icon: 'swap_horiz'
    });
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField label="Amount" placeholder="₹ 0.00" type="number" icon="swap_horiz" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      
      <div className="flex flex-col">
        <FieldLabel>Transfer Route</FieldLabel>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-ledger-dim pointer-events-none">account_balance_wallet</span>
            <input 
              placeholder="From" 
              value={form.from} 
              onChange={e => setForm({ ...form, from: e.target.value })}
              className="w-full bg-ledger-s2 border border-ledger-border rounded-[12px] pl-[42px] pr-3 py-3 text-[13.5px] font-medium text-ledger-text outline-none transition-all focus:border-ledger-accent/40 font-body"
            />
          </div>
          <span className="material-symbols-outlined text-ledger-dim text-[18px] flex-shrink-0">arrow_forward</span>
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-ledger-dim pointer-events-none">savings</span>
            <input 
              placeholder="To" 
              value={form.to} 
              onChange={e => setForm({ ...form, to: e.target.value })}
              className="w-full bg-ledger-s2 border border-ledger-border rounded-[12px] pl-[42px] pr-3 py-3 text-[13.5px] font-medium text-ledger-text outline-none transition-all focus:border-ledger-accent/40 font-body"
            />
          </div>
        </div>
      </div>

      <InputField label="Note" placeholder="What's this for?" icon="notes" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
      <PrimaryButton label={loading ? "Transferring..." : "Transfer Funds"} icon="sync_alt" onClick={handleTransfer} disabled={loading} />
    </div>
  );
};

export const AddGoalModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<GoalFormData>(defaultGoalForm);

  const updateField = (field: keyof GoalFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.targetAmount) return;
    setLoading(true);
    try {
      await apiService.addGoal({
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount) || 0,
        category: form.category.trim() || 'Savings',
        description: form.description.trim(),
        image: form.image.trim() || undefined,
        icon: form.icon || 'flag',
        color: form.color || 'primary',
        eta: form.eta.trim() || undefined,
        priority: form.priority,
      });
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField label="Goal Name" placeholder="e.g. MacBook Pro M4" value={form.name} onChange={(e) => updateField('name', e.target.value)} icon="flag" />
      
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Target Amount" type="number" placeholder="₹ 0.00" value={form.targetAmount} onChange={(e) => updateField('targetAmount', e.target.value)} icon="target" />
        <InputField label="Starting Savings" type="number" placeholder="₹ 0.00" value={form.currentAmount} onChange={(e) => updateField('currentAmount', e.target.value)} icon="account_balance_wallet" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Category" placeholder="Electronics..." value={form.category} onChange={(e) => updateField('category', e.target.value)} icon="category" />
        <SelectField label="Priority" icon="priority_high" value={form.priority} onChange={v => updateField('priority', v as GoalFormData['priority'])}>
          <option value="High" className="bg-[#181614]">High Priority</option>
          <option value="Medium" className="bg-[#181614]">Medium Priority</option>
          <option value="Low" className="bg-[#181614]">Low Priority</option>
        </SelectField>
      </div>

      <InputField label="Image URL" placeholder="https://images.unsplash.com/..." value={form.image} onChange={(e) => updateField('image', e.target.value)} icon="image" />

      <TextareaField 
        label="Description" 
        placeholder="Why are you saving for this?" 
        value={form.description} 
        onChange={(e) => updateField('description', e.target.value)} 
      />

      <IconPicker value={form.icon} onChange={(v) => updateField('icon', v)} />
      <ColorPicker value={form.color} onChange={(v) => updateField('color', v)} />

      <PrimaryButton label={loading ? "Creating..." : "Create New Goal"} icon="add_circle" onClick={handleAdd} disabled={loading} />
    </div>
  );
};

type GoalFormData = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  category: string;
  description: string;
  image: string;
  icon: string;
  color: string;
  eta: string;
  priority: 'High' | 'Medium' | 'Low';
};

const defaultGoalForm: GoalFormData = {
  name: '',
  targetAmount: '',
  currentAmount: '',
  category: '',
  description: '',
  image: '',
  icon: 'flag',
  color: 'primary',
  eta: '',
  priority: 'Medium',
};

type TransactionFormData = {
  merchant: string;
  amount: string;
  date: string;
};

const defaultTransactionForm: TransactionFormData = {
  merchant: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
};

export const EditGoalModalContent: React.FC = () => {
  const match = useMatch('/wishlist/:id');
  const { closeModal } = useModal();
  const id = match?.params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(defaultGoalForm);

  useEffect(() => {
    const loadGoal = async () => {
      if (!id) {
        setError('Goal id is missing.');
        setLoading(false);
        return;
      }

      try {
        const goal = await apiService.getGoalById(id);
        if (!goal) {
          setError('Goal not found.');
          return;
        }

        setForm({
          name: goal.name,
          targetAmount: String(goal.targetAmount),
          currentAmount: String(goal.currentAmount),
          category: goal.category,
          description: goal.description,
          image: goal.image || '',
          icon: goal.icon || 'flag',
          color: goal.color || 'primary',
          eta: goal.eta || '',
          priority: goal.priority || 'Medium',
        });
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [id]);

  const updateField = (field: keyof GoalFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;

    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount);

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('Target amount must be greater than 0.');
      return;
    }

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      setError('Current amount cannot be negative.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiService.updateGoal(id, {
        name: form.name.trim(),
        targetAmount,
        currentAmount,
        category: form.category.trim(),
        description: form.description.trim(),
        image: form.image.trim() || undefined,
        icon: form.icon.trim() || 'flag',
        color: form.color.trim() || 'primary',
        eta: form.eta.trim() || undefined,
        priority: form.priority,
      });
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ledger-accent/20 border-t-ledger-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <InputField label="Goal Name" placeholder="e.g. MacBook Pro M4" value={form.name} onChange={(e) => updateField('name', e.target.value)} icon="flag" />
      
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Target Amount" type="number" placeholder="₹ 0.00" value={form.targetAmount} onChange={(e) => updateField('targetAmount', e.target.value)} icon="target" />
        <InputField label="Current Savings" type="number" placeholder="₹ 0.00" value={form.currentAmount} onChange={(e) => updateField('currentAmount', e.target.value)} icon="account_balance_wallet" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Category" placeholder="Electronics..." value={form.category} onChange={(e) => updateField('category', e.target.value)} icon="category" />
        <SelectField label="Priority" icon="priority_high" value={form.priority} onChange={v => updateField('priority', v as GoalFormData['priority'])}>
          <option value="High" className="bg-[#181614]">High Priority</option>
          <option value="Medium" className="bg-[#181614]">Medium Priority</option>
          <option value="Low" className="bg-[#181614]">Low Priority</option>
        </SelectField>
      </div>

      <InputField label="Image URL" placeholder="https://images.unsplash.com/..." value={form.image} onChange={(e) => updateField('image', e.target.value)} icon="image" />

      <InputField label="ETA" placeholder="e.g. Dec 2026 or 6 months" value={form.eta} onChange={(e) => updateField('eta', e.target.value)} icon="schedule" />

      <TextareaField 
        label="Description" 
        placeholder="Why are you saving for this?" 
        value={form.description} 
        onChange={(e) => updateField('description', e.target.value)} 
      />

      <IconPicker value={form.icon} onChange={(v) => updateField('icon', v)} />
      <ColorPicker value={form.color} onChange={(v) => updateField('color', v)} />

      <PrimaryButton label={saving ? 'Saving Changes...' : 'Save Goal Changes'} icon="check_circle" onClick={handleSave} disabled={saving} />
    </div>
  );
};

export const QuickAddGoalModalContent: React.FC = () => {
  const match = useMatch('/wishlist/:id');
  const { closeModal } = useModal();
  const id = match?.params.id || sessionStorage.getItem('quickAddGoalId') || undefined;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoal = async () => {
      if (!id) {
        setError('Goal id is missing.');
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getGoalById(id);
        if (!data) {
          setError('Goal not found.');
          return;
        }

        const remainingAmount = Math.max(data.targetAmount - data.currentAmount, 0);
        setGoal(data);
        setAmount(String(Math.min(remainingAmount, 5000)));
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [id]);

  const remaining = goal ? Math.max(goal.targetAmount - goal.currentAmount, 0) : 0;
  const parsedAmount = Number(amount) || 0;
  const clampedAmount = Math.min(Math.max(parsedAmount, 0), remaining);

  const progress = goal ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const afterPct = goal ? Math.min(((goal.currentAmount + clampedAmount) / goal.targetAmount) * 100, 100) : 0;

  const setPresetAmount = (fraction: number) => {
    setAmount(String(Math.round(remaining * fraction)));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!goal || !id) return;

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    if (parsedAmount > remaining) {
      setError(`You can add up to the remaining amount of ₹${remaining.toLocaleString()}.`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiService.updateGoal(id, {
        currentAmount: goal.currentAmount + parsedAmount,
      });
      sessionStorage.removeItem('quickAddGoalId');
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-6 text-center text-ledger-dim animate-pulse">Loading goal details...</div>;
  }

  if (!goal) {
    return <ErrorBanner message={error || 'Goal not found.'} />;
  }

  if (remaining === 0) {
    return <div className="py-2"><ErrorBanner message={`${goal.name} is already fully funded.`} /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary card */}
      <div className="bg-ledger-s2 border border-ledger-border rounded-[12px] p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ledger-dim mb-2.5">{goal.name}</p>
        <div className="flex justify-between items-end mb-3.5">
          <div>
            <p className="text-[10px] text-ledger-muted mb-1">Remaining</p>
            <p className="font-mono text-[22px] font-medium text-ledger-accent leading-none">₹{remaining.toLocaleString()}</p>
          </div>
          <p className="text-[11px] text-ledger-muted">Saved: ₹{goal.currentAmount.toLocaleString()}</p>
        </div>
        {/* Progress */}
        <div className="h-[5px] rounded-full bg-ledger-faint overflow-hidden relative">
          <div 
            className="absolute inset-y-0 left-0 bg-ledger-accent/25 transition-all duration-500 ease-out" 
            style={{ width: `${afterPct}%` }} 
          />
          <div 
            className="absolute inset-y-0 left-0 bg-ledger-accent transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="text-[10px] text-ledger-dim/60 text-right mt-1.5">{Math.round(afterPct)}% after this add</p>
      </div>

      <InputField 
        label="Amount to Add" 
        placeholder="₹ 0.00" 
        type="number" 
        icon="add_circle" 
        value={amount} 
        onChange={e => { setAmount(e.target.value); setError(""); }}
        hint={`Max: ₹${remaining.toLocaleString()}`} 
      />

      {/* Preset chips */}
      <div className="grid grid-cols-4 gap-2">
        {[0.25, 0.5, 0.75, 1].map((frac, i) => {
          const labels = ["25%", "50%", "75%", "All"];
          return (
            <button 
              key={frac} 
              type="button"
              onClick={() => setPresetAmount(frac)} 
              className={`py-2 rounded-[10px] border text-[11px] font-bold transition-all duration-150 ${frac === 1 ? 'border-ledger-accent/25 bg-ledger-accent/10 text-ledger-accent' : 'border-ledger-border bg-ledger-s2 text-ledger-muted hover:text-ledger-text'}`}
            >
              {labels[i]}
            </button>
          );
        })}
      </div>

      {/* New total */}
      <div className="flex justify-between items-center bg-ledger-s2 border border-ledger-border rounded-[12px] px-4 py-3">
        <span className="text-[11px] text-ledger-muted uppercase tracking-[0.06em]">New total</span>
        <span className="font-mono text-[14px] font-medium text-ledger-text">₹{Math.round(goal.currentAmount + clampedAmount).toLocaleString()}</span>
      </div>

      {error && <ErrorBanner message={error} />}
      <PrimaryButton label={saving ? 'Adding...' : 'Add To Goal'} icon="add_circle" onClick={handleSubmit} disabled={saving} />
    </div>
  );
};

export const AdjustTargetModalContent: React.FC<{ initialAmount?: number }> = ({ initialAmount }) => {
  const match = useMatch('/wishlist/:id');
  const { closeModal } = useModal();
  const id = match?.params.id;
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(String(initialAmount || ''));

  const handleUpdate = async () => {
    if (!id || !amount) return;
    setLoading(true);
    await apiService.updateGoal(id, { targetAmount: Number(amount) });
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField label="New Target Amount" placeholder={`Current: ₹${initialAmount?.toLocaleString()}`} type="number" icon="target" value={amount} onChange={e => setAmount(e.target.value)} />
      <InputField label="Reason for adjustment" placeholder="Optional" icon="notes" value="" onChange={() => {}} />
      <PrimaryButton label={loading ? "Updating..." : "Update Target"} icon="check_circle" onClick={handleUpdate} disabled={loading} />
    </div>
  );
};

type BudgetKind = NonNullable<CategorySpending['kind']>;
const defaultColorByKind: Record<BudgetKind, string> = { spending: 'tertiary', savings: 'green-400', recurring: 'primary' };
const labelByKind: Record<BudgetKind, string> = { spending: 'Spending', savings: 'Savings', recurring: 'Recurring' };

export const NewBudgetTypeModalContent: React.FC<{ kind: BudgetKind }> = ({ kind }) => {
  const { closeModal } = useModal();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('category');
  const [color, setColor] = useState(defaultColorByKind[kind]);
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const colorsByKind = { spending: '#C4903D', savings: '#6DAD85', recurring: '#C46555' };

  const handleCreate = async () => {
    if (!name || !budget) return;
    setSaving(true);
    await apiService.addCategory({
      name: name.trim(),
      icon,
      color,
      budget: Number(budget),
      kind
    });
    closeModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <TypeBadge label={labelByKind[kind]} color={colorsByKind[kind]} />
      <InputField label="Name" placeholder="e.g. Dining, SIP, Rent" value={name} onChange={e => setName(e.target.value)} />
      <IconPicker value={icon} onChange={setIcon} />
      <ColorPicker value={color} onChange={setColor} />
      <InputField label="Budget Limit" placeholder="₹ 0" type="number" icon="payments" value={budget} onChange={e => setBudget(e.target.value)} />
      <PrimaryButton label={saving ? "Creating..." : `Create ${labelByKind[kind]}`} icon="add_circle" onClick={handleCreate} disabled={saving} />
    </div>
  );
};

export const NewRecurringCostModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('subscriptions');
  const [color, setColor] = useState(defaultColorByKind.recurring);
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [interval, setInterval] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [customValue, setCustomValue] = useState('1');
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('months');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name || !amount || !startDate) return;

    const parsedCustomValue = Number(customValue);
    if (interval === 'custom' && (!Number.isFinite(parsedCustomValue) || parsedCustomValue < 1)) {
      setError('Custom interval value must be at least 1.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await apiService.addCategory({
        name: name.trim(),
        icon,
        color,
        budget: Number(amount),
        kind: 'recurring',
        recurringStartDate: startDate,
        recurringInterval: interval,
        recurringCustomValue: interval === 'custom' ? parsedCustomValue : undefined,
        recurringCustomUnit: interval === 'custom' ? customUnit : undefined,
      });
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TypeBadge label="Recurring Bill" color="#C46555" />

      <InputField label="Name" placeholder="e.g. Rent, Internet, EMI" value={name} onChange={e => setName(e.target.value)} />
      <InputField label="Amount" placeholder="₹ 0" type="number" icon="payments" value={amount} onChange={e => setAmount(e.target.value)} />
      <InputField label="Start Date" placeholder="" type="date" icon="calendar_today" value={startDate} onChange={e => setStartDate(e.target.value)} />

      <SelectField label="Repeat Interval" icon="autorenew" value={interval} onChange={v => setInterval(v as any)}>
        <option value="daily" className="bg-[#181614]">Daily</option>
        <option value="weekly" className="bg-[#181614]">Weekly</option>
        <option value="monthly" className="bg-[#181614]">Monthly</option>
        <option value="custom" className="bg-[#181614]">Custom</option>
      </SelectField>

      {interval === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Every" placeholder="1" type="number" icon="pin" value={customValue} onChange={e => setCustomValue(e.target.value)} />
          <SelectField label="Unit" icon="schedule" value={customUnit} onChange={v => setCustomUnit(v as any)}>
            <option value="days" className="bg-[#181614]">Days</option>
            <option value="weeks" className="bg-[#181614]">Weeks</option>
            <option value="months" className="bg-[#181614]">Months</option>
          </SelectField>
        </div>
      )}

      <IconPicker value={icon} onChange={setIcon} />
      <ColorPicker value={color} onChange={setColor} />

      {error && <ErrorBanner message={error} />}

      <PrimaryButton label={saving ? 'Creating...' : 'Create Recurring Cost'} icon="autorenew" onClick={handleCreate} disabled={saving} />
    </div>
  );
};

export const EditTransactionModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const transactionId = sessionStorage.getItem('editTransactionId') || '';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionFormData>(defaultTransactionForm);
  const [typeLabel, setTypeLabel] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    const loadTransaction = async () => {
      if (!transactionId) {
        setError('Transaction id is missing.');
        setLoading(false);
        return;
      }

      try {
        const transaction = await apiService.getTransactionById(transactionId);
        if (!transaction) {
          setError('Transaction not found.');
          return;
        }

        setTypeLabel(transaction.type);
        setForm({
          merchant: transaction.merchant,
          amount: String(transaction.amount),
          date: transaction.date,
        });
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId]);

  const updateField = (field: keyof TransactionFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!transactionId) return;

    const amount = Number(form.amount);

    if (!form.merchant.trim()) {
      setError('Name is required.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (!form.date) {
      setError('Date is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiService.updateTransaction(transactionId, {
        merchant: form.merchant.trim(),
        amount,
        date: form.date,
      });
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-6 text-center text-ledger-dim animate-pulse font-body">Loading transaction details...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <TypeBadge label={typeLabel} color={typeLabel === 'income' ? '#6DAD85' : '#C46555'} />

      <InputField label="Name" placeholder="Merchant or source" icon="storefront" value={form.merchant} onChange={(e) => updateField('merchant', e.target.value)} />
      <InputField label="Amount" placeholder="₹ 0.00" type="number" icon="currency_rupee" value={form.amount} onChange={(e) => updateField('amount', e.target.value)} />
      <InputField label="Date" placeholder="" type="date" icon="calendar_today" value={form.date} onChange={(e) => updateField('date', e.target.value)} hint={formatDateLabel(form.date)} />

      <PrimaryButton label={saving ? 'Saving...' : 'Save Transaction'} icon="check_circle" onClick={handleSave} disabled={saving} />
    </div>
  );
};

export const RecurringCostDetailModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const recurringName = sessionStorage.getItem('selectedRecurringCostName') || '';
  const [item, setItem] = useState<RecurringCostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecurringCost = async () => {
      if (!recurringName) {
        setError('Recurring cost is missing.');
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getRecurringCostByName(recurringName);
        if (!data) {
          setError('Recurring cost not found.');
          return;
        }

        setItem(data);
      } finally {
        setLoading(false);
      }
    };

    loadRecurringCost();
  }, [recurringName]);

  const handleTogglePaid = async () => {
    if (!item) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await apiService.setRecurringCostPaidStatus(item.name, !item.isPaid);
      setItem(updated);
    } catch {
      setError('Failed to update recurring status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-6 text-center text-ledger-dim animate-pulse font-body">Loading recurring cost details...</div>;
  }

  if (!item) {
    return <ErrorBanner message={error || 'Recurring cost not found.'} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <div className="bg-ledger-s2 border border-ledger-border rounded-[12px] p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[9px] text-ledger-dim uppercase tracking-[0.16em] mb-1.5 ml-0.5">Recurring Cost</p>
            <p className="text-[17px] font-bold text-ledger-text ml-0.5">{item.name}</p>
          </div>
          <span 
            className={`text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-full border bg-opacity-10 transition-all ${item.isPaid ? 'bg-ledger-income border-ledger-income/25 text-ledger-income' : 'bg-ledger-expense border-ledger-expense/25 text-ledger-expense'}`}
          >
            {item.isPaid ? 'Paid' : 'Pending'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-ledger-s1 rounded-[10px] p-3 border border-ledger-border/50">
            <p className="text-[9px] text-ledger-dim uppercase tracking-[0.12em] mb-1.5">Amount</p>
            <p className="text-[13.5px] font-semibold text-ledger-text font-mono">₹{item.amount.toLocaleString()}</p>
          </div>
          <div className="bg-ledger-s1 rounded-[10px] p-3 border border-ledger-border/50">
            <p className="text-[9px] text-ledger-dim uppercase tracking-[0.12em] mb-1.5">Next Pay Cycle</p>
            <p className="text-[13.5px] font-semibold text-ledger-text">{item.nextPayCycle}</p>
          </div>
        </div>
        
        <div className="bg-ledger-s1 rounded-[10px] p-3 border border-ledger-border/50">
          <p className="text-[9px] text-ledger-dim uppercase tracking-[0.12em] mb-1.5">Payment State</p>
          <p className="text-[12.5px] text-ledger-muted leading-relaxed">
            {item.isPaid ? `Marked paid on ${item.paidOn}.` : 'Not paid for current cycle.'}
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-col gap-3">
        <PrimaryButton
          label={saving ? 'Updating...' : item.isPaid ? 'Mark As Not Paid' : 'Mark As Paid'}
          icon={item.isPaid ? 'undo' : 'check_circle'}
          onClick={handleTogglePaid}
          disabled={saving}
        />
        <GhostButton label="Close" onClick={closeModal} />
      </div>
    </div>
  );
};
