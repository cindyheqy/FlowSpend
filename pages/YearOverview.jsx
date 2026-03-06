import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ChevronLeft, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { CATEGORIES } from "../components/spending/CategoryConfig";

export default function YearOverview() {
  const [expenses, setExpenses] = useState([]);
  const [expandedMonth, setExpandedMonth] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const yearParam = urlParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  useEffect(() => { base44.entities.Expense.list("-date", 1000).then(setExpenses); }, []);

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const yearExpenses = expenses.filter(e => { const d = new Date(e.date); return d >= yearStart && d <= yearEnd; });
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getMonthData = (monthDate) => {
    const ms = startOfMonth(monthDate);
    const me = endOfMonth(monthDate);
    const items = yearExpenses.filter(e => { const d = new Date(e.date); return d >= ms && d <= me; });
    const total = items.reduce((s, e) => s + e.amount, 0);
    const catTotals = {};
    items.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    return { total, catTotals };
  };

  const yearTotal = yearExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-gray-900 text-white px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px))" }}>
          <Link to={createPageUrl("Home")} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">{year} Overview</h1>
        </div>
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Year Total</p>
          <p className="text-3xl font-bold">${yearTotal.toFixed(2)}</p>
        </div>
      </div>
      <div className="px-5 py-5 space-y-3">
        {months.map(monthDate => {
          const key = format(monthDate, "yyyy-MM");
          const isExpanded = expandedMonth === key;
          const { total, catTotals } = getMonthData(monthDate);
          return (
            <div key={key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button onClick={() => setExpandedMonth(isExpanded ? null : key)} className="w-full flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}><ChevronDown className="w-4 h-4 text-gray-400" /></div>
                  <span className="text-sm font-semibold text-gray-900">{format(monthDate, "MMMM")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-gray-900">${total.toFixed(2)}</span>
                  <Link to={`${createPageUrl("Entries")}?month=${key}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  </Link>
                </div>
              </button>
              {isExpanded && total > 0 && (
                <div className="border-t border-gray-50 px-4 pb-4 pt-2 space-y-2">
                  {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                    const pct = total > 0 ? (amt / total) * 100 : 0;
                    const color = CATEGORIES[cat]?.color || "#ccc";
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-gray-600">{cat}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-800">${amt.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {isExpanded && total === 0 && <div className="border-t border-gray-50 px-4 py-3 text-xs text-gray-400 text-center">No entries this month</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
