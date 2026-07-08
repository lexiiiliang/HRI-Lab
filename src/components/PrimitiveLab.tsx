import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { easing } from "../motion/tokens";

type Mode = "active" | "passive";
type PrimitiveId = "appear" | "awaken" | "approach" | "orient" | "hint" | "respond" | "probe" | "clarify" | "preview" | "execute";
type AppearVariant = "reveal" | "emerge";

interface PrimitiveSpec {
  stage: string;
  active: { id: PrimitiveId; label: string };
  passive: { id: PrimitiveId; label: string };
}

const stages: PrimitiveSpec[] = [
  { stage: "入场", active: { id: "appear", label: "出现" }, passive: { id: "awaken", label: "唤醒" } },
  { stage: "注意力建联", active: { id: "approach", label: "靠近" }, passive: { id: "orient", label: "定向（目标对齐）" } },
  { stage: "表意", active: { id: "hint", label: "提示（前置表达）" }, passive: { id: "respond", label: "响应（后置反馈）" } },
  { stage: "协商", active: { id: "probe", label: "试探" }, passive: { id: "clarify", label: "澄清 / 校正" } },
  { stage: "行动", active: { id: "preview", label: "预演" }, passive: { id: "execute", label: "执行" } },
];

const traits: Record<PrimitiveId, { suffix: string; note: string; button: string }> = {
  appear: { suffix: "", note: "从背景进入 · 建立存在", button: "继续走" },
  awaken: { suffix: "", note: "恢复可感知状态", button: "继续走" },
  approach: { suffix: "", note: "信息关系逐渐靠近", button: "继续走" },
  orient: { suffix: "", note: "目标对齐 · 方向明确", button: "继续走" },
  hint: { suffix: " · 可以短暂停留", note: "前置释放一个方向", button: "继续走" },
  respond: { suffix: " · 保持当前路线", note: "承接操作 · 给出反馈", button: "继续走" },
  probe: { suffix: "，停一下吧？", note: "假设形成 · 等待接住", button: "继续走" },
  clarify: { suffix: "，只休息还是也充电？", note: "缩小歧义 · 保留校正", button: "只休息" },
  preview: { suffix: "，将短暂停留", note: "展示结果 · 尚未执行", button: "继续走" },
  execute: { suffix: " · 已加入行程", note: "状态改变 · 结果稳定", button: "已继续" },
};

const briefingVariants: Record<PrimitiveId, Variants> = {
  appear: { initial: { opacity: 0, filter: "blur(7px)", clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  awaken: { initial: { opacity: .18, filter: "blur(3px)", clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }, exit: { opacity: .18, clipPath: "inset(0 100% 0 0)" } },
  approach: { initial: { opacity: .25, filter: "blur(2px)", clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  orient: { initial: { opacity: .3, clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  hint: { initial: { opacity: 0, clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  respond: { initial: { opacity: .2, clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  probe: { initial: { opacity: 0, filter: "blur(4px)", clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  clarify: { initial: { opacity: .2, clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  preview: { initial: { opacity: .25, clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
  execute: { initial: { opacity: .35, clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" }, exit: { opacity: 0, clipPath: "inset(0 100% 0 0)" } },
};

function PrimitivePreview({ primitive, replay, reducedMotion, appearVariant }: { primitive: PrimitiveId; replay: number; reducedMotion: boolean; appearVariant: AppearVariant }) {
  const [probeChoice, setProbeChoice] = useState(0);
  const trait = traits[primitive];
  const isWaiting = primitive === "probe" || primitive === "clarify";
  const isFinal = primitive === "execute";
  const isPreview = primitive === "preview";
  const isCompact = primitive === "hint";
  const isEmerge = primitive === "appear" && appearVariant === "emerge";
  const isEntrance = primitive === "appear" || primitive === "awaken";
  const briefingVariant = isEmerge
    ? {
        initial: { opacity: reducedMotion ? 0 : .08, y: reducedMotion ? 0 : 9, filter: reducedMotion ? "blur(0px)" : "blur(12px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: reducedMotion ? 0 : 5, filter: reducedMotion ? "blur(0px)" : "blur(8px)" },
      }
    : briefingVariants[primitive];
  const buttonCopy = primitive === "probe" ? (probeChoice === 0 ? "继续走" : "停一下") : trait.button;

  useEffect(() => {
    if (primitive !== "probe" || reducedMotion) return undefined;
    setProbeChoice(0);
    const first = window.setTimeout(() => setProbeChoice(1), 1800);
    const second = window.setTimeout(() => setProbeChoice(0), 3600);
    return () => { window.clearTimeout(first); window.clearTimeout(second); };
  }, [primitive, replay, reducedMotion]);

  return (
    <div className="primitive-preview-stage">
      <motion.div layout className={`primitive-demo primitive-${primitive} ${isEmerge ? "is-emerge" : ""}`} transition={{ layout: { duration: .62, ease: easing } }}>
          {isEmerge && !reducedMotion ? <motion.i className="emerge-field" initial={{ opacity: 0, scaleX: .55 }} animate={{ opacity: [0, .36, 0], scaleX: [0.55, 1, 1.08] }} transition={{ duration: 1.15, ease: easing }} /> : null}
          <motion.div key={`briefing-${primitive}-${appearVariant}-${replay}`} layout className={`primitive-briefing ${isWaiting ? "is-waiting" : ""}`} variants={briefingVariant} initial="initial" animate="animate" transition={{ duration: isEmerge ? 1.02 : .86, ease: easing }}>
            <motion.span layout className="primitive-copy-line">
              <motion.b layout layoutId="primitive-core-copy">前方充电站</motion.b>
              <AnimatePresence initial={false} mode="popLayout">
                {trait.suffix ? <motion.em key={`${primitive}-${replay}`} initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} exit={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} transition={{ duration: .76, delay: .12, ease: easing }}>{trait.suffix}</motion.em> : null}
              </AnimatePresence>
            </motion.span>
          </motion.div>
          {primitive === "clarify" ? (
            <motion.div
              className="clarify-control"
              initial={{ width: 42, opacity: 0 }}
              animate={{ width: 190, opacity: 1 }}
              transition={{ duration: .72, delay: .86, ease: easing }}
              role="group"
              aria-label="选择休息或充电"
            >
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .36, delay: 1.18 }}><span>休息</span></motion.button>
              <motion.i initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: .32, delay: 1.08 }} />
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .36, delay: 1.28 }}><span>充电</span></motion.button>
            </motion.div>
          ) : (
          <motion.button
            layout
            className={`primitive-control ${isFinal ? "is-final" : ""} ${isPreview ? "is-preview" : ""}`}
            initial={primitive === "appear" ? { width: 42, opacity: isEmerge && !reducedMotion ? .08 : 0, y: isEmerge && !reducedMotion ? 7 : 0, filter: isEmerge && !reducedMotion ? "blur(8px)" : "blur(5px)" } : primitive === "awaken" ? { width: 42, opacity: .24, filter: "grayscale(1)" } : false}
            animate={{ width: isEntrance ? [42, 42, 132] : isCompact ? 42 : primitive === "probe" ? 154 : 132, opacity: isEntrance ? [primitive === "awaken" ? .24 : 0, 1, 1] : 1, y: 0, filter: "blur(0px) grayscale(0)" }}
            transition={isEntrance
              ? { duration: reducedMotion ? .18 : 1.02, delay: reducedMotion ? .12 : isEmerge ? 1 : .88, times: [0, .28, 1], ease: easing, layout: { duration: reducedMotion ? .12 : .66, ease: easing } }
              : { duration: .66, delay: trait.suffix ? .86 : .68, ease: easing, layout: { duration: .66, ease: easing } }}
            onClick={primitive === "probe" ? () => setProbeChoice((value) => value === 0 ? 1 : 0) : undefined}
          >
            <motion.span
              className="primitive-control-orb"
              layout
              animate={isPreview && !reducedMotion ? { x: [0, 5, 0] } : { x: 0 }}
              transition={isPreview && !reducedMotion ? { duration: .68, delay: 1.35, repeat: 2, repeatDelay: .22, ease: easing } : { duration: .12 }}
            >{isFinal ? <Check size={16} /> : <ArrowRight size={16} />}</motion.span>
            {primitive === "awaken" ? <motion.i className="awaken-ring" initial={{ opacity: 0, scale: .72 }} animate={{ opacity: [0, .5, 0], scale: [1, 1.42, 1.72] }} transition={{ duration: .82, delay: reducedMotion ? 0 : 1.02, ease: easing }} /> : null}
            <AnimatePresence mode="popLayout" initial={false}>
              {!isCompact ? <motion.strong
                key={`${primitive}-${appearVariant}-${buttonCopy}`}
                initial={primitive === "probe" ? { opacity: 0, y: 12 } : isEmerge ? { opacity: reducedMotion ? 0 : .08, filter: reducedMotion ? "blur(0px)" : "blur(6px)" } : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                animate={primitive === "probe" ? { opacity: 1, y: 0 } : isEmerge ? { opacity: 1, filter: "blur(0px)" } : { opacity: 1, clipPath: "inset(0 0 0 0)" }}
                exit={primitive === "probe" ? { opacity: 0, y: -12 } : isEmerge ? { opacity: 0, filter: reducedMotion ? "blur(0px)" : "blur(4px)" } : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                transition={{ duration: reducedMotion ? .12 : primitive === "probe" ? .38 : isEntrance ? .46 : isEmerge ? .76 : .46, delay: reducedMotion ? .2 : primitive === "probe" ? 0 : isEntrance ? (isEmerge ? 1.36 : 1.24) : isEmerge ? .08 : .18, ease: easing }}
              >{buttonCopy}</motion.strong> : null}
            </AnimatePresence>
          </motion.button>
          )}
        </motion.div>
    </div>
  );
}

export function PrimitiveLab({ reducedMotion }: { reducedMotion: boolean }) {
  const [mode, setMode] = useState<Mode>("active");
  const [stageIndex, setStageIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const [appearVariant, setAppearVariant] = useState<AppearVariant>("reveal");
  const primitive = stages[stageIndex][mode].id;
  const selection = stages[stageIndex][mode];
  const index = useMemo(() => stageIndex * 2 + (mode === "passive" ? 2 : 1), [stageIndex, mode]);

  return (
    <section className={`primitive-lab ${reducedMotion ? "reduce-motion" : ""}`} aria-label="行为原语动效试验台">
      <header className="primitive-lab-header">
        <div><h1>行为原语</h1><p>Briefing 文字与 UI 控件的动态特征试验台</p></div>
        <button className="replay-button" onClick={() => setReplay((value) => value + 1)}><RotateCcw size={14} />重播动效</button>
      </header>

      <div className="primitive-workspace">
        <aside className="primitive-index" aria-label="行为原语索引">
          <div className="primitive-axis-head"><span>交互阶段</span><span>主动</span><span>被动</span></div>
          {stages.map((stage, row) => (
            <div className={`primitive-index-row ${stageIndex === row ? "selected" : ""}`} key={stage.stage}>
              <span className="primitive-stage-name"><i>{String(row + 1).padStart(2, "0")}</i>{stage.stage}</span>
              <button className={stageIndex === row && mode === "active" ? "active" : ""} onClick={() => { setStageIndex(row); setMode("active"); setReplay((v) => v + 1); }}>{stage.active.label}</button>
              <button className={stageIndex === row && mode === "passive" ? "active" : ""} onClick={() => { setStageIndex(row); setMode("passive"); setReplay((v) => v + 1); }}>{stage.passive.label}</button>
            </div>
          ))}
        </aside>

        <main className="primitive-canvas">
          <div className="primitive-canvas-meta">
            <span>{stages[stageIndex].stage}</span><strong>{selection.label}</strong>
            {primitive === "appear" ? <div className="primitive-variant-switch" aria-label="出现动效方案">
              <button className={appearVariant === "reveal" ? "active" : ""} onClick={() => { setAppearVariant("reveal"); setReplay((value) => value + 1); }}>展开</button>
              <button className={appearVariant === "emerge" ? "active" : ""} onClick={() => { setAppearVariant("emerge"); setReplay((value) => value + 1); }}>浮起</button>
            </div> : null}
            <small>{String(index).padStart(2, "0")} / 10</small>
          </div>
          <PrimitivePreview primitive={primitive} replay={replay} reducedMotion={reducedMotion} appearVariant={appearVariant} />
          <div className="primitive-characteristics">
            <span>Briefing</span><p>{mode === "active" ? "系统前置表达，主动建立当前阶段的关系。" : "承接用户或环境变化，反馈当前阶段的系统状态。"}</p>
            <span>UI 控件</span><p>{primitive === "probe" ? "由图标水平生长为可回应胶囊，但不代替用户执行。" : primitive === "execute" ? "操作完成后收束为稳定结果，不继续争夺注意。" : "通过显著性、尺寸和完成度表达阶段差异。"}</p>
          </div>
        </main>
      </div>
    </section>
  );
}
