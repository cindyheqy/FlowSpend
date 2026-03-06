import { CATEGORIES } from "./CategoryConfig";

export default function MonthSummaryBar({ expenses, budgets, onCategoryClick }) {
  const totals = {};
  expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  const budgetMap = {};
  budgets.forEach(b => { budgetMap[b.category] = b.monthly_limit; });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-3">
      {sorted.map(([cat, total]) => {
        const budget = budgetMap[cat];
        const pct = budget ? Math.min((total / budget) * 100, 100) : null;
        const color = CATEGORIES[cat]?.color || "#ccc";
        const over = budget && total > budget;
        return (
          <button key={cat} onClick={() => onCategoryClick(cat)} className="w-full text-left group">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{cat}</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-sm font-semibold ${over ? "text-red-500" : "text-gray-800"}`}>${total.toFixed(2)}</span>
                {budget && <span className="text-xs text-gray-400">/ ${budget.toLocaleString()}</span>}
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              {pct !== null
                ? <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: over ? "#F87171" : color }} />
                : <div className="h-full w-full rounded-full opacity-20" style={{ backgroundColor: color }} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
