import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { easing } from "../motion/tokens";

interface Props {
  copy: string;
  visible: boolean;
  withdrawing: boolean;
  speed: number;
  reducedMotion: boolean;
  shimmer: boolean;
}

export function BriefingLine({ copy, visible, withdrawing, speed, reducedMotion, shimmer }: Props) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setComplete(reducedMotion);
  }, [copy, reducedMotion, visible]);

  const streamDuration = reducedMotion ? .12 : Math.max(.58, Array.from(copy).length * .065 / speed);

  return (
    <div className="briefing-wrap" aria-live="polite">
      <AnimatePresence>
        {visible ? (
          <motion.p
            key="briefing"
            className={`briefing-line ${shimmer && complete && !reducedMotion ? "is-shimmer" : ""}`}
            initial={{ opacity: 0, filter: "blur(4px)", y: reducedMotion ? 0 : 4 }}
            animate={{ opacity: withdrawing ? 0 : 1, filter: withdrawing ? "blur(4px)" : "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(5px)", y: reducedMotion ? 0 : -4 }}
            transition={{ duration: reducedMotion ? .12 : .32 / speed, ease: easing }}
          >
            <motion.span
              key={copy}
              className="streaming-copy"
              initial={reducedMotion ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)", opacity: .46, filter: "blur(1.8px)" }}
              animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: streamDuration, ease: "linear" }}
              onAnimationComplete={() => setComplete(true)}
            >
              {copy}
            </motion.span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

