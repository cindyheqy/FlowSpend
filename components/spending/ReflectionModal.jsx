import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ReflectionModal({ monthStart, onClose, onSaved }) {
  const monthKey = format(monthStart, "yyyy-MM");
  const [text, setText] = useState("");
  const [existingId, setExistingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.MonthlyReflection.filter({ month_key: monthKey }).then(results => {
      if (results.length > 0) { setText(results[0].reflection || ""); setExistingId(results[0].id); }
    });
  }, [monthKey]);

  const handleSave = async () => {
    setSaving(true);
    if (existingId) {
      await base44.entities.MonthlyReflection.update(existingId, { reflection: text });
    } else {
      await base44.entities.MonthlyReflection.create({ month_key: monthKey, reflection: text });
    }
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Monthly Reflection</h3>
            <p className="text-xs text-gray-400">{format(monthStart, "MMMM yyyy")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <Textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="How was your spending this month? Any big purchases, savings wins, or things to do differently?"
          className="rounded-xl text-sm border-gray-200 resize-none min-h-[180px]" rows={8} />
        <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white">
          {saving ? "Saving..." : "Save Reflection"}
        </Button>
      </div>
    </div>
  );
}
