import { ChevronRight, X } from "lucide-react";
import type { Dispatch } from "react";
import { scenarios } from "../scenarios/data";
import type { Confidence, UserFeedback } from "../scenarios/types";
import type { Action, PrototypeState } from "../state/prototypeReducer";
import { ConfidenceSimulator } from "./ConfidenceSimulator";

interface Props {
  state: PrototypeState;
  dispatch: Dispatch<Action>;
  onFeedback: (value: UserFeedback) => void;
  confidenceRun: number;
  onConfidenceSelect: (value: Confidence) => void;
  onConfidenceComplete: (value: Confidence) => void;
}

export function LabPanel({ state, dispatch, onFeedback, confidenceRun, onConfidenceSelect, onConfidenceComplete }: Props) {
  return (
    <aside className="lab-panel" aria-label="实验控制台">
      <header className="lab-header"><div><span className="lab-mark" />实验控制台</div><button onClick={() => dispatch({ type: "TOGGLE_LAB" })} aria-label="收起控制台"><X size={17} /></button></header>
      <div className="lab-scroll">
        <LabSection title="场景">
          <div className="segmented two">{scenarios.map((item) => <button key={item.id} className={state.scenario.id === item.id ? "active" : ""} onClick={() => dispatch({ type: "SCENARIO", scenario: item })}>{item.title}</button>)}</div>
        </LabSection>
        <ConfidenceSimulator embedded scenario={state.scenario} confidence={state.confidence} runKey={confidenceRun} onSelect={onConfidenceSelect} onComplete={onConfidenceComplete} />
        <LabSection title="用户反馈">
          <div className="feedback-row feedback-four">
            <button onClick={() => onFeedback("ignore")}>忽略</button>
            <button onClick={() => onFeedback("default")}>默认接受</button>
            <button onClick={() => onFeedback("allow")}>明确允许</button>
            <button onClick={() => onFeedback("correct")}>澄清校正</button>
          </div>
        </LabSection>
        <LabSection title={`转换日志 · 策略权重 ${state.policyWeight.toFixed(1)}`}>
          <ol className="lab-logs">{state.logs.map((item) => <li key={item.id}><time>{item.time}</time><span>{item.text}</span></li>)}</ol>
        </LabSection>
      </div>
    </aside>
  );
}

function LabSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="lab-section"><h2>{title}</h2>{children}</section>; }
export function LabHandle({ onOpen }: { onOpen: () => void }) { return <button className="lab-handle" onClick={onOpen} aria-label="打开实验控制台"><span>LAB</span><ChevronRight size={15} /></button>; }
