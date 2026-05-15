import React, { useState, useEffect } from 'react';
import type { Transaction, WishlistItem, BudgetCategory } from '../types';
import { LucideIcon } from './LucideIcon';
import { Card, Segmented, BottomSheet, PrimaryButton, CategoryTile, CATEGORY_ICON_CHOICES, CATEGORY_COLOR_CHOICES } from './Common';
import { fmtINR, currencySymbol, CATEGORY_LIST, PRIORITY_COLORS } from '../data';
import { RESOURCES } from '../resources';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function ModalRow({ label, children, stack }: { label: string, children: React.ReactNode, stack?: boolean }) {
  return (
    <div style={{
      padding: '14px 18px',
      display: 'flex',
      flexDirection: stack ? 'column' : 'row',
      alignItems: stack ? 'flex-start' : 'center',
      gap: stack ? 8 : 12, minHeight: 52,
    }}>
      <div style={{
        fontSize: 15, color: 'var(--ink-2)', fontWeight: 500,
        flexShrink: 0, minWidth: stack ? 0 : 110,
      }}>{label}</div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', width: stack ? '100%' : 'auto' }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 0.5, background: 'var(--divider)', marginLeft: 18 }} />;
}

const selectStyle: React.CSSProperties = {
  border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'inherit', fontSize: 16, fontWeight: 500, color: 'var(--ink)',
  textAlign: 'right', appearance: 'none', cursor: 'pointer',
  paddingRight: 16,
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' viewBox=\'0 0 10 6\'%3E%3Cpath fill=\'%238C857A\' d=\'M1 1l4 4 4-4\' stroke=\'%238C857A\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right center',
};

const inputStyle: React.CSSProperties = {
  border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'inherit', fontSize: 16, fontWeight: 500, color: 'var(--ink)',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

function RupeeInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ color: 'var(--ink-3)', fontSize: 16 }}>{currencySymbol()}</span>
      <input type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)}
             placeholder="0"
             style={{ ...inputStyle, width: 130 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AddTransactionModal
// ─────────────────────────────────────────────────────────────
interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ open, onClose, onSave }) => {
  const [type, setType] = useState<'expense' | 'income' | 'recurring'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Dining');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'weekly' | 'daily'>('monthly');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (open) {
      setType('expense'); setAmount(''); setCategory('Dining'); setMerchant(''); setNotes('');
      setFrequency('monthly'); setPaid(false);
    }
  }, [open]);

  const incomeCats = ['Salary', 'Other Income'];
  const expenseCats = CATEGORY_LIST.filter(c => c !== 'Salary');
  const recurringCats = CATEGORY_LIST.filter(c => c !== 'Salary'); // Could refine this list
  const cats = type === 'income' ? incomeCats : (type === 'recurring' ? recurringCats : expenseCats);

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    
    if (type === 'recurring') {
      onSave({
        id: 'c_' + Math.random().toString(36).slice(2, 8),
        name: merchant || category,
        limit: n,
        spent: paid ? n : 0,
        icon: 'repeat',
        color: 'plum',
        frequency,
        paid,
        due: 'Soon',
        type: 'recurring',
        notes: notes.trim()
      });
    } else {
      onSave({
        id: 't_' + Math.random().toString(36).slice(2, 8),
        amount: n,
        category: type === 'income' ? (incomeCats.includes(category) ? category : 'Salary') : category,
        merchant: merchant || (type === 'income' ? 'Income' : 'Quick add'),
        date: new Date().toISOString(),
        type,
        status: 'pending',
        tags: notes ? [notes.toLowerCase().split(' ')[0]] : [],
      });
    }
    onClose();
  };

  return (
    <BottomSheet
      open={open} onClose={onClose} title="Add Entry"
      footer={<PrimaryButton variant="copper" onClick={submit} disabled={!amount} icon="check">
        {type === 'recurring' ? 'Add to Budget' : 'Add to Ledger'}
      </PrimaryButton>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Segmented
          fullWidth
          value={type}
          onChange={(v) => {
            const nextType = v as 'expense' | 'income' | 'recurring';
            setType(nextType);
            if (nextType === 'recurring' && category === 'Dining') setCategory('Subscriptions');
          }}
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
            { value: 'recurring', label: 'Recurring' }
          ]}
        />

        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8,
          }}>Amount</div>
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 6,
            color: type === 'income' ? 'var(--green)' : (type === 'recurring' ? 'var(--plum)' : 'var(--ink)'),
          }}>
            <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.5 }}>{(type === 'income' ? '+' : '') + currencySymbol()}</span>
            <input
              type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0" autoFocus
              style={{
                width: 220, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'inherit', fontSize: 64, fontWeight: 600, letterSpacing: -2,
                color: 'inherit', textAlign: 'left',
                fontVariantNumeric: 'tabular-nums',
              }}
            />
          </div>
        </div>

        <Card padding={0} style={{ overflow: 'hidden' }}>
          <ModalRow label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </ModalRow>
          <Divider />
          <ModalRow label={type === 'recurring' ? 'Name' : 'Merchant'}>
            <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder={type === 'recurring' ? 'e.g. Rent, Netflix' : 'Where?'} style={inputStyle} />
          </ModalRow>
          
          {type === 'recurring' && (
            <>
              <Divider />
              <ModalRow label="Frequency">
                <select value={frequency} onChange={e => setFrequency(e.target.value as any)} style={selectStyle}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </ModalRow>
              <Divider />
              <ModalRow label="Paid Status">
                <div style={{ display: 'flex', gap: 6 }}>
                  <div 
                    onClick={() => setPaid(false)}
                    className="press"
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      fontSize: 13, fontWeight: 700,
                      background: !paid ? 'var(--clay-tint)' : 'var(--surface-3)',
                      color: !paid ? 'var(--clay)' : 'var(--ink-4)',
                    }}
                  >Unpaid</div>
                  <div 
                    onClick={() => setPaid(true)}
                    className="press"
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      fontSize: 13, fontWeight: 700,
                      background: paid ? 'var(--green-tint)' : 'var(--surface-3)',
                      color: paid ? 'var(--green)' : 'var(--ink-4)',
                    }}
                  >Paid</div>
                </div>
              </ModalRow>
            </>
          )}

          {type !== 'recurring' && (
            <>
              <Divider />
              <ModalRow label="Date">
                <div style={{ color: 'var(--ink-2)', fontSize: 16 }}>Today, May 14</div>
              </ModalRow>
            </>
          )}
        </Card>

        <Card padding={0}>
          <ModalRow label="Notes" stack>
            <input value={notes} onChange={e => setNotes(e.target.value)}
                   placeholder="Optional notes..."
                   style={{ ...inputStyle, width: '100%', textAlign: 'left' }} />
          </ModalRow>
        </Card>
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// AddWishlistModal
// ─────────────────────────────────────────────────────────────
interface AddWishlistModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (wish: WishlistItem) => void;
  editing: WishlistItem | null;
}

export const AddWishlistModal: React.FC<AddWishlistModalProps> = ({ open, onClose, onSave, editing }) => {
  const [step, setStep] = useState<'choose' | 'url' | 'form'>('choose');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [saved, setSaved] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setStep('form');
        setName(editing.name || '');
        setBrand(editing.brand || '');
        setCategory(editing.category || '');
        setPrice(String(editing.price || ''));
        setSaved(String(editing.saved || ''));
        setUrl(editing.url || '');
        setImage(editing.image || '');
        setNotes(editing.notes || '');
        setPriority(editing.priority || 'medium');
      } else {
        setStep('choose');
        setName(''); setBrand(''); setCategory(''); setPrice(''); setSaved('');
        setUrl(''); setImage(''); setNotes(''); setPriority('medium');
        setCrawlUrl(''); setCrawling(false); setCrawlError('');
      }
    }
  }, [open, editing]);

  const submit = () => {
    const p = parseFloat(price);
    if (!name || !p) return;
    onSave({
      id: editing?.id || 'w_' + Math.random().toString(36).slice(2, 8),
      name,
      brand: brand || '',
      category: category || '',
      url: url || '',
      image: image || '',
      notes: notes || '',
      price: p,
      saved: parseFloat(saved) || 0,
      priority,
      allocation: editing?.allocation ?? (priority === 'high' ? 3000 : priority === 'medium' ? 1500 : 800),
      emoji: '🎁', // default emoji if needed
    });
    onClose();
  };

  const runCrawl = async () => {
    const u = crawlUrl.trim();
    if (!u) return;
    setCrawling(true);
    setCrawlError('');
    try {
      const result = await crawlProductUrl(u);
      setName(result.name);
      setBrand(result.brand || '');
      setCategory(result.category || '');
      setPrice(String(result.price));
      setUrl(u);
      setImage(result.image || '');
      setNotes(result.notes || '');
      setPriority(result.priority as 'high' | 'medium' | 'low' || 'medium');
      setStep('form');
    } catch (e: any) {
      setCrawlError(e.message || 'Could not parse that link.');
    } finally {
      setCrawling(false);
    }
  };

  const title = editing
    ? 'Edit Wishlist Item'
    : step === 'choose' ? 'Add to Wishlist'
    : step === 'url'    ? 'Paste a link'
                        : 'Review details';

  const footer = step === 'form'
    ? <PrimaryButton variant="copper" onClick={submit} disabled={!name || !price}
        icon={editing ? 'check' : 'plus'}>
        {editing ? 'Save Changes' : 'Add to Wishlist'}
      </PrimaryButton>
    : step === 'url'
      ? <PrimaryButton variant="copper" onClick={runCrawl}
          disabled={!crawlUrl.trim() || crawling} icon="sparkles">
          {crawling ? 'Fetching…' : 'Auto-fill from link'}
        </PrimaryButton>
      : null;

  return (
    <BottomSheet open={open} onClose={onClose} title={title} footer={footer}>
      {step === 'choose' && !editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <div onClick={() => setStep('url')} className="press" style={chooseCardStyle('var(--copper-tint)', 'var(--copper)')}>
            <div style={chooseIconStyle('var(--copper-tint)', 'var(--copper)')}>
              <LucideIcon name="link" size={22} stroke={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.2 }}>Paste a product link</div>
                <div style={badgeStyle('var(--copper-tint)', 'var(--copper)')}>Fast</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>We'll fetch the name, price, image, and brand from the page automatically.</div>
            </div>
            <LucideIcon name="chevron-right" size={18} style={{ color: 'var(--ink-4)', marginTop: 12 }} />
          </div>
          <div onClick={() => setStep('form')} className="press" style={chooseCardStyle('var(--blue-tint)', 'var(--blue)')}>
            <div style={chooseIconStyle('var(--blue-tint)', 'var(--blue)')}>
              <LucideIcon name="pencil" size={22} stroke={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.2 }}>Enter manually</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>Type the details yourself — useful for trips, experiences, or things without a link.</div>
            </div>
            <LucideIcon name="chevron-right" size={18} style={{ color: 'var(--ink-4)', marginTop: 12 }} />
          </div>
        </div>
      )}

      {step === 'url' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <BackChevron onClick={() => setStep('choose')} label="Back" />
          <Card padding={0}>
            <ModalRow label="URL" stack>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <LucideIcon name="link" size={18} style={{ color: 'var(--ink-3)' }} />
                <input value={crawlUrl} onChange={e => setCrawlUrl(e.target.value)}
                       placeholder="https://sony.com/wh-1000xm6"
                       autoFocus
                       style={{ ...inputStyle, flex: 1, textAlign: 'left', fontSize: 15 }} />
              </div>
            </ModalRow>
          </Card>
          {crawling ? <CrawlSkeleton /> : crawlError ? <div style={errorStyle}>{crawlError}</div> : null}
          <div onClick={() => setStep('form')} className="press" style={{ textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600, color: 'var(--ink-3)' }}>Skip and enter manually</div>
        </div>
      )}

      {step === 'form' && (
        <WishlistFormBody
          name={name} setName={setName}
          brand={brand} setBrand={setBrand}
          category={category} setCategory={setCategory}
          price={price} setPrice={setPrice}
          saved={saved} setSaved={setSaved}
          url={url} setUrl={setUrl}
          image={image} setImage={setImage}
          notes={notes} setNotes={setNotes}
          priority={priority} setPriority={setPriority}
          showBack={!editing}
          onBack={() => setStep('choose')}
        />
      )}
    </BottomSheet>
  );
}

const chooseCardStyle = (_tint: string, _fg: string): React.CSSProperties => ({
  padding: 18, borderRadius: 18,
  background: 'var(--surface)', boxShadow: 'var(--shadow-card)',
  display: 'flex', alignItems: 'flex-start', gap: 14,
  position: 'relative', overflow: 'hidden',
});

const chooseIconStyle = (tint: string, fg: string): React.CSSProperties => ({
  width: 44, height: 44, borderRadius: 12, background: tint, color: fg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const badgeStyle = (tint: string, fg: string): React.CSSProperties => ({
  padding: '2px 7px', borderRadius: 5, background: tint, color: fg,
  fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
});

const errorStyle: React.CSSProperties = {
  padding: '14px 16px', borderRadius: 14, background: 'var(--clay-tint)',
  color: 'var(--clay)', fontSize: 13, fontWeight: 500,
  display: 'flex', gap: 10, alignItems: 'flex-start',
};

function BackChevron({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <div onClick={onClick} className="press" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
      padding: '4px 8px 4px 4px', alignSelf: 'flex-start',
      marginLeft: -4,
    }}>
      <LucideIcon name="chevron-left" size={16} stroke={2} />
      {label}
    </div>
  );
}

function CrawlSkeleton() {
  return (
    <div style={{
      padding: 14, borderRadius: 16, background: 'var(--surface)',
      boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--copper)', letterSpacing: 0.3, textTransform: 'uppercase' }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, border: '2px solid var(--copper-tint)', borderTopColor: 'var(--copper)', animation: 'spin360 0.9s linear infinite' }} />
        Fetching product details
      </div>
      <div style={{ width: '80%', height: 18, borderRadius: 6, background: 'var(--surface-3)', animation: 'shimmerSlide 1.4s linear infinite' }} />
      <div style={{ width: '100%', height: 120, borderRadius: 12, background: 'var(--surface-3)', animation: 'shimmerSlide 1.4s linear infinite' }} />
    </div>
  );
}

function WishlistFormBody({ name, setName, brand, setBrand, category, setCategory, price, setPrice, saved, setSaved, url, setUrl, image, setImage, notes, setNotes, priority, setPriority, showBack, onBack }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {showBack && <BackChevron onClick={onBack} label="Back" />}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ width: '100%', aspectRatio: '16 / 9', background: 'var(--surface-3)', position: 'relative' }}>
          {image ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-4)' }}><LucideIcon name="image" size={28} stroke={1.6} /></div>}
        </div>
        <div style={{ padding: '12px 14px', borderTop: '0.5px solid var(--divider)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>Image URL</div>
          <input value={image} onChange={e => setImage(e.target.value)} placeholder="Paste an image link (optional)" style={{ ...inputStyle, width: '100%', textAlign: 'left', fontSize: 14 }} />
        </div>
      </div>
      <Card padding={0}>
        <ModalRow label="Item name" stack><input value={name} onChange={e => setName(e.target.value)} placeholder="Sony WH-1000XM6" style={{ ...inputStyle, width: '100%', textAlign: 'left' }} /></ModalRow>
        <Divider /><ModalRow label="Brand"><input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Sony" style={inputStyle} /></ModalRow>
        <Divider /><ModalRow label="Category"><input value={category} onChange={e => setCategory(e.target.value)} placeholder="Audio, Travel…" style={inputStyle} /></ModalRow>
        <Divider /><ModalRow label="Source URL"><input value={url} onChange={e => setUrl(e.target.value)} placeholder="sony.com" style={inputStyle} /></ModalRow>
      </Card>
      <Card padding={0}>
        <ModalRow label="Target Price"><RupeeInput value={price} onChange={setPrice} /></ModalRow>
        <Divider /><ModalRow label="Already Saved"><RupeeInput value={saved} onChange={setSaved} /></ModalRow>
      </Card>
      <Card padding={0}><ModalRow label="Notes" stack><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why you want it…" rows={3} style={{ ...inputStyle, width: '100%', textAlign: 'left', resize: 'none', minHeight: 64 }} /></ModalRow></Card>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px' }}>Priority</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['high', 'medium', 'low'] as const).map(p => {
            const active = priority === p;
            const c = PRIORITY_COLORS[p];
            return (
              <div key={p} onClick={() => setPriority(p)} className="press" style={{
                flex: 1, padding: '14px 8px', borderRadius: 14, background: active ? c.bg : 'var(--surface)', color: active ? c.fg : 'var(--ink-2)', outline: active ? `1.5px solid ${c.fg}` : 'none', textAlign: 'center', fontSize: 14, fontWeight: 600, textTransform: 'capitalize', boxShadow: active ? 'none' : 'var(--shadow-card)',
              }}>{p}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

async function crawlProductUrl(url: string) {
  await new Promise(r => setTimeout(r, 1400));
  const u = url.toLowerCase();
  if (u.includes('sony')) return { name: 'Sony WH-1000XM6', brand: 'Sony', category: 'Audio', price: 34990, priority: 'high', image: RESOURCES.imgSony, notes: 'Great headphones.' };
  return { name: 'New Item', brand: '', category: 'Other', price: 0, priority: 'medium', image: '', notes: '' };
}

// ─────────────────────────────────────────────────────────────
// EditCategoryModal
// ─────────────────────────────────────────────────────────────
interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: BudgetCategory | null;
  onSave: (cat: BudgetCategory, tier: string, mode: 'edit' | 'new') => void;
  currentTier: string;
  mode?: 'edit' | 'new';
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ open, onClose, category, onSave, currentTier, mode = 'edit' }) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [tier, setTier] = useState('wants');
  const [frequency, setFrequency] = useState('monthly');
  const [customCount, setCustomCount] = useState('2');
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [due, setDue] = useState('');
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState('plum');

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && category) {
        setName(category.name);
        setLimit(String(category.limit));
        setTier(currentTier);
        setFrequency(category.frequency || 'monthly');
        setCustomCount(String(category.customCount || 2));
        setCustomUnit(category.customUnit || 'weeks');
        setDue(category.due || '');
        setIcon(category.icon || 'tag');
        setColor(category.color || 'plum');
      } else {
        setName(''); setLimit(''); setTier(currentTier || 'wants');
        setFrequency('monthly'); setCustomCount('2'); setCustomUnit('weeks'); setDue('');
        setIcon(currentTier === 'needs' ? 'receipt' : 'tag');
        setColor(currentTier === 'needs' ? 'blue' : 'plum');
      }
    }
  }, [open, category, currentTier, mode]);

  useEffect(() => {
    if (mode === 'new') {
      setIcon(tier === 'needs' ? 'receipt' : 'tag');
      setColor(tier === 'needs' ? 'blue' : 'plum');
    }
  }, [tier, mode]);

  if (mode === 'edit' && !category) return null;

  const isFixed = tier === 'needs';

  const submit = () => {
    if (mode === 'new' && !name.trim()) return;
    const newId = mode === 'edit' ? category!.id : 'c_' + Math.random().toString(36).slice(2, 8);
    const out: BudgetCategory = {
      id: newId,
      name: mode === 'edit' ? category!.name : name.trim(),
      limit: parseFloat(limit) || 0,
      spent: mode === 'edit' ? category!.spent : 0,
      icon,
      color,
    };
    if (isFixed) {
      out.frequency = frequency as any;
      if (frequency === 'custom') {
        out.customCount = parseInt(customCount) || 1;
        out.customUnit = customUnit;
      }
      out.paid = mode === 'edit' ? (category!.paid ?? false) : false;
      if (due) out.due = due;
    }
    onSave(out, tier, mode);
    onClose();
  };

  return (
    <BottomSheet
      open={open} onClose={onClose}
      title={mode === 'new' ? 'New Category' : 'Edit ' + (category?.name || '')}
      footer={<PrimaryButton variant="copper" onClick={submit} icon="check"
        disabled={mode === 'new' && !name.trim()}>{mode === 'new' ? 'Add Category' : 'Save'}</PrimaryButton>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {mode === 'new' && (
          <Card padding={0}>
            <ModalRow label="Name" stack>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
                <CategoryTile name={name} icon={icon} color={color} size={40} />
                <input value={name} onChange={e => setName(e.target.value)}
                       placeholder={isFixed ? 'Internet, Spotify…' : 'Snacks, Books…'}
                       autoFocus
                       style={{ ...inputStyle, flex: 1, textAlign: 'left' }} />
              </div>
            </ModalRow>
          </Card>
        )}

        {/* Icon picker */}
        <IconColorPicker icon={icon} setIcon={setIcon} color={color} setColor={setColor} />

        <Card padding={0}>
          <ModalRow label={isFixed ? 'Amount' : 'Monthly Limit'}>
            <RupeeInput value={limit} onChange={setLimit} />
          </ModalRow>
          {isFixed && (
            <>
              <Divider />
              <ModalRow label="Due date">
                <input value={due} onChange={e => setDue(e.target.value)}
                       placeholder="May 28"
                       style={inputStyle} />
              </ModalRow>
            </>
          )}
        </Card>

        {/* Frequency picker — fixed/recurring only */}
        {isFixed && (
          <div>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
              letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px',
            }}>Repeats</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'custom', label: 'Custom' },
              ].map(f => {
                const active = frequency === f.value;
                return (
                  <div key={f.value} onClick={() => setFrequency(f.value)} className="press" style={{
                    padding: '12px 4px', borderRadius: 12,
                    background: active ? 'var(--copper-tint)' : 'var(--surface)',
                    color: active ? 'var(--copper)' : 'var(--ink-2)',
                    outline: active ? '1.5px solid var(--copper)' : 'none',
                    boxShadow: active ? 'none' : 'var(--shadow-card)',
                    textAlign: 'center', fontSize: 13, fontWeight: 600,
                  }}>{f.label}</div>
                );
              })}
            </div>

            {frequency === 'custom' && (
              <Card padding={0} style={{ marginTop: 10 }}>
                <div style={{
                  padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ fontSize: 15, color: 'var(--ink-2)', fontWeight: 500, flex: 1 }}>
                    Every
                  </div>
                  <input type="number" inputMode="numeric" min={1}
                         value={customCount} onChange={e => setCustomCount(e.target.value)}
                         style={{ ...inputStyle, width: 60, textAlign: 'center',
                           padding: '6px 8px', borderRadius: 8, background: 'var(--surface-3)' }} />
                  <select value={customUnit} onChange={e => setCustomUnit(e.target.value as any)}
                          style={{ ...selectStyle, paddingRight: 18, paddingLeft: 10 }}>
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
              </Card>
            )}
          </div>
        )}

        <div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px',
          }}>Tier Assignment</div>
          <Segmented
            fullWidth value={tier} onChange={setTier}
            options={[
              { value: 'needs', label: 'Fixed' },
              { value: 'wants', label: 'Wants' },
              { value: 'savings', label: 'Savings' },
            ]}
          />
        </div>
      </div>
    </BottomSheet>
  );
}

function IconColorPicker({ icon, setIcon, color, setColor }: any) {
  const colorMap: any = { green: ['var(--green)', 'var(--green-tint)'], blue: ['var(--blue)', 'var(--blue-tint)'], amber: ['var(--amber)', 'var(--amber-tint)'], copper: ['var(--copper)', 'var(--copper-tint)'], plum: ['var(--plum)', 'var(--plum-tint)'], clay: ['var(--clay)', 'var(--clay-tint)'] };
  const [fg, bg] = colorMap[color] || colorMap.plum;
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px' }}>Icon</div>
      <Card padding={14}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {CATEGORY_ICON_CHOICES.map(ic => {
            const active = ic === icon;
            return <div key={ic} onClick={() => setIcon(ic)} className="press" style={{ aspectRatio: '1 / 1', borderRadius: 12, background: active ? bg : 'var(--surface-3)', color: active ? fg : 'var(--ink-3)', outline: active ? `1.5px solid ${fg}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LucideIcon name={ic} size={20} stroke={active ? 2.0 : 1.7} /></div>;
          })}
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--divider)', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          {CATEGORY_COLOR_CHOICES.map(c => {
            const [cfg, cbg] = colorMap[c];
            const active = color === c;
            return <div key={c} onClick={() => setColor(c)} className="press" style={{ flex: 1, height: 36, borderRadius: 10, background: cbg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: active ? `1.5px solid ${cfg}` : 'none' }}><div style={{ width: 16, height: 16, borderRadius: 8, background: cfg, boxShadow: active ? '0 0 0 2px var(--surface)' : 'none' }} /></div>;
          })}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AllocateModal
// ─────────────────────────────────────────────────────────────
interface AllocateModalProps {
  open: boolean;
  onClose: () => void;
  item: WishlistItem | null;
  unallocated: number;
  onAllocate: (id: string, amount: number) => void;
}

export const AllocateModal: React.FC<AllocateModalProps> = ({ open, onClose, item, unallocated, onAllocate }) => {
  const [amount, setAmount] = useState('');
  useEffect(() => { if (open) setAmount(''); }, [open]);
  if (!item) return null;
  const n = parseFloat(amount) || 0;
  const remaining = Math.max(0, item.price - item.saved);
  const valid = n > 0 && n <= unallocated && n <= remaining;
  const quick = [500, 1000, 2500, Math.min(unallocated, remaining)].filter(v => v > 0 && v <= Math.min(unallocated, remaining));

  return (
    <BottomSheet open={open} onClose={onClose} title="Allocate Funds" footer={<PrimaryButton variant="copper" onClick={() => { onAllocate(item.id, n); onClose(); }} disabled={!valid} icon="check">Allocate {n > 0 ? fmtINR(n) : ''}</PrimaryButton>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-3)', overflow: 'hidden', flexShrink: 0 }}>{item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div>
          <div style={{ minWidth: 0, flex: 1 }}><div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div><div className="num" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{fmtINR(item.saved)} / {fmtINR(item.price)} · {fmtINR(remaining)} to go</div></div>
        </div>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>Amount</div>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, color: 'var(--copper)' }}><span style={{ fontSize: 28, fontWeight: 500 }}>{currencySymbol()}</span><input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus style={{ ...inputStyle, width: 200, fontSize: 56, fontWeight: 600, letterSpacing: -1.6, color: 'inherit', textAlign: 'left' }} /></div>
        </div>
        <Card padding={14}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}><div style={{ color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>Unallocated pool</div><div className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>{fmtINR(unallocated)}</div></div></Card>
        {quick.length > 0 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{quick.map(v => <div key={v} onClick={() => setAmount(String(v))} className="press" style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--surface)', boxShadow: 'var(--shadow-card)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}><span className="num">{fmtINR(v)}</span></div>)}</div>}
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// TransactionEditModal
// ─────────────────────────────────────────────────────────────
interface TransactionEditModalProps {
  open: boolean;
  onClose: () => void;
  txn: Transaction | null;
  onSave: (txn: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionEditModal: React.FC<TransactionEditModalProps> = ({ open, onClose, txn, onSave, onDelete }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Dining');
  const [merchant, setMerchant] = useState('');

  useEffect(() => {
    if (open && txn) {
      setAmount(String(txn.amount));
      setCategory(txn.category);
      setMerchant(txn.merchant);
    }
  }, [open, txn]);

  if (!txn) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit Transaction" footer={<div style={{ display: 'flex', gap: 8 }}><PrimaryButton variant="clay" fullWidth={false} icon="trash" onClick={() => { onDelete(txn.id); onClose(); }}>Delete</PrimaryButton><div style={{ flex: 1 }}><PrimaryButton variant="copper" icon="check" onClick={() => { onSave({ ...txn, amount: parseFloat(amount), category, merchant }); onClose(); }}>Save</PrimaryButton></div></div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padding={0}>
          <ModalRow label="Amount"><RupeeInput value={amount} onChange={setAmount} /></ModalRow>
          <Divider /><ModalRow label="Merchant"><input value={merchant} onChange={e => setMerchant(e.target.value)} style={inputStyle} /></ModalRow>
          <Divider /><ModalRow label="Category"><select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>{CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}</select></ModalRow>
          <Divider /><ModalRow label="Status"><div style={{ padding: '4px 10px', borderRadius: 8, background: txn.status === 'pending' ? 'var(--amber-tint)' : 'var(--green-tint)', color: txn.status === 'pending' ? 'var(--amber)' : 'var(--green)', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{txn.status}</div></ModalRow>
        </Card>
      </div>
    </BottomSheet>
  );
}
