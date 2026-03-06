import { CATEGORIES } from "./CategoryConfig";
import { X, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function CategoryDrawer({ category, expenses, onClose, onEdit, onDelete }) {
  if (!category) return null;
  const filtered = expenses.filter(e => e.category === category);
  const color = CATEGORIES[category]?.color || "#ccc";
  const bySub = {};
  filtered.forEach(e => { const key = e.subcategory || "Uncategorized"; if (!bySub[key]) bySub[key] = []; bySub[key].push(e); });
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <h2 className="text-lg font-bold text-gray-900">{category}</h2>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">${total.toFixed(2)}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {Object.entries(bySub).map(([sub, items]) => {
          const subTotal = items.reduce((s, e) => s + e.amount, 0);
          return (
            <div key={sub}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{sub}</span>
                <span className="text-sm font-semibold text-gray-700">${subTotal.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                {items.sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => (
                  <div key={e.id} className="bg-gray-50 rounded-xl p-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-gray-400">{format(new Date(e.date), "MMM d")}</span>
                        <span className="text-sm font-semibold text-gray-900">${e.amount.toFixed(2)}</span>
                      </div>
                      {e.notes && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{e.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => onEdit(e)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                      <button onClick={() => onDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
