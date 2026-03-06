import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const THRESHOLD = 64;

  const onTouchStart = useCallback((e) => {
    if (window.scrollY === 0) startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY === 0) { setPulling(true); setPullY(Math.min(dy * 0.45, THRESHOLD + 16)); }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD) { setRefreshing(true); await onRefresh?.(); setRefreshing(false); }
    setPulling(false); setPullY(0); startY.current = null;
  }, [pullY, onRefresh]);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ position: "relative" }}>
      <div className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10 transition-opacity"
        style={{ top: pullY - 40, opacity: pulling || refreshing ? Math.min(pullY / THRESHOLD, 1) : 0 }}>
        <div className="bg-white rounded-full shadow-md p-2">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: `rotate(${(pullY / THRESHOLD) * 180}deg)`, transition: refreshing ? "none" : undefined }} />
        </div>
      </div>
      <div style={{ transform: pulling || refreshing ? `translateY(${pullY}px)` : "none", transition: pulling ? "none" : "transform 0.2s ease" }}>
        {children}
      </div>
    </div>
  );
}
