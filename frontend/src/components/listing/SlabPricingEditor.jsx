import { Plus, Trash2 } from 'lucide-react';

const EMPTY_SLAB = { fromQty: '', toQty: '', pricePerUnit: '' };

export default function SlabPricingEditor({ slabs, onChange }) {
  function update(i, field, value) {
    const next = slabs.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    onChange(next);
  }

  function add() {
    if (slabs.length >= 5) return;
    const prev = slabs[slabs.length - 1];
    const fromQty = prev?.toQty ? Number(prev.toQty) + 1 : '';
    onChange([...slabs, { ...EMPTY_SLAB, fromQty }]);
  }

  function remove(i) {
    onChange(slabs.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
        <span>From qty</span><span>To qty</span><span>₹ / unit</span>
      </div>
      {slabs.map((s, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 items-center">
          <input
            type="number" min="1" placeholder="1"
            className="input text-sm"
            value={s.fromQty}
            onChange={e => update(i, 'fromQty', e.target.value)}
          />
          <input
            type="number" min="1" placeholder="Leave blank = and above"
            className="input text-sm"
            value={s.toQty}
            onChange={e => update(i, 'toQty', e.target.value)}
          />
          <div className="flex gap-1">
            <input
              type="number" min="0" step="0.01" placeholder="₹0"
              className="input text-sm flex-1"
              value={s.pricePerUnit}
              onChange={e => update(i, 'pricePerUnit', e.target.value)}
            />
            {slabs.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      ))}
      {slabs.length < 5 && (
        <button
          type="button" onClick={add}
          className="flex items-center gap-1.5 text-sm text-brand-500 font-medium hover:text-brand-600 mt-1"
        >
          <Plus size={15} /> Add tier
        </button>
      )}
      <p className="text-xs text-gray-400">Prices must decrease as quantity increases. Leave "To qty" blank for the last tier.</p>
    </div>
  );
}
