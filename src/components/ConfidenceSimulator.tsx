import { RotateCcw, X } from "lucide-react";
import type { Confidence, ScenarioConfig } from "../scenarios/types";

interface Props {
  scenario: ScenarioConfig;
  confidence: Confidence;
  runKey: number;
  onSelect: (level: Confidence) => void;
  onComplete: (level: Confidence) => void;
  onClose?: () => void;
  embedded?: boolean;
}

const labels: Record<Confidence, string> = { low: "低", mid: "中", high: "高" };

export function ConfidenceSimulator({ scenario, confidence, onSelect, onComplete, onClose, embedded = false }: Props) {
  const script = scenario.confidenceScripts[confidence];
  const choose = (level: Confidence) => {
    onSelect(level);
    onComplete(level);
  };

  return (
    <section className={`confidence-simulator ${embedded ? "is-embedded" : ""}`} aria-label="置信度模拟窗口">
      <header className="confidence-header">
        <div><span className={`confidence-dot level-${confidence}`} />置信度模拟</div>
        {!embedded && onClose ? <button onClick={onClose} aria-label="收起置信度模拟窗口"><X size={15} /></button> : null}
      </header>

      <div className="confidence-tabs" aria-label="置信度等级">
        {(["low", "mid", "high"] as Confidence[]).map((level) => (
          <button key={level} className={confidence === level ? "active" : ""} onClick={() => choose(level)}>{labels[level]}</button>
        ))}
      </div>

      <div className="signal-list">
        {script.signals.map((signal) => (
          <div className="signal-row" key={signal.label}>
            <div className="signal-copy"><span>{signal.label}</span><strong>{signal.value}</strong></div>
            <div className="signal-track"><span className={signal.aligned ? "aligned" : "divergent"} style={{ width: `${signal.strength * 100}%` }} /></div>
          </div>
        ))}
      </div>

      <footer className="confidence-result">
        <div><small>当前意图假设</small><strong>{script.hypothesis}</strong></div>
        <button onClick={() => choose(confidence)} aria-label="刷新当前置信度"><RotateCcw size={14} /></button>
      </footer>
    </section>
  );
}
