export type Confidence = "low" | "mid" | "high";
export type UserFeedback = "ignore" | "default" | "allow" | "correct";

export type Primitive =
  | "hint"
  | "probe"
  | "clarify"
  | "correct"
  | "suggest"
  | "preview"
  | "execute"
  | "maintain"
  | "withdraw";

export type Phase =
  | "idle"
  | "passive-visible"
  | "probe"
  | "confirm"
  | "correct"
  | "execute"
  | "maintain"
  | "undo"
  | "withdraw";

export interface PerceptionSignal {
  label: string;
  value: string;
  strength: number;
  aligned: boolean;
}

export interface ConfidenceScript {
  hypothesis: string;
  signals: PerceptionSignal[];
}

export interface CorrectionOption {
  id: string;
  label: string;
  acknowledgement: string;
  title: string;
  meta: string;
  resultCopy: string;
}

export interface IntentMorphCopy {
  lowClues: [string, string];
  midEvidence: [string, string];
  keyword: string;
  midPrefix: string;
  midSuffix: string;
  midSupport?: string;
  highPrefix: string;
  highSuffix: string;
  midActionCopy: string;
  actionHint: string;
}

export interface ScenarioConfig {
  id: string;
  title: string;
  hypothesis: string;
  passiveCopy: string;
  probeCopy: string;
  primaryAction: string;
  secondaryAction: string;
  confirmTitle: string;
  confirmMeta: string;
  confirmPrimary: string;
  confirmSecondary: string;
  resultCopy: string;
  resultMeta: string;
  undoCopy: string;
  intentMorph: IntentMorphCopy;
  corrections: CorrectionOption[];
  confidence: Confidence;
  expression: number;
  agency: number;
  confidenceScripts: Record<Confidence, ConfidenceScript>;
}
