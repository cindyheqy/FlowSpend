import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES, CATEGORY_NAMES } from "./CategoryConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

export default function AddExpenseForm({ onSaved }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [form, setForm] = useState({ date: today, amount: "", notes: "", category: "", subcategory: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const subcategories = form.category ? CATEGORIES[form.category]?.subcategories || [] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newExpense = { ...form, amount: parseFloat(form.amount) };
    setForm({ date: today, amount: "", notes: "", category: "", subcategory: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved?.(newExpense);
    setSaving(true);
    await base44.entities.Expense.create(newExpense);
    setSaving(false);
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</Label>
          <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-white border-gray-200 rounded-xl h-11 text-sm" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount ($)</Label>
          <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="bg-white border-gray-200 rounded-xl h-11 text-sm" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v, subcategory: "" })} required>
            <SelectTrigger className="bg-white border-gray-200 rounded-xl h-11 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{CATEGORY_NAMES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subcategory</Label>
          <Select value={form.subcategory} onValueChange={v => setForm({ ...form, subcategory: v })} disabled={!form.category}>
            <SelectTrigger className="bg-white border-gray-200 rounded-xl h-11 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{subcategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</Label>
        <Textarea placeholder="e.g. Kroger — yogurt, beef stock, cat treats" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="bg-white border-gray-200 rounded-xl text-sm resize-none" rows={3} />
      </div>
      <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white transition-all">
        {saved ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Saved!</span> : saving ? "Saving..." : "Add Expense"}
      </Button>
    </form>
  );
}
