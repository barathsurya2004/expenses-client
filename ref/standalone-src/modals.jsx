// Global modals — Add Transaction, Add/Edit Wishlist, Edit Category, Edit Transaction

const { useState: mUseState, useEffect: mUseEffect, useRef: mUseRef } = React;

// ─────────────────────────────────────────────────────────────
// AddTransactionModal
// ─────────────────────────────────────────────────────────────
function AddTransactionModal({ open, onClose, onSave }) {
  const [type, setType] = mUseState('expense');
  const [amount, setAmount] = mUseState('');
  const [category, setCategory] = mUseState('Dining');
  const [merchant, setMerchant] = mUseState('');
  const [notes, setNotes] = mUseState('');

  mUseEffect(() => {
    if (open) {
      setType('expense'); setAmount(''); setCategory('Dining'); setMerchant(''); setNotes('');
    }
  }, [open]);

  const incomeCats = ['Salary', 'Other Income'];
  const expenseCats = CATEGORY_LIST.filter(c => c !== 'Salary');
  const cats = type === 'income' ? incomeCats : expenseCats;

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    onSave({
      id: 't_' + Math.random().toString(36).slice(2, 8),
      amount: n,
      category: type === 'income' ? (incomeCats.includes(category) ? category : 'Salary') : category,
      merchant: merchant || (type === 'income' ? 'Income' : 'Quick add'),
      date: new Date().toISOString(),
      type,
      status: 'pending',
      tags: notes ? [notes.toLowerCase().split(' ')[0]] : [],
      notes,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open} onClose={onClose} title="Add Transaction"
      footer={<PrimaryButton variant="copper" onClick={submit} disabled={!amount} icon="check">Add to Ledger</PrimaryButton>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Type toggle */}
        <Segmented
          fullWidth
          value={type}
          onChange={setType}
          options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
        />

        {/* Amount */}
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8,
          }}>Amount</div>
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 6,
            color: type === 'income' ? 'var(--green)' : 'var(--ink)',
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

        {/* Fields card */}
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <ModalRow label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </ModalRow>
          <Divider />
          <ModalRow label="Merchant">
            <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Where?" style={inputStyle} />
          </ModalRow>
          <Divider />
          <ModalRow label="Date">
            <div style={{ color: 'var(--ink-2)', fontSize: 16 }}>Today, May 14</div>
          </ModalRow>
        </Card>

        <Card padding={0}>
          <ModalRow label="Notes" stack>
            <input value={notes} onChange={e => setNotes(e.target.value)}
                   placeholder="e.g. JLPT N4 registration"
                   style={{ ...inputStyle, width: '100%', textAlign: 'left' }} />
          </ModalRow>
        </Card>
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// AddWishlistModal — two-mode flow (paste link → crawl, or manual)
// ─────────────────────────────────────────────────────────────
function AddWishlistModal({ open, onClose, onSave, editing }) {
  const [step, setStep] = mUseState('choose'); // choose | url | form
  const [name, setName] = mUseState('');
  const [brand, setBrand] = mUseState('');
  const [category, setCategory] = mUseState('');
  const [price, setPrice] = mUseState('');
  const [saved, setSaved] = mUseState('');
  const [url, setUrl] = mUseState('');
  const [image, setImage] = mUseState('');
  const [notes, setNotes] = mUseState('');
  const [priority, setPriority] = mUseState('medium');

  // URL crawl state
  const [crawlUrl, setCrawlUrl] = mUseState('');
  const [crawling, setCrawling] = mUseState(false);
  const [crawlError, setCrawlError] = mUseState('');

  mUseEffect(() => {
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
      brand: brand || undefined,
      category: category || undefined,
      url: url || undefined,
      image: image || undefined,
      notes: notes || undefined,
      price: p,
      saved: parseFloat(saved) || 0,
      priority,
      allocation: editing?.allocation ?? (priority === 'high' ? 3000 : priority === 'medium' ? 1500 : 800),
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
      setPriority(result.priority || 'medium');
      setStep('form');
    } catch (e) {
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
          disabled={!crawlUrl.trim() || crawling} icon={crawling ? 'sparkles' : 'sparkles'}>
          {crawling ? 'Fetching…' : 'Auto-fill from link'}
        </PrimaryButton>
      : null;

  return (
    <BottomSheet open={open} onClose={onClose} title={title} footer={footer}>
      {step === 'choose' && !editing && (
        <ChooseAddMode
          onPickUrl={() => setStep('url')}
          onPickManual={() => setStep('form')}
        />
      )}

      {step === 'url' && (
        <UrlCrawlStep
          url={crawlUrl} setUrl={setCrawlUrl}
          crawling={crawling} error={crawlError}
          onBack={() => setStep('choose')}
          onSkip={() => setStep('form')}
        />
      )}

      {step === 'form' && (
        <WishlistFormBody
          editing={editing}
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

function ChooseAddMode({ onPickUrl, onPickManual }) {
  const Card1 = ({ icon, badge, title, sub, onClick, tint, fg }) => (
    <div onClick={onClick} className="press" style={{
      padding: 18, borderRadius: 18,
      background: 'var(--surface)', boxShadow: 'var(--shadow-card)',
      display: 'flex', alignItems: 'flex-start', gap: 14,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: tint, color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Lucide name={icon} size={22} stroke={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.2 }}>{title}</div>
          {badge && (
            <div style={{
              padding: '2px 7px', borderRadius: 5, background: tint, color: fg,
              fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
            }}>{badge}</div>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
      </div>
      <Lucide name="chevron-right" size={18} style={{ color: 'var(--ink-4)', marginTop: 12 }} />
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
      <Card1
        icon="link" tint="var(--copper-tint)" fg="var(--copper)" badge="Fast"
        title="Paste a product link"
        sub="We'll fetch the name, price, image, and brand from the page automatically."
        onClick={onPickUrl}
      />
      <Card1
        icon="pencil" tint="var(--blue-tint)" fg="var(--blue)"
        title="Enter manually"
        sub="Type the details yourself — useful for trips, experiences, or things without a link."
        onClick={onPickManual}
      />
      <div style={{
        marginTop: 4, padding: '12px 14px', borderRadius: 12,
        background: 'var(--surface-2)', display: 'flex', gap: 10, alignItems: 'flex-start',
        fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4,
      }}>
        <Lucide name="sparkles" size={14} style={{ color: 'var(--copper)', flexShrink: 0, marginTop: 1 }} />
        <div>Auto-fill works on most retailer pages — Amazon, Sony, Apple, Decathlon, Aer, Keychron, and others.</div>
      </div>
    </div>
  );
}

function UrlCrawlStep({ url, setUrl, crawling, error, onBack, onSkip }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
      <BackChevron onClick={onBack} label="Back" />

      <Card padding={0}>
        <ModalRow label="URL" stack>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <Lucide name="link" size={18} style={{ color: 'var(--ink-3)' }} />
            <input value={url} onChange={e => setUrl(e.target.value)}
                   placeholder="https://sony.com/wh-1000xm6"
                   autoFocus
                   style={{ ...inputStyle, flex: 1, textAlign: 'left', fontSize: 15 }} />
          </div>
        </ModalRow>
      </Card>

      {crawling ? (
        <CrawlSkeleton />
      ) : error ? (
        <div style={{
          padding: '14px 16px', borderRadius: 14, background: 'var(--clay-tint)',
          color: 'var(--clay)', fontSize: 13, fontWeight: 500,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <Lucide name="alert" size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>{error}</div>
        </div>
      ) : (
        <div style={{
          padding: '14px 16px', borderRadius: 14, background: 'var(--surface)',
          boxShadow: 'var(--shadow-card)', display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Lucide name="sparkles" size={18} style={{ color: 'var(--copper)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>What we'll grab</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.45 }}>
              Product name, brand, price, image, and category — you can edit anything before saving.
            </div>
          </div>
        </div>
      )}

      <div onClick={onSkip} className="press" style={{
        textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600,
        color: 'var(--ink-3)',
      }}>
        Skip and enter manually
      </div>
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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
        fontWeight: 600, color: 'var(--copper)', letterSpacing: 0.3, textTransform: 'uppercase',
      }}>
        <SpinningDot />
        Fetching product details
      </div>
      <SkeletonBar w="80%" h={18} />
      <SkeletonBar w="40%" h={12} />
      <SkeletonBar w="100%" h={120} radius={12} />
      <SkeletonBar w="60%" h={12} />
    </div>
  );
}

function SkeletonBar({ w = '100%', h = 12, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--surface-3) 25%, var(--surface-2) 50%, var(--surface-3) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmerSlide 1.4s linear infinite',
    }} />
  );
}

function SpinningDot() {
  return (
    <div style={{
      width: 10, height: 10, borderRadius: 5,
      border: '2px solid var(--copper-tint)',
      borderTopColor: 'var(--copper)',
      animation: 'spin360 0.9s linear infinite',
    }} />
  );
}

function BackChevron({ onClick, label }) {
  return (
    <div onClick={onClick} className="press" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
      padding: '4px 8px 4px 4px', alignSelf: 'flex-start',
      marginLeft: -4,
    }}>
      <Lucide name="chevron-left" size={16} stroke={2} />
      {label}
    </div>
  );
}

function WishlistFormBody({
  editing, showBack, onBack,
  name, setName, brand, setBrand, category, setCategory,
  price, setPrice, saved, setSaved, url, setUrl,
  image, setImage, notes, setNotes, priority, setPriority,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {showBack && <BackChevron onClick={onBack} label="Back" />}

      {/* Image preview + URL */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <ImagePreview src={image} />
        <div style={{ padding: '12px 14px', borderTop: '0.5px solid var(--divider)' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--ink-3)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4,
          }}>Image URL</div>
          <input value={image} onChange={e => setImage(e.target.value)}
                 placeholder="Paste an image link (optional)"
                 style={{ ...inputStyle, width: '100%', textAlign: 'left', fontSize: 14 }} />
        </div>
      </div>

      {/* Core fields */}
      <Card padding={0}>
        <ModalRow label="Item name" stack>
          <input value={name} onChange={e => setName(e.target.value)}
                 placeholder="Sony WH-1000XM6"
                 style={{ ...inputStyle, width: '100%', textAlign: 'left' }} />
        </ModalRow>
        <Divider />
        <ModalRow label="Brand">
          <input value={brand} onChange={e => setBrand(e.target.value)}
                 placeholder="Sony" style={inputStyle} />
        </ModalRow>
        <Divider />
        <ModalRow label="Category">
          <input value={category} onChange={e => setCategory(e.target.value)}
                 placeholder="Audio, Travel…" style={inputStyle} />
        </ModalRow>
        <Divider />
        <ModalRow label="Source URL">
          <input value={url} onChange={e => setUrl(e.target.value)}
                 placeholder="sony.com" style={inputStyle} />
        </ModalRow>
      </Card>

      {/* Price + Saved */}
      <Card padding={0}>
        <ModalRow label="Target Price">
          <RupeeInput value={price} onChange={setPrice} />
        </ModalRow>
        <Divider />
        <ModalRow label="Already Saved">
          <RupeeInput value={saved} onChange={setSaved} />
        </ModalRow>
      </Card>

      {/* Notes */}
      <Card padding={0}>
        <ModalRow label="Notes" stack>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Why you want it, when to buy…"
                    rows={3}
                    style={{ ...inputStyle, width: '100%', textAlign: 'left', resize: 'none', minHeight: 64 }} />
        </ModalRow>
      </Card>

      {/* Priority chips */}
      <div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
          letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px',
        }}>Priority</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['high', 'medium', 'low'].map(p => {
            const c = PRIORITY_COLORS[p];
            const active = priority === p;
            return (
              <div key={p} onClick={() => setPriority(p)} className="press" style={{
                flex: 1, padding: '14px 8px', borderRadius: 14,
                background: active ? c.bg : 'var(--surface)',
                color: active ? c.fg : 'var(--ink-2)',
                outline: active ? `1.5px solid ${c.fg}` : 'none',
                textAlign: 'center', fontSize: 14, fontWeight: 600,
                letterSpacing: -0.1, textTransform: 'capitalize',
                boxShadow: active ? 'none' : 'var(--shadow-card)',
                transition: 'all 200ms',
              }}>{p}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simulated backend crawl — returns mocked structured data for known retailers,
// falls back to generic-but-plausible data otherwise.
async function crawlProductUrl(url) {
  await new Promise(r => setTimeout(r, 1400 + Math.random() * 600));

  const u = url.toLowerCase();
  const matchers = [
    { test: /sony|wh-?1000|xm[3-6]/, data: {
      name: 'Sony WH-1000XM6', brand: 'Sony', category: 'Audio',
      price: 34990, priority: 'high',
      image: window.__resources.imgSony,
      notes: 'Industry-leading noise cancellation. Pulled from product page.',
    }},
    { test: /apple|airpods|iphone|macbook|ipad/, data: {
      name: 'AirPods Pro (2nd gen)', brand: 'Apple', category: 'Audio',
      price: 24900, priority: 'medium',
      image: window.__resources.imgAirpods,
    }},
    { test: /keychron|mech|keyboard/, data: {
      name: 'Keychron Q1 Pro', brand: 'Keychron', category: 'Desk setup',
      price: 18900, priority: 'medium',
      image: window.__resources.imgKeychron,
      notes: 'Custom build with gateron browns + PBT keycaps.',
    }},
    { test: /aer|backpack|travel-?pack/, data: {
      name: 'Aer Travel Pack 3', brand: 'Aer', category: 'Gear',
      price: 22500, priority: 'medium',
      image: window.__resources.imgAer,
    }},
    { test: /decathlon|tent|hike|bike/, data: {
      name: 'Quechua MH500 Hiking Pack', brand: 'Decathlon', category: 'Outdoor',
      price: 4499, priority: 'low',
      image: window.__resources.imgDecathlon,
    }},
    { test: /amazon|amzn/, data: {
      name: 'Kindle Paperwhite Signature', brand: 'Amazon', category: 'Reading',
      price: 17999, priority: 'medium',
      image: window.__resources.imgKindle,
    }},
    { test: /kyoto|japan|trip|hotel|airbnb/, data: {
      name: 'Kyoto trip, 8 days', brand: 'Trip', category: 'Travel',
      price: 145000, priority: 'high',
      image: window.__resources.imgKyoto,
      notes: 'Cherry blossom window — flights + ryokan.',
    }},
  ];

  for (const m of matchers) {
    if (m.test.test(u)) return m.data;
  }

  // Generic-but-plausible fallback. Derive a name from the hostname.
  let host = '';
  try { host = new URL(url.startsWith('http') ? url : 'https://' + url).hostname; } catch (_) { host = url; }
  const cleanHost = host.replace(/^www\./, '').split('.')[0];
  const titled = cleanHost ? cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1) : 'Wishlist item';

  return {
    name: titled + ' item',
    brand: titled,
    category: 'Other',
    price: 0, // user fills in
    priority: 'medium',
    image: '', // triggers fallback placeholder
    notes: 'Auto-filled from ' + host + '. Review the details before saving.',
  };
}

function ImagePreview({ src }) {
  const [broken, setBroken] = mUseState(false);
  mUseEffect(() => { setBroken(false); }, [src]);

  const showPlaceholder = !src || broken;

  if (!showPlaceholder) {
    return (
      <div style={{ width: '100%', aspectRatio: '16 / 9', background: 'var(--surface-3)', position: 'relative' }}>
        <img src={src} alt=""
             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
             onError={() => setBroken(true)} />
      </div>
    );
  }
  return (
    <div style={{
      width: '100%', aspectRatio: '16 / 9',
      background: 'repeating-linear-gradient(135deg, var(--surface-2) 0 12px, var(--surface-3) 12px 24px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      color: 'var(--ink-4)',
    }}>
      <Lucide name="image" size={28} stroke={1.6} />
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
        {broken ? 'Image unavailable' : 'Add image (optional)'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EditCategoryModal — Budget (handles both new + edit)
// ─────────────────────────────────────────────────────────────
function EditCategoryModal({ open, onClose, category, onSave, currentTier, mode = 'edit' }) {
  const [name, setName] = mUseState('');
  const [limit, setLimit] = mUseState('');
  const [tier, setTier] = mUseState('wants');
  const [frequency, setFrequency] = mUseState('monthly');
  const [customCount, setCustomCount] = mUseState('2');
  const [customUnit, setCustomUnit] = mUseState('weeks');
  const [due, setDue] = mUseState('');
  const [icon, setIcon] = mUseState('tag');
  const [color, setColor] = mUseState('plum');

  mUseEffect(() => {
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

  if (mode === 'edit' && !category) return null;

  const isFixed = tier === 'needs';

  const submit = () => {
    if (mode === 'new' && !name.trim()) return;
    const newId = mode === 'edit' ? category.id : 'c_' + Math.random().toString(36).slice(2, 8);
    const out = {
      id: newId,
      name: mode === 'edit' ? category.name : name.trim(),
      limit: parseFloat(limit) || 0,
      spent: mode === 'edit' ? category.spent : 0,
      icon,
      color,
    };
    if (isFixed) {
      out.frequency = frequency;
      if (frequency === 'custom') {
        out.customCount = parseInt(customCount) || 1;
        out.customUnit = customUnit;
      }
      out.paid = mode === 'edit' ? (category.paid ?? false) : false;
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
        {mode === 'edit' && category && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px' }}>
            <CategoryTile name={category.name} icon={icon} color={color} size={44} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{category.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                {category.frequency ? (category.paid ? 'Paid this period' : 'Due ' + (category.due || 'soon')) : ('Spent ' + fmtINR(category.spent) + ' so far')}
              </div>
            </div>
          </div>
        )}

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
                  <select value={customUnit} onChange={e => setCustomUnit(e.target.value)}
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

// ─────────────────────────────────────────────────────────────
// IconColorPicker — used in EditCategoryModal
// ─────────────────────────────────────────────────────────────
function IconColorPicker({ icon, setIcon, color, setColor }) {
  const colorMap = {
    green: ['var(--green)', 'var(--green-tint)'],
    blue: ['var(--blue)', 'var(--blue-tint)'],
    amber: ['var(--amber)', 'var(--amber-tint)'],
    copper: ['var(--copper)', 'var(--copper-tint)'],
    plum: ['var(--plum)', 'var(--plum-tint)'],
    clay: ['var(--clay)', 'var(--clay-tint)'],
  };
  const [fg, bg] = colorMap[color] || colorMap.plum;

  return (
    <div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
        letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px',
      }}>Icon</div>

      <Card padding={14}>
        {/* Icon grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8,
        }}>
          {CATEGORY_ICON_CHOICES.map(ic => {
            const active = ic === icon;
            return (
              <div key={ic} onClick={() => setIcon(ic)} className="press" style={{
                aspectRatio: '1 / 1',
                borderRadius: 12,
                background: active ? bg : 'var(--surface-3)',
                color: active ? fg : 'var(--ink-3)',
                outline: active ? `1.5px solid ${fg}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 180ms',
              }}>
                <Lucide name={ic} size={20} stroke={active ? 2.0 : 1.7} />
              </div>
            );
          })}
        </div>

        {/* Color swatches */}
        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--divider)',
          display: 'flex', gap: 10, justifyContent: 'space-between',
        }}>
          {CATEGORY_COLOR_CHOICES.map(c => {
            const [cfg, cbg] = colorMap[c];
            const active = color === c;
            return (
              <div key={c} onClick={() => setColor(c)} className="press" style={{
                flex: 1, height: 36, borderRadius: 10,
                background: cbg, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                outline: active ? `1.5px solid ${cfg}` : 'none',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 8, background: cfg,
                  boxShadow: active ? '0 0 0 2px var(--surface)' : 'none',
                }} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AllocateModal — move money from unallocated pool into a wishlist item
// ─────────────────────────────────────────────────────────────
function AllocateModal({ open, onClose, item, unallocated, onAllocate }) {
  const [amount, setAmount] = mUseState('');
  mUseEffect(() => { if (open) setAmount(''); }, [open]);
  if (!item) return null;

  const n = parseFloat(amount) || 0;
  const remaining = Math.max(0, item.price - item.saved);
  const valid = n > 0 && n <= unallocated && n <= remaining;

  const quick = [500, 1000, 2500, Math.min(unallocated, remaining)].filter(v => v > 0 && v <= Math.min(unallocated, remaining));

  return (
    <BottomSheet
      open={open} onClose={onClose} title="Allocate Funds"
      footer={
        <PrimaryButton variant="copper" onClick={() => { onAllocate(item.id, n); onClose(); }}
          disabled={!valid} icon="check">
          Allocate {n > 0 ? fmtINR(n) : ''}
        </PrimaryButton>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--surface-3)',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
            <div className="num" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {fmtINR(item.saved)} / {fmtINR(item.price)} · {fmtINR(remaining)} to go
            </div>
          </div>
        </div>

        {/* Big amount input */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--ink-3)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6,
          }}>Amount</div>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, color: 'var(--copper)' }}>
            <span style={{ fontSize: 28, fontWeight: 500 }}>{currencySymbol()}</span>
            <input type="number" inputMode="decimal" value={amount}
                   onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus
                   style={{
                     width: 200, border: 'none', outline: 'none', background: 'transparent',
                     fontFamily: 'inherit', fontSize: 56, fontWeight: 600, letterSpacing: -1.6,
                     color: 'inherit', textAlign: 'left',
                     fontVariantNumeric: 'tabular-nums',
                   }} />
          </div>
        </div>

        {/* Pool indicator */}
        <Card padding={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <div style={{ color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>Unallocated pool</div>
            <div className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>{fmtINR(unallocated)}</div>
          </div>
          {n > 0 && (
            <div style={{
              marginTop: 10, fontSize: 12, color: valid ? 'var(--green)' : 'var(--clay)',
              fontWeight: 500,
            }}>
              {n > unallocated
                ? 'Only ' + fmtINR(unallocated) + ' available'
                : n > remaining
                  ? 'Item only needs ' + fmtINR(remaining)
                  : 'Leaves ' + fmtINR(unallocated - n) + ' in pool'}
            </div>
          )}
        </Card>

        {quick.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {quick.map(v => (
              <div key={v} onClick={() => setAmount(String(v))} className="press" style={{
                padding: '8px 14px', borderRadius: 10, background: 'var(--surface)',
                boxShadow: 'var(--shadow-card)', fontSize: 13, fontWeight: 600,
                color: 'var(--ink-2)',
              }}>
                <span className="num">{fmtINR(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// TransactionEditModal
// ─────────────────────────────────────────────────────────────
function TransactionEditModal({ open, onClose, txn, onSave, onDelete }) {
  const [amount, setAmount] = mUseState('');
  const [category, setCategory] = mUseState('Dining');
  const [merchant, setMerchant] = mUseState('');

  mUseEffect(() => {
    if (open && txn) {
      setAmount(String(txn.amount));
      setCategory(txn.category);
      setMerchant(txn.merchant);
    }
  }, [open, txn]);

  if (!txn) return null;

  return (
    <BottomSheet
      open={open} onClose={onClose} title="Edit Transaction"
      footer={
        <div style={{ display: 'flex', gap: 8 }}>
          <PrimaryButton variant="clay" fullWidth={false} icon="trash"
            onClick={() => { onDelete(txn.id); onClose(); }}>Delete</PrimaryButton>
          <div style={{ flex: 1 }}>
            <PrimaryButton variant="copper" icon="check"
              onClick={() => { onSave({ ...txn, amount: parseFloat(amount), category, merchant }); onClose(); }}>
              Save
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padding={0}>
          <ModalRow label="Amount">
            <RupeeInput value={amount} onChange={setAmount} />
          </ModalRow>
          <Divider />
          <ModalRow label="Merchant">
            <input value={merchant} onChange={e => setMerchant(e.target.value)} style={inputStyle} />
          </ModalRow>
          <Divider />
          <ModalRow label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </ModalRow>
          <Divider />
          <ModalRow label="Status">
            <div style={{
              padding: '4px 10px', borderRadius: 8,
              background: txn.status === 'pending' ? 'var(--amber-tint)' : 'var(--green-tint)',
              color: txn.status === 'pending' ? 'var(--amber)' : 'var(--green)',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            }}>{txn.status}</div>
          </ModalRow>
        </Card>

        {/* Attach receipt */}
        <Card>
          <div className="press" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-2)' }}>
            <Lucide name="image" size={20} />
            <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>Attach Receipt</div>
            <Lucide name="chevron-right" size={18} style={{ color: 'var(--ink-4)' }} />
          </div>
        </Card>
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────
function ModalRow({ label, children, stack }) {
  return (
    <div style={{
      padding: '14px 18px',
      display: stack ? 'flex' : 'flex',
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

const selectStyle = {
  border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'inherit', fontSize: 16, fontWeight: 500, color: 'var(--ink)',
  textAlign: 'right', appearance: 'none', cursor: 'pointer',
  paddingRight: 16,
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' viewBox=\'0 0 10 6\'%3E%3Cpath fill=\'%238C857A\' d=\'M1 1l4 4 4-4\' stroke=\'%238C857A\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right center',
};

const inputStyle = {
  border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'inherit', fontSize: 16, fontWeight: 500, color: 'var(--ink)',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

function RupeeInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ color: 'var(--ink-3)', fontSize: 16 }}>{currencySymbol()}</span>
      <input type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)}
             placeholder="0"
             style={{ ...inputStyle, width: 130 }} />
    </div>
  );
}

Object.assign(window, {
  AddTransactionModal, AddWishlistModal, EditCategoryModal, TransactionEditModal, AllocateModal,
});
