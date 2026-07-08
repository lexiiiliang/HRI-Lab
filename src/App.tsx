import { useReducedMotion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { IntentBeacon } from "./components/IntentBeacon";
import { LabHandle, LabPanel } from "./components/LabPanel";
import { PageSwitcher, type PrototypePage } from "./components/PageSwitcher";
import { PrimitiveLab } from "./components/PrimitiveLab";
import { scenarios } from "./scenarios/data";
import type { Confidence, CorrectionOption, UserFeedback } from "./scenarios/types";
import { createInitialState, prototypeReducer } from "./state/prototypeReducer";

export default function App() {
  const [state, dispatch] = useReducer(prototypeReducer, scenarios[0], createInitialState);
  const [confidenceRun, setConfidenceRun] = useState(0);
  const [page, setPage] = useState<PrototypePage>("probe");
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = Boolean(prefersReducedMotion);
  const correction = useMemo(() => state.scenario.corrections.find((item) => item.id === state.correctionId) ?? null, [state.correctionId, state.scenario.corrections]);

  const selectConfidence = useCallback((level: Confidence) => {
    setConfidenceRun((value) => value + 1);
    dispatch({ type: "CONFIDENCE", value: level });
    dispatch({ type: "SELECT_CORRECTION", id: null });
    const notes = { low: "线索浮现", mid: "线索聚合 · 假设成形", high: "语义补全 · 等待回应" };
    dispatch({ type: "PHASE", phase: "probe", primitive: level === "low" ? "hint" : "probe", expression: level === "low" ? .24 : level === "mid" ? .46 : .64, agency: level === "high" ? .22 : .1, note: `Intent Morph · ${notes[level]}` });
  }, []);

  const completeConfidence = useCallback((level: Confidence) => {
    dispatch({ type: "LOG", note: `信号脚本完成 · ${level}` });
  }, []);

  const feedback = useCallback((value: UserFeedback) => {
    if (value === "ignore") {
      dispatch({ type: "PHASE", phase: "withdraw", primitive: "withdraw", expression: .2, agency: .08, note: "沉默 / 忽略 → 自然回撤" });
      return;
    }
    if (value === "default") {
      dispatch({ type: "PHASE", phase: "confirm", primitive: "preview", expression: .7, agency: .34, note: "轻量正反馈 → 使用默认参数确认" });
      return;
    }
    if (value === "allow") {
      dispatch({ type: "PHASE", phase: "execute", primitive: "execute", expression: .84, agency: .86, note: "明确允许 → 执行" });
      return;
    }
    dispatch({ type: "PHASE", phase: "correct", primitive: "clarify", expression: .68, agency: .24, note: "澄清校正 → 更新理解" });
  }, []);

  const selectCorrection = useCallback((option: CorrectionOption) => {
    dispatch({ type: "SELECT_CORRECTION", id: option.id });
    dispatch({ type: "PHASE", phase: "confirm", primitive: "correct", expression: .7, agency: .32, note: `已校正 · ${option.label}` });
  }, []);

  const rejectProbe = useCallback(() => {
    dispatch({ type: "POLICY_DOWN" });
    dispatch({ type: "PHASE", phase: "withdraw", primitive: "withdraw", expression: .18, agency: .07, note: `${state.scenario.secondaryAction} → 回撤` });
  }, [state.scenario.secondaryAction]);

  const undo = useCallback(() => {
    dispatch({ type: "PHASE", phase: "undo", primitive: "withdraw", expression: .38, agency: .18, note: "用户撤销 → 恢复原任务" });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "l") dispatch({ type: "TOGGLE_LAB" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (state.phase === "withdraw") {
      const timer = window.setTimeout(() => dispatch({ type: "PHASE", phase: "probe", primitive: "hint", expression: .24, agency: .08, note: "回撤完成 · 返回当前线索" }), 720);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === "execute") {
      const timer = window.setTimeout(() => dispatch({ type: "PHASE", phase: "maintain", primitive: "maintain", expression: .4, agency: .72, note: "执行完成 → 可撤销" }), 760);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === "undo") {
      const timer = window.setTimeout(() => dispatch({ type: "PHASE", phase: "probe", primitive: "hint", expression: .24, agency: .1, note: "撤销完成" }), 1400);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [state.phase]);

  const beaconVisible = state.phase !== "idle";

  const changePage = (nextPage: PrototypePage) => {
    setPage(nextPage);
    if (nextPage === "primitives" && state.labOpen) dispatch({ type: "TOGGLE_LAB" });
  };

  return (
    <main className={`prototype ${page === "probe" && state.labOpen ? "lab-is-open" : ""} page-${page}`}>
      <section className="presentation" aria-label="试探性交互演示">
        <div className="topline">
          <PageSwitcher page={page} onChange={changePage} />
          {page === "probe" ? <div className="top-actions">
            <button className={state.labOpen ? "active" : ""} onClick={() => dispatch({ type: "TOGGLE_LAB" })}><FlaskConical size={16} /><span>实验</span></button>
          </div> : null}
        </div>
        {page === "probe" ? <div className="intent-stage">
          <IntentBeacon phase={state.phase} confidence={state.confidence} scenario={state.scenario} correction={correction} visible={beaconVisible} reducedMotion={reducedMotion} onAdvance={() => selectConfidence(state.confidence === "low" ? "mid" : "high")} onDefaultAccept={() => feedback("default")} onReject={rejectProbe} onAllow={() => feedback("allow")} onCorrect={() => feedback("correct")} onSelectCorrection={selectCorrection} onUndo={undo} />
        </div> : <PrimitiveLab reducedMotion={reducedMotion} />}
      </section>
      {page === "probe" ? (state.labOpen ? <LabPanel state={state} dispatch={dispatch} onFeedback={feedback} confidenceRun={confidenceRun} onConfidenceSelect={selectConfidence} onConfidenceComplete={completeConfidence} /> : <LabHandle onOpen={() => dispatch({ type: "TOGGLE_LAB" })} />) : null}
    </main>
  );
}
