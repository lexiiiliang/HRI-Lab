import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Confidence, CorrectionOption, Phase, ScenarioConfig } from "../scenarios/types";
import { easing } from "../motion/tokens";

interface Props {
  phase: Phase;
  confidence: Confidence;
  scenario: ScenarioConfig;
  correction: CorrectionOption | null;
  visible: boolean;
  reducedMotion: boolean;
  onAdvance: () => void;
  onDefaultAccept: () => void;
  onReject: () => void;
  onAllow: () => void;
  onCorrect: () => void;
  onSelectCorrection: (option: CorrectionOption) => void;
  onUndo: () => void;
}

const confidenceRank: Record<Confidence, number> = { low: 0, mid: 1, high: 2 };

export function IntentBeacon(props: Props) {
  const { phase, scenario, correction, confidence } = props;
  const previousConfidence = useRef(confidence);
  const previous = previousConfidence.current;
  const descending = confidenceRank[confidence] < confidenceRank[previous];
  const buttonsRetracting = previous === "high" && confidence !== "high" && phase === "probe";
  const isResult = phase === "execute" || phase === "maintain";
  const title = correction?.title ?? scenario.confirmTitle;
  const meta = correction?.meta ?? scenario.confirmMeta;
  const SecondaryIcon = scenario.id === "charging-rest" ? ArrowRight : X;

  useEffect(() => {
    previousConfidence.current = confidence;
  }, [confidence]);

  const morphDuration = props.reducedMotion ? .12 : phase === "execute" ? .44 : phase === "maintain" ? .62 : descending ? .5 : confidence === "high" ? .72 : .62;
  const probeShape = confidence === "low"
    ? { width: 292, height: 62 }
    : confidence === "mid"
      ? { width: 468, height: 128 }
      : { width: 620, height: 142 };
  const shellShape = phase === "probe" || phase === "withdraw"
    ? probeShape
    : phase === "confirm"
      ? { width: 620, height: 142 }
      : phase === "correct"
        ? { width: 380, height: 126 }
        : phase === "execute"
          ? { width: 620, height: 142 }
          : phase === "maintain"
            ? { width: 390, height: 82 }
          : { width: 250, height: 62 };
  const slide = {
    initial: { opacity: 0, scale: .985 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: .985 },
    transition: { duration: props.reducedMotion ? .12 : .36, ease: easing },
  };

  return (
    <LayoutGroup id="intent-morph">
      <AnimatePresence>
        {props.visible ? (
          <motion.section
            key="intent-beacon"
            layout
            layoutId="intent-beacon-shell"
            className={`morph-capsule confidence-${confidence} state-${phase}`}
            style={{ minHeight: 0 }}
            initial={{ ...shellShape, opacity: 0, scale: .96 }}
            animate={{
              ...shellShape,
              opacity: phase === "withdraw" ? 0 : 1,
              scale: phase === "withdraw" ? .96 : 1,
            }}
            exit={{ opacity: 0, scale: .96 }}
            transition={{
              duration: morphDuration,
              delay: buttonsRetracting && !props.reducedMotion ? .2 : 0,
              ease: easing,
              layout: { duration: morphDuration, ease: easing },
            }}
            aria-live="polite"
          >
            <motion.span layout className="capsule-backdrop" aria-hidden="true" />
            <AnimatePresence mode="popLayout" initial={false}>
              {phase === "probe" ? (
                <motion.div key="intent-morph" layout layoutId="intent-morph-body" className="intent-morph-body">
                  <div className="intent-copy-stage">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {confidence === "low" ? (
                      <motion.div key="clues" layout className="low-intent-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .22 }}>
                        <div className="intent-clues">
                          <motion.i className="evidence-pulse" initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: .7 }} />
                          {scenario.intentMorph.lowClues.map((clue, index) => (
                            <motion.span
                              key={clue}
                              layout
                              layoutId={`evidence-${scenario.id}-${index}`}
                              className="evidence-token"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: index === 0 ? .76 : .6 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: props.reducedMotion ? .12 : .4, ease: easing }}
                            >{clue}</motion.span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="statement"
                        layout
                        className={`intent-statement ${confidence === "high" ? "is-question is-waiting" : "is-hypothesis"}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: props.reducedMotion ? .12 : .46, delay: descending ? .1 : .12, ease: easing }}
                      >
                        <AnimatePresence>
                          {confidence === "mid" ? (
                            <motion.div key="evidence-cluster" layout className="evidence-cluster" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35, ease: easing }}>
                              {scenario.intentMorph.midEvidence.map((evidence, index) => (
                                <motion.span key={evidence} layout layoutId={`evidence-${scenario.id}-${index}`} className="evidence-token is-aligned">{evidence}</motion.span>
                              ))}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                        <motion.p layout className="intent-line">
                          <AnimatePresence initial={false} mode="popLayout">
                            <motion.span key={`${confidence}-prefix`} layout className="semantic-addon" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} exit={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} transition={{ duration: props.reducedMotion ? .12 : .5, ease: easing }}>
                              {confidence === "mid" ? scenario.intentMorph.midPrefix : scenario.intentMorph.highPrefix}
                            </motion.span>
                          </AnimatePresence>
                          <motion.span layout layoutId={`intent-keyword-${scenario.id}`} className="intent-keyword">{scenario.intentMorph.keyword}</motion.span>
                          <AnimatePresence initial={false} mode="popLayout">
                            <motion.span key={`${confidence}-suffix`} layout className="semantic-addon" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} exit={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} transition={{ duration: props.reducedMotion ? .12 : .56, delay: confidence === "high" ? .1 : .04, ease: easing }}>
                              {confidence === "mid" ? scenario.intentMorph.midSuffix : scenario.intentMorph.highSuffix}
                            </motion.span>
                          </AnimatePresence>
                        </motion.p>
                        <AnimatePresence>
                          {confidence === "mid" && scenario.intentMorph.midSupport ? (
                            <motion.p key="support" layout className="intent-support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: .16, duration: .34, ease: easing }}>{scenario.intentMorph.midSupport}</motion.p>
                          ) : null}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>

                  <motion.div layout className={`intent-actions level-${confidence}`}>
                    <motion.button
                      layout
                      layoutId="primary-action"
                      className="intent-action-track intent-primary"
                      animate={{ width: confidence === "low" ? 46 : confidence === "mid" ? 122 : 188 }}
                      transition={{ width: { duration: props.reducedMotion ? .12 : .64, ease: easing }, layout: { duration: props.reducedMotion ? .12 : .64, ease: easing } }}
                      onClick={confidence === "high" ? props.onDefaultAccept : props.onAdvance}
                      whileTap={props.reducedMotion ? undefined : { scale: .97 }}
                      aria-label={confidence === "low" ? `查看${scenario.intentMorph.midActionCopy}` : confidence === "mid" ? `查看${scenario.intentMorph.midActionCopy}` : `${scenario.primaryAction}，${scenario.intentMorph.actionHint}`}
                    >
                      <motion.span layout className="action-orb"><ArrowUpRight size={confidence === "low" ? 18 : 17} strokeWidth={1.8} /></motion.span>
                      <AnimatePresence initial={false} mode="popLayout">
                        {confidence !== "low" ? (
                          <motion.span key={confidence} className={`action-copy ${confidence === "mid" ? "is-single" : ""}`} initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} exit={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} transition={{ delay: props.reducedMotion ? 0 : .18, duration: props.reducedMotion ? .12 : .42, ease: easing }}>
                            <strong>{confidence === "mid" ? scenario.intentMorph.midActionCopy : scenario.primaryAction}</strong>
                            {confidence === "high" ? <small>{scenario.intentMorph.actionHint}</small> : null}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </motion.button>

                    <AnimatePresence initial={false}>
                      {confidence === "high" ? (
                        <motion.button
                          key="secondary-action"
                          className="intent-action-track intent-secondary"
                          initial={{ width: 40, opacity: 0 }}
                          animate={{ width: 122, opacity: 1 }}
                          exit={{ width: 40, opacity: 0 }}
                          transition={{ duration: props.reducedMotion ? .12 : .56, ease: easing }}
                          onClick={props.onReject}
                          whileTap={props.reducedMotion ? undefined : { scale: .97 }}
                          aria-label={scenario.secondaryAction}
                        >
                          <span className="action-orb"><SecondaryIcon size={16} strokeWidth={1.8} /></span>
                          <motion.span className="action-copy is-single" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} exit={{ opacity: 0 }} transition={{ delay: props.reducedMotion ? 0 : .18, duration: .36, ease: easing }}><strong>{scenario.secondaryAction}</strong></motion.span>
                        </motion.button>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ) : null}

              {phase === "confirm" ? (
                <motion.div key="confirm" layout layoutId="intent-morph-body" className="confirm-capsule beacon-state-card" {...slide}>
                  <div className="state-card-heading"><span className="state-icon-orb"><ArrowUpRight size={17} /></span><div className="confirm-copy"><strong>{title}</strong><span>{meta}</span></div></div>
                  <div className="confirm-rail">
                    <motion.button layoutId="primary-action" onClick={props.onAllow}><ArrowUpRight size={15} />{scenario.confirmPrimary}</motion.button>
                    <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .14 }} onClick={props.onCorrect}><SlidersHorizontal size={14} />{scenario.confirmSecondary}</motion.button>
                  </div>
                </motion.div>
              ) : null}

              {phase === "correct" ? (
                <motion.div key="correct" layout layoutId="intent-morph-body" className="correction-capsules beacon-state-card" {...slide}>
                  <div className="state-card-heading compact"><span className="state-icon-orb"><SlidersHorizontal size={16} /></span><strong>想怎么调整？</strong></div>
                  <div>{scenario.corrections.map((option, index) => <motion.button initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .07 }} key={option.id} onClick={() => props.onSelectCorrection(option)}>{option.label}</motion.button>)}</div>
                </motion.div>
              ) : null}

              {isResult ? (
                <motion.div key="result" layout layoutId="intent-morph-body" className={`result-capsule beacon-state-card ${phase === "execute" ? "is-executing" : "is-maintained"}`} {...slide}>
                  <motion.div layoutId="primary-action" className="result-main"><span className="result-orb"><Check size={16} /></span><div><strong>{correction?.resultCopy ?? scenario.resultCopy}</strong><small>{scenario.resultMeta}</small></div></motion.div>
                  <motion.button initial={{ opacity: 0, scale: .6, x: 12 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: .18 }} className="undo-orb" onClick={props.onUndo} aria-label="撤销"><RotateCcw size={16} /></motion.button>
                </motion.div>
              ) : null}

              {phase === "undo" ? <motion.div key="undo" layout layoutId="intent-morph-body" className="undo-capsule beacon-state-card" {...slide}><span><RotateCcw size={14} /></span>{scenario.undoCopy}</motion.div> : null}
            </AnimatePresence>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
