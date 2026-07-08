import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type PrototypePage = "probe" | "primitives";

interface Props {
  page: PrototypePage;
  onChange: (page: PrototypePage) => void;
}

const pages: Array<{ id: PrototypePage; label: string; note: string }> = [
  { id: "probe", label: "探索原型", note: "试探性交互" },
  { id: "primitives", label: "行为原语", note: "动效试验台" },
];

export function PageSwitcher({ page, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = pages.find((item) => item.id === page) ?? pages[0];

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div className="page-switcher" ref={root}>
      <button className="prototype-mark page-switcher-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu">
        <i />
        <span>HRI · {current.label}</span>
        <ChevronDown size={13} className={open ? "is-open" : ""} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div className="page-switcher-menu" role="menu" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: .18 }}>
            {pages.map((item) => (
              <button key={item.id} role="menuitem" className={page === item.id ? "active" : ""} onClick={() => { onChange(item.id); setOpen(false); }}>
                <span><strong>{item.label}</strong><small>{item.note}</small></span>
                {page === item.id ? <Check size={14} /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
