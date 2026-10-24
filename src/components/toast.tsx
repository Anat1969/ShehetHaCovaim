import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";

const useToastStore = create<{ msg: string | null; key: number }>(() => ({ msg: null, key: 0 }));
let timer: ReturnType<typeof setTimeout> | undefined;

export function toast(msg: string) {
  useToastStore.setState((s) => ({ msg, key: s.key + 1 }));
  clearTimeout(timer);
  timer = setTimeout(() => useToastStore.setState({ msg: null }), 2400);
}

export function Toaster() {
  const { msg, key } = useToastStore();
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          key={key}
          role="status"
          className="toast"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
