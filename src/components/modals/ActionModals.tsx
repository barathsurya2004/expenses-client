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

const InputField: React.FC<{
  label: string;
  placeholder: string;
  type?: string;
  icon?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, placeholder, type = 'text', icon, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">{label}</label>
    <div className="relative group">
      {icon && (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-surface-container-low border border-outline-variant/15 rounded-xl ${icon ? 'pl-11' : 'px-4'} pr-4 py-3 text-[14px] font-medium text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all`}
      />
    </div>
  </div>
);

const PrimaryButton: React.FC<{ label: string; icon: string; onClick?: () => void; disabled?: boolean }> = ({ label, icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full py-3.5 mt-2 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-[13px] font-black uppercase tracking-wider shadow-lg shadow-primary/10 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {label}
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
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
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">{label}</label>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">
          category
        </span>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-surface-container-low border border-outline-variant/15 rounded-xl pl-11 pr-4 py-3 text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all"
        >
          <option value="" disabled>Select Category</option>
          {categories.map(cat => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const iconOptions = [
  'category', 'restaurant', 'directions_car', 'home', 'flight', 'savings',
  'medical_services', 'shopping_bag', 'account_balance_wallet', 'subscriptions',
  'payments', 'work', 'laptop_mac', 'watch', 'school', 'pets', 'bolt', 'movie',
  'sports_esports', 'local_cafe', 'fitness_center', 'flag'
] as const;

const colorOptions = ['primary', 'secondary', 'tertiary', 'tertiary-container', 'error', 'blue-400', 'green-400'] as const;

const colorDotClass: Record<typeof colorOptions[number], string> = {
  'primary': 'bg-primary',
  'secondary': 'bg-secondary',
  'tertiary': 'bg-tertiary',
  'tertiary-container': 'bg-tertiary-container',
  'error': 'bg-error',
  'blue-400': 'bg-blue-400',
  'green-400': 'bg-green-400'
};

const IconPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">Icon</label>
    <div className="grid grid-cols-6 gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-2">
      {iconOptions.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`h-9 rounded-lg border transition-colors flex items-center justify-center ${value === option ? 'border-primary bg-primary/15 text-primary' : 'border-outline-variant/15 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          <span className="material-symbols-outlined text-[18px]">{option}</span>
        </button>
      ))}
    </div>
  </div>
);

const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">Color</label>
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-2 sm:grid-cols-4">
      {colorOptions.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`flex h-8 items-center gap-2 rounded-lg border px-2 text-[10px] font-bold uppercase transition-colors ${value === option ? 'border-primary bg-primary/15 text-on-surface' : 'border-outline-variant/15 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${colorDotClass[option]}`} />
          <span className="truncate">{option.split('-')[0]}</span>
        </button>
      ))}
    </div>
  </div>
);

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
    <div className="space-y-4">
      <InputField label="Amount" placeholder="₹0.00" type="number" icon="currency_rupee" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
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
    <div className="space-y-4">
      <InputField label="Amount" placeholder="₹0.00" type="number" icon="currency_rupee" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <InputField label="Merchant" placeholder="Where did you spend?" icon="storefront" value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} />
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
    <div className="space-y-4">
      <InputField label="Amount" placeholder="₹0.00" type="number" icon="payments" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
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
    <div className="space-y-4">
      <InputField label="Amount" placeholder="₹0.00" type="number" icon="swap_horiz" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="From" placeholder="Source" icon="account_balance_wallet" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} />
        <InputField label="To" placeholder="Destination" icon="savings" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
      </div>
      <InputField label="Note" placeholder="What's this for?" icon="notes" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
      <PrimaryButton label={loading ? "Transferring..." : "Transfer Funds"} icon="sync_alt" onClick={handleTransfer} disabled={loading} />
    </div>
  );
};

export const AddGoalModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', desc: '' });

  const handleAdd = async () => {
    if (!form.name || !form.target) return;
    setLoading(true);
    await apiService.addGoal({
      name: form.name,
      targetAmount: Number(form.target),
      currentAmount: 0,
      category: 'Savings',
      description: form.desc,
      icon: 'flag',
      color: 'primary'
    });
    closeModal();
  };

  return (
    <div className="space-y-4">
      <InputField label="Goal Name" placeholder="Dream Car, New House..." icon="flag" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <InputField label="Target Amount" placeholder="₹0.00" type="number" icon="target" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
      <InputField label="Description" placeholder="Why are you saving for this?" icon="description" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
      <PrimaryButton label={loading ? "Creating..." : "Create Goal"} icon="add_circle" onClick={handleAdd} disabled={loading} />
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
    return <div className="py-6 text-center text-on-surface-variant">Loading goal details...</div>;
  }

  if (error && !form.name) {
    return <p className="text-sm text-error">{error}</p>;
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Name</label>
          <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Target Amount</label>
          <input type="number" min="0" value={form.targetAmount} onChange={(e) => updateField('targetAmount', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Current Amount</label>
          <input type="number" min="0" value={form.currentAmount} onChange={(e) => updateField('currentAmount', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Category</label>
          <input type="text" value={form.category} onChange={(e) => updateField('category', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Priority</label>
          <select value={form.priority} onChange={(e) => updateField('priority', e.target.value as GoalFormData['priority'])} className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Image URL</label>
          <input type="url" value={form.image} onChange={(e) => updateField('image', e.target.value)} placeholder="https://..." className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
        </div>
        <div className="space-y-2">
          <IconPicker value={form.icon} onChange={(value) => updateField('icon', value)} />
        </div>
        <div className="space-y-2">
          <ColorPicker value={form.color} onChange={(value) => updateField('color', value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">ETA</label>
          <input type="text" value={form.eta} onChange={(e) => updateField('eta', e.target.value)} placeholder="2 months" className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Description</label>
          <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={4} className="w-full resize-y bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all" />
        </div>
      </div>

      <PrimaryButton label={saving ? 'Saving...' : 'Save Goal Changes'} icon="check_circle" onClick={handleSave} disabled={saving} />
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
  const parsedAmount = Number(amount);
  const clampedAmount = Number.isFinite(parsedAmount) ? Math.min(Math.max(parsedAmount, 0), remaining) : 0;

  const setPresetAmount = (value: number) => {
    setAmount(String(Math.round(value)));
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
    return <div className="py-6 text-center text-on-surface-variant">Loading goal details...</div>;
  }

  if (!goal) {
    return <p className="text-sm text-error">{error || 'Goal not found.'}</p>;
  }

  if (remaining === 0) {
    return <p className="text-sm text-on-surface">{goal.name} is already fully funded.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{goal.name}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">Remaining Amount</p>
            <p className="text-xl font-black text-primary">₹{remaining.toLocaleString()}</p>
          </div>
          <p className="text-[11px] text-on-surface-variant">Saved: ₹{goal.currentAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Amount to Add</label>
        <input
          type="number"
          min="1"
          max={remaining}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
        />
        <p className="text-[10px] text-on-surface-variant ml-1">Maximum allowed: ₹{remaining.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button type="button" onClick={() => setPresetAmount(remaining * 0.25)} className="rounded-xl bg-surface-container-low px-2 py-2 text-[11px] font-bold text-on-surface hover:bg-surface-container-high transition-colors">25%</button>
        <button type="button" onClick={() => setPresetAmount(remaining * 0.5)} className="rounded-xl bg-surface-container-low px-2 py-2 text-[11px] font-bold text-on-surface hover:bg-surface-container-high transition-colors">50%</button>
        <button type="button" onClick={() => setPresetAmount(remaining * 0.75)} className="rounded-xl bg-surface-container-low px-2 py-2 text-[11px] font-bold text-on-surface hover:bg-surface-container-high transition-colors">75%</button>
        <button type="button" onClick={() => setPresetAmount(remaining)} className="rounded-xl bg-primary/15 px-2 py-2 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors">All</button>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">After this add</span>
        <span className="text-sm font-black text-on-surface">₹{Math.round(goal.currentAmount + clampedAmount).toLocaleString()}</span>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

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
    <div className="space-y-4">
      <InputField label="New Target Amount" placeholder={`Current: ₹${initialAmount?.toLocaleString()}`} type="number" icon="target" value={amount} onChange={e => setAmount(e.target.value)} />
      <InputField label="Reason for adjustment" placeholder="Optional" icon="notes" />
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
    <div className="space-y-4">
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
        <p className="text-[9px] uppercase tracking-widest font-black text-on-surface-variant">Type Selected</p>
        <p className="text-[13px] font-black text-primary mt-1">{labelByKind[kind]}</p>
      </div>
      <InputField label="Name" placeholder="e.g. Dining, SIP, Rent" value={name} onChange={e => setName(e.target.value)} />
      <IconPicker value={icon} onChange={setIcon} />
      <ColorPicker value={color} onChange={setColor} />
      <InputField label="Limit" placeholder="₹0" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
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
    <div className="space-y-4">
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
        <p className="text-[9px] uppercase tracking-widest font-black text-on-surface-variant">Type Selected</p>
        <p className="text-[13px] font-black text-primary mt-1">Recurring bill</p>
      </div>

      <InputField label="Name" placeholder="e.g. Rent, Internet, EMI" value={name} onChange={e => setName(e.target.value)} />
      <InputField label="Amount" placeholder="₹0" type="number" icon="payments" value={amount} onChange={e => setAmount(e.target.value)} />
      <InputField label="Start Date" placeholder="" type="date" icon="calendar_today" value={startDate} onChange={e => setStartDate(e.target.value)} />

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">Repeat Interval</label>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">
            autorenew
          </span>
          <select
            value={interval}
            onChange={e => setInterval(e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom')}
            className="w-full appearance-none bg-surface-container-low border border-outline-variant/15 rounded-xl pl-11 pr-4 py-3 text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {interval === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Every" placeholder="1" type="number" icon="pin" value={customValue} onChange={e => setCustomValue(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">Unit</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">
                schedule
              </span>
              <select
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value as 'days' | 'weeks' | 'months')}
                className="w-full appearance-none bg-surface-container-low border border-outline-variant/15 rounded-xl pl-11 pr-4 py-3 text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <IconPicker value={icon} onChange={setIcon} />
      <ColorPicker value={color} onChange={setColor} />

      {error && <p className="text-sm text-error">{error}</p>}

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
    return <div className="py-6 text-center text-on-surface-variant">Loading transaction details...</div>;
  }

  if (error && !form.merchant) {
    return <p className="text-sm text-error">{error}</p>;
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Transaction Type</p>
        <p className="text-[13px] font-black text-primary mt-1 uppercase">{typeLabel}</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">Name</label>
        <input
          type="text"
          value={form.merchant}
          onChange={(e) => updateField('merchant', e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">Amount</label>
        <input
          type="number"
          min="0"
          value={form.amount}
          onChange={(e) => updateField('amount', e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-1.5 opacity-70">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => updateField('date', e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all"
        />
        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{formatDateLabel(form.date)}</p>
      </div>

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
    return <div className="py-6 text-center text-on-surface-variant">Loading recurring cost details...</div>;
  }

  if (!item) {
    return <p className="text-sm text-error">{error || 'Recurring cost not found.'}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Recurring Cost</p>
            <p className="text-lg font-black text-on-surface mt-1">{item.name}</p>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${item.isPaid ? 'bg-green-500/15 text-green-400' : 'bg-error/15 text-error'}`}>
            {item.isPaid ? 'Paid' : 'Pending'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-container-highest p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Amount</p>
            <p className="text-base font-bold text-on-surface mt-1">₹{item.amount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-surface-container-highest p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Next Pay Cycle</p>
            <p className="text-base font-bold text-on-surface mt-1">{item.nextPayCycle}</p>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-highest p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Payment State</p>
          <p className="text-sm font-semibold text-on-surface mt-1">
            {item.isPaid
              ? `Marked paid${item.paidOn ? ` on ${item.paidOn}` : ''}.`
              : 'Not paid for current cycle.'}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <PrimaryButton
        label={saving ? 'Updating...' : item.isPaid ? 'Mark As Not Paid' : 'Mark As Paid'}
        icon={item.isPaid ? 'undo' : 'check_circle'}
        onClick={handleTogglePaid}
        disabled={saving}
      />

      <button
        type="button"
        onClick={closeModal}
        className="w-full py-3 rounded-full bg-surface-container-low text-on-surface text-[12px] font-bold hover:bg-surface-container-high transition-colors"
      >
        Close
      </button>
    </div>
  );
};
