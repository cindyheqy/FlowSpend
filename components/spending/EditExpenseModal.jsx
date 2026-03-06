import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES, CATEGORY_NAMES } from "./CategoryConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function EditExpenseModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState({ ...expense });
  const [saving, setSaving] = useState(false);
  const subcategories = form.category ? CATEGORIES[form.category]?.subcategories || [] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Expense.update(expense.id, { ...form, amount: parseFloat(form.amount) });
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-8 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-gray-900">Edit Expense</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-xl h-10 text-sm border-gray-200" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Amount</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="rounded-xl h-10 text-sm border-gray-200" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v, subcategory: "" })}>
                <SelectTrigger className="rounded-xl h-10 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORY_NAMES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Subcategory</Label>
              <Select value={form.subcategory || ""} onValueChange={v => setForm({ ...form, subcategory: v })} disabled={!form.category}>
                <SelectTrigger className="rounded-xl h-10 text-sm border-gray-200"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{subcategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Notes</Label>
            <Textarea value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} className="rounded-xl text-sm border-gray-200 resize-none" rows={2} />
          </div>
          <Button type="submit" disabled={saving} className="w-full h-11 rounded-xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white">
            {saving ? "Saving..." : "Update Expense"}
          </Button>
        </form>
      </div>
    </div>
  );
}
