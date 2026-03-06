import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Plus, List } from "lucide-react";

const tabs = [
  { label: "Home", icon: Home, page: "Home" },
  { label: "Add", icon: Plus, page: "Add" },
  { label: "Entries", icon: List, page: "Entries" },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 max-w-md mx-auto select-none" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-stretch h-16">
        {tabs.map(({ label, icon: Icon, page }) => {
          const href = createPageUrl(page);
          const active = location.pathname === href || location.pathname.startsWith(href + "?");
          return (
            <Link key={page} to={href} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
              {page === "Add" ? (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${active ? "bg-gray-900" : "bg-gray-100"}`}>
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`} />
                </div>
              ) : (
                <>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
