import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft } from "lucide-react";
import AddExpenseForm from "../components/spending/AddExpenseForm";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CATEGORIES } from "../components/spending/CategoryConfig";

export default function Add() {
  const [monthExpenses, setMonthExpenses] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMonth = async () => {
    const now = new Date();
    const all = await base44.entities.Expense.list("-date", 500);
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    setMonthExpenses(all.filter(e => { const d = new Date(e.date); return d >= start && d <= end; }));
  };

  useEffect(() => { loadMonth(); }, [refreshKey]);

  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = {};
  monthExpenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-white border-b border-gray-100 px-5 pb-4 flex items-center gap-3" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}>
        <Link to={createPageUrl("Home")} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-base font-bold text-gray-900">New Expense</h1>
      </div>
      <div className="px-5 py-5 space-y-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <AddExpenseForm onSaved={() => setRefreshKey(k => k + 1)} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{format(new Date(), "MMMM")} so far</p>
          <p className="text-3xl font-bold text-gray-900 mb-4">${total.toFixed(2)}</p>
          <div className="space-y-2.5">
            {sorted.map(([cat, amt]) => {
              const color = CATEGORIES[cat]?.color || "#ccc";
              return (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-gray-600">{cat}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">${amt.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
