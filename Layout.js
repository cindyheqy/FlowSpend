import BottomNav from "./components/spending/BottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const pageTransition = {
  duration: 0.18,
  ease: "easeInOut",
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => document.documentElement.classList.toggle('dark', e.matches);
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname + location.search}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="pb-20"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
