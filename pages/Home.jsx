import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, addMonths, subMonths, isAfter } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { SlidersHorizontal, ChevronRight, ChevronLeft, Plus, BookOpen, X, Pencil, Check } from "lucide-react";
import MonthSummaryBar from "../components/spending/MonthSummaryBar";
import PullToRefresh from "../components/spending/PullToRefresh";
import CategoryDrawer from "../components/spending/CategoryDrawer";
import EditExpenseModal from "../components/spending/EditExpenseModal";
import BudgetSettings from "../components/spending/BudgetSettings";
import ReflectionModal from "../components/spending/ReflectionModal";

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showBudgets, setShowBudgets] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [reflectionExists, setReflectionExists] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [nickname, setNickname] = useState(() => localStorage.getItem("spending_nickname") || "");
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");

  const loadData = async () => {
    const [exps, buds] = await Promise.all([
      base44.entities.Expense.list("-date", 500),
      base44.entities.Budget.list()
    ]);
    setExpenses(exps);
    setBudgets(buds);
  };

  const checkReflection = async () => {
    const now = new Date();
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    const prevMonthKey = format(startOfMonth(subMonths(now, 1)), "yyyy-MM");
    const neverNotify = localStorage.getItem("reflection_never_notify");
    if (!neverNotify && isAfter(now, prevMonthEnd)) {
      const results = await base44.entities.MonthlyReflection.filter({ month_key: prevMonthKey });
      const hasReflection = results.length > 0 && results[0].reflection;
      if (!hasReflection) {
        const dismissed = localStorage.getItem(`reflection_dismissed_${prevMonthKey}`);
        if (!dismissed) setShowBanner(true);
      }
    }
    const selKey = format(selectedMonth, "yyyy-MM");
    const selResults = await base44.entities.MonthlyReflection.filter({ month_key: selKey });
    setReflectionExists(selResults.length > 0 && !!selResults[0].reflection);
  };

  useEffect(() => { loadData(); checkReflection(); }, []);

  useEffect(() => {
    const selKey = format(selectedMonth, "yyyy-MM");
    base44.entities.MonthlyReflection.filter({ month_key: selKey }).then(results => {
      setReflectionExists(results.length > 0 && !!results[0].reflection);
    });
  }, [selectedMonth]);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(monthStart);
  const yearStart = startOfYear(monthStart);
  const yearEnd = endOfYear(monthStart);

  const monthExpenses = expenses.filter(e => { const d = new Date(e.date); return d >= monthStart && d <= monthEnd; });
  const yearExpenses = expenses.filter(e => { const d = new Date(e.date); return d >= yearStart && d <= yearEnd; });
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const yearTotal = yearExpenses.reduce((s, e) => s + e.amount, 0);

  const handleDelete = async (id) => {
    await base44.entities.Expense.delete(id);
    await loadData();
  };

  const bannerMonth = format(subMonths(new Date(), 1), "MMMM");
  const prevMonthKey = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM");

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="min-h-screen bg-[#F7F7F5]">
        {showBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-800">It's the end of {bannerMonth}, time to reflect!</p>
              <div className="flex gap-3 mt-1.5">
                <button onClick={() => { setShowBanner(false); setSelectedMonth(startOfMonth(subMonths(new Date(), 1))); setShowReflection(true); }} className="text-xs font-semibold text-amber-700 underline">Write now</button>
                <button onClick={() => { localStorage.setItem(`reflection_dismissed_${prevMonthKey}`, "1"); setShowBanner(false); }} className="text-xs text-amber-600">Remind later</button>
                <button onClick={() => { localStorage.setItem("reflection_never_notify", "1"); setShowBanner(false); }} className="text-xs text-amber-500">Never notify</button>
              </div>
            </div>
            <button onClick={() => { localStorage.setItem(`reflection_dismissed_${prevMonthKey}`, "1"); setShowBanner(false); }} className="p-1 rounded-full hover:bg-amber-100">
              <X className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>
        )}

        <div className="bg-gray-900 text-white px-5 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}>
          <div className="flex items-center justify-between mb-5">
            {editingNickname ? (
              <div className="flex items-center gap-2 flex-1 mr-3">
                <input autoFocus value={nicknameInput} onChange={e => setNicknameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { const s = nicknameInput.trim(); setNickname(s); localStorage.setItem("spending_nickname", s); setEditingNickname(false); }
                    if (e.key === "Escape") setEditingNickname(false);
                  }}
                  placeholder="e.g. Qingyi"
                  className="bg-white/10 text-white placeholder-white/40 rounded-xl px-3 py-1.5 text-sm font-medium outline-none border border-white/30 w-full"
                />
                <button onClick={() => { const s = nicknameInput.trim(); setNickname(s); localStorage.setItem("spending_nickname", s); setEditingNickname(false); }} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setNicknameInput(nickname); setEditingNickname(true); }} className="flex items-center gap-2 group">
                <h1 className="text-xl font-bold tracking-tight">{nickname ? `${nickname}'s Spending` : "Spending"}</h1>
                <Pencil className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
              </button>
            )}
            <button onClick={() => setShowBudgets(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3 mb-5">
            <button onClick={() => setSelectedMonth(m => subMonths(m, 1))} className="p-1 rounded-full hover:bg-white/20 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-base font-semibold">{format(monthStart, "MMMM yyyy")}</span>
            <button onClick={() => setSelectedMonth(m => addMonths(m, 1))} className="p-1 rounded-full hover:bg-white/20 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-xs text-white/60 uppercase tracking-widest mb-1">{format(monthStart, "MMM yyyy")}</p>
              <p className="text-2xl font-bold">${monthTotal.toFixed(2)}</p>
            </div>
            <Link to={`${createPageUrl("YearOverview")}?year=${format(monthStart, "yyyy")}`} className="bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition-colors">
              <p className="text-xs text-white/60 uppercase tracking-widest mb-1">{format(monthStart, "yyyy")} Total</p>
              <p className="text-2xl font-bold">${yearTotal.toFixed(2)}</p>
              <p className="text-xs text-white/40 mt-1">Tap to view ›</p>
            </Link>
          </div>
        </div>

        <div className="px-5 py-6">
          <Link to={createPageUrl("Add")} className="flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl p-5 shadow-sm transition-colors">
            <Plus className="w-5 h-5" />
            <span className="text-base font-semibold">Add Expense</span>
          </Link>
          <div className="flex items-center justify-between mb-4 mt-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">By Category</h2>
          </div>
          {monthExpenses.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-400 text-sm">No expenses this month.</p></div>
          ) : (
            <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
              <MonthSummaryBar expenses={monthExpenses} budgets={budgets} onCategoryClick={setActiveCategory} />
            </div>
          )}
          <Link to={createPageUrl("Entries")} className="mt-3 flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
            <span className="text-sm font-medium text-gray-700">All Entries</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <button onClick={() => setShowReflection(true)} className="mt-3 w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Monthly Reflection</span>
            </div>
            <div className="flex items-center gap-2">
              {reflectionExists && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Written</span>}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>

        {activeCategory && (
          <CategoryDrawer category={activeCategory} expenses={monthExpenses} onClose={() => setActiveCategory(null)}
            onEdit={(e) => { setEditingExpense(e); setActiveCategory(null); }}
            onDelete={async (id) => { await handleDelete(id); setActiveCategory(null); }}
          />
        )}
        {editingExpense && <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSaved={loadData} />}
        {showReflection && <ReflectionModal monthStart={monthStart} onClose={() => setShowReflection(false)} onSaved={() => { checkReflection(); setShowBanner(false); }} />}
        {showBudgets && <BudgetSettings onClose={() => { setShowBudgets(false); loadData(); }} />}
      </div>
    </PullToRefresh>
  );
}
