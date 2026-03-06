import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORY_NAMES } from "./CategoryConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Trash2 } from "lucide-react";

export default function BudgetSettings({ onClose }) {
  const [budgets, setBudgets] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.Budget.list().then(list => {
      const map = {};
      list.forEach(b => { map[b.category] = { id: b.id, value: b.monthly_limit }; });
      setBudgets(map);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const existing = await base44.entities.Budget.list();
    const existingMap = {};
    existing.forEach(b => { existingMap[b.category] = b.id; });
    for (const cat of CATEGORY_NAMES) {
      const val = parseFloat(budgets[cat]?.value || 0);
      if (!val) continue;
      if (existingMap[cat]) {
        await base44.entities.Budget.update(existingMap[cat], { monthly_limit: val });
      } else {
        await base44.entities.Budget.create({ category: cat, monthly_limit: val });
      }
    }
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Monthly Budgets</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {CATEGORY_NAMES.map(cat => (
          <div key={cat}>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">{cat}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input type="number" min="0" placeholder="No limit"
                value={budgets[cat]?.value || ""}
                onChange={e => setBudgets(prev => ({ ...prev, [cat]: { ...prev[cat], value: e.target.value } }))}
                className="pl-7 bg-gray-50 border-gray-200 rounded-xl h-11 text-sm" />
            </div>
          </div>
        ))}
        {(() => {
          const total = CATEGORY_NAMES.reduce((sum, cat) => sum + (parseFloat(budgets[cat]?.value) || 0), 0);
          if (total === 0) return null;
          return (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Monthly Total</span>
                <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          );
        })()}
      </div>
      <div className="px-5 pb-8 pt-3 space-y-3">
        <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white">
          {saved ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Saved!</span> : saving ? "Saving..." : "Save Budgets"}
        </Button>
        <div className="flex gap-2">
          <button onClick={async () => {
            if (!window.confirm("Delete all your data? This cannot be undone.")) return;
            const [expenses, budgets, reflections] = await Promise.all([base44.entities.Expense.list("-date", 1000), base44.entities.Budget.list(), base44.entities.MonthlyReflection.list()]);
            await Promise.all([...expenses.map(e => base44.entities.Expense.delete(e.id)), ...budgets.map(b => base44.entities.Budget.delete(b.id)), ...reflections.map(r => base44.entities.MonthlyReflection.delete(r.id))]);
            onClose();
          }} className="flex-1 h-10 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete All Data
          </button>
          <button onClick={async () => {
            if (!window.confirm("Delete your account? All data will be lost and cannot be undone.")) return;
            const [expenses, budgets, reflections] = await Promise.all([base44.entities.Expense.list("-date", 1000), base44.entities.Budget.list(), base44.entities.MonthlyReflection.list()]);
            await Promise.all([...expenses.map(e => base44.entities.Expense.delete(e.id)), ...budgets.map(b => base44.entities.Budget.delete(b.id)), ...reflections.map(r => base44.entities.MonthlyReflection.delete(r.id))]);
            base44.auth.logout();
          }} className="flex-1 h-10 rounded-xl text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 border border-red-200">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
