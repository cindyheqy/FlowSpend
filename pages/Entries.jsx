import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Trash2, Pencil, Download, ArrowDownUp } from "lucide-react";
import { format } from "date-fns";
import { CATEGORIES } from "../components/spending/CategoryConfig";
import EditExpenseModal from "../components/spending/EditExpenseModal";
import PullToRefresh from "../components/spending/PullToRefresh";

export default function Entries() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const load = async () => {
    const list = await base44.entities.Expense.list("-date", 500);
    setExpenses(list);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await base44.entities.Expense.delete(id);
    load();
  };

  const filtered = filterCat === "all" ? expenses : expenses.filter(e => e.category === filterCat);
  const sorted = [...filtered].sort((a, b) => sortBy === "amount" ? b.amount - a.amount : new Date(b.date) - new Date(a.date));

  const byMonth = {};
  sorted.forEach(e => {
    const key = format(new Date(e.date), "MMMM yyyy");
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(e);
  });

  const exportText = async () => {
    const reflections = await base44.entities.MonthlyReflection.list();
    const reflMap = {};
    reflections.forEach(r => { reflMap[r.month_key] = r.reflection; });
    let text = "";
    Object.entries(byMonth).forEach(([month, items]) => {
      const total = items.reduce((s, e) => s + e.amount, 0);
      const monthKey = format(new Date(items[0].date), "yyyy-MM");
      text += `\n${"=".repeat(50)}\n${month.toUpperCase()}  $${total.toFixed(2)}\n${"=".repeat(50)}\n\n`;
      text += "--- MONTHLY SUMMARY ---\n\n";
      const catMap = {};
      items.forEach(e => {
        if (!catMap[e.category]) catMap[e.category] = {};
        const sub = e.subcategory || "(no subcategory)";
        if (!catMap[e.category][sub]) catMap[e.category][sub] = [];
        catMap[e.category][sub].push(e);
      });
      Object.entries(catMap).forEach(([cat, subMap]) => {
        const catTotal = Object.values(subMap).flat().reduce((s, e) => s + e.amount, 0);
        text += `${cat.toUpperCase()}  $${catTotal.toFixed(2)}:\n`;
        Object.entries(subMap).forEach(([sub, entries]) => {
          const subTotal = entries.reduce((s, e) => s + e.amount, 0);
          const entryList = entries.sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => {
            const d = format(new Date(e.date), "M/d");
            const note = e.notes ? ` (${e.notes})` : "";
            return `${e.amount.toFixed(2)} (${d}${note})`;
          }).join(" + ");
          text += sub === "(no subcategory)" ? `  ${entryList}\n` : `  [${sub}: $${subTotal.toFixed(2)}]: ${entryList}\n`;
        });
        text += "\n";
      });
      text += "--- DETAILED ENTRIES ---\n\n";
      const byDate = {};
      items.forEach(e => { const d = format(new Date(e.date), "yyyy-MM-dd"); if (!byDate[d]) byDate[d] = []; byDate[d].push(e); });
      Object.entries(byDate).sort(([a], [b]) => new Date(a) - new Date(b)).forEach(([dateStr, dayItems]) => {
        const dayLabel = format(new Date(dateStr), "M/d (EEE)");
        const dayTotal = dayItems.reduce((s, e) => s + e.amount, 0);
        text += `${dayLabel}  —  $${dayTotal.toFixed(2)}\n`;
        dayItems.forEach(e => {
          const sub = e.subcategory ? ` [${e.subcategory}]` : "";
          const note = e.notes ? `  "${e.notes}"` : "";
          text += `  • $${e.amount.toFixed(2)}  ${e.category}${sub}${note}\n`;
        });
        text += "\n";
      });
      text += "--- MONTHLY REFLECTION ---\n\n";
      text += reflMap[monthKey] ? `${reflMap[monthKey]}\n` : "(No reflection written for this month)\n";
      text += "\n";
    });
    const blob = new Blob([text.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "spending-export.txt"; a.click();
  };

  return (
    <PullToRefresh onRefresh={load}>
      <div className="min-h-screen bg-[#F7F7F5]">
        <div className="bg-white border-b border-gray-100 px-5 pb-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to={createPageUrl("Home")} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-base font-bold text-gray-900">All Entries</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSortBy(s => s === "date" ? "amount" : "date")} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors ${sortBy === "amount" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}>
                <ArrowDownUp className="w-3.5 h-3.5" />
                {sortBy === "amount" ? "By Amount" : "By Date"}
              </button>
              <button onClick={exportText} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-xl hover:bg-gray-100">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {["all", ...Object.keys(CATEGORIES)].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filterCat === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 py-5 space-y-6">
          {Object.entries(byMonth).map(([month, items]) => {
            const total = items.reduce((s, e) => s + e.amount, 0);
            const catTotals = {};
            items.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
            return (
              <div key={month}>
                <div className="bg-gray-900 text-white rounded-2xl px-4 py-3 mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold">{month}</h3>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="bg-white rounded-2xl px-4 py-2.5 mb-2 shadow-sm flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(catTotals).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => (
                    <div key={cat} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORIES[cat]?.color || "#ccc" }} />
                      <span className="text-xs text-gray-500">{cat}</span>
                      <span className="text-xs font-semibold text-gray-700">${amt.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
                  {items.map(e => {
                    const color = CATEGORIES[e.category]?.color || "#ccc";
                    return (
                      <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                        <div className="w-1 h-full self-stretch rounded-full mt-1" style={{ backgroundColor: color, minHeight: 36 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-xs text-gray-400">{format(new Date(e.date), "MMM d")}</span>
                            <span className="text-sm font-bold text-gray-900">${e.amount.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{e.category}{e.subcategory ? ` · ${e.subcategory}` : ""}</p>
                          {e.notes && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{e.notes}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditingExpense(e)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                          <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">No entries yet.</div>}
        </div>
        {editingExpense && <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSaved={load} />}
      </div>
    </PullToRefresh>
  );
}
