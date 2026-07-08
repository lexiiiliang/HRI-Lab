import { motion } from "framer-motion";

export function AmbientField({ active, withdrawing, reducedMotion }: { active: boolean; withdrawing: boolean; reducedMotion: boolean }) {
  if (!active) return null;
  return (
    <div className="ambient-field" aria-hidden="true">
      <motion.div
        className="ambient-orbit ambient-orbit-a"
        initial={{ opacity: 0 }}
        animate={{ opacity: withdrawing ? 0 : 1, scale: reducedMotion ? 1 : withdrawing ? 0.97 : 1 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.7 }}
      />
      <motion.div className="route-trace" animate={{ opacity: withdrawing ? 0 : 1 }}>
        <span /><span /><span /><i />
      </motion.div>
    </div>
  );
}

