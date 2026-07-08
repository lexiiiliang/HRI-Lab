import type { Confidence, Phase, Primitive, ScenarioConfig } from "../scenarios/types";

export interface LogItem { id: number; time: string; text: string }
export interface PrototypeState {
  scenario: ScenarioConfig;
  phase: Phase;
  primitive: Primitive;
  confidence: Confidence;
  expression: number;
  agency: number;
  targetExpression: number;
  targetAgency: number;
  labOpen: boolean;
  correctionId: string | null;
  policyWeight: number;
  logs: LogItem[];
}

export type Action =
  | { type: "SCENARIO"; scenario: ScenarioConfig }
  | { type: "PHASE"; phase: Phase; primitive: Primitive; expression?: number; agency?: number; note?: string }
  | { type: "CONFIDENCE"; value: Confidence }
  | { type: "EXPRESSION" | "AGENCY"; value: number }
  | { type: "TOGGLE_LAB" }
  | { type: "SELECT_CORRECTION"; id: string | null }
  | { type: "POLICY_DOWN" }
  | { type: "LOG"; note: string };

const stamp = () => new Date().toLocaleTimeString("zh-CN", { hour12: false, minute: "2-digit", second: "2-digit" });
const log = (logs: LogItem[], text: string) => [{ id: Date.now() + Math.random(), time: stamp(), text }, ...logs].slice(0, 8);

export function createInitialState(scenario: ScenarioConfig): PrototypeState {
  return {
    scenario,
    phase: "probe",
    primitive: "probe",
    confidence: scenario.confidence,
    expression: 0.28,
    agency: 0.12,
    targetExpression: scenario.expression,
    targetAgency: scenario.agency,
    labOpen: false,
    correctionId: null,
    policyWeight: 1,
    logs: [{ id: 1, time: stamp(), text: `Intent Morph · ${scenario.confidence}` }],
  };
}

export function prototypeReducer(state: PrototypeState, action: Action): PrototypeState {
  switch (action.type) {
    case "SCENARIO":
      return { ...createInitialState(action.scenario), labOpen: state.labOpen, logs: log(state.logs, `场景 · ${action.scenario.title}`) };
    case "PHASE":
      return { ...state, phase: action.phase, primitive: action.primitive, expression: action.expression ?? state.expression, agency: action.agency ?? state.agency, logs: log(state.logs, action.note ?? `${state.phase} → ${action.phase}`) };
    case "CONFIDENCE": return { ...state, confidence: action.value };
    case "EXPRESSION": return { ...state, expression: action.value };
    case "AGENCY": return { ...state, agency: action.value };
    case "TOGGLE_LAB": return { ...state, labOpen: !state.labOpen };
    case "SELECT_CORRECTION": return { ...state, correctionId: action.id };
    case "POLICY_DOWN": return { ...state, policyWeight: Math.max(0, state.policyWeight - 0.2) };
    case "LOG": return { ...state, logs: log(state.logs, action.note) };
    default: return state;
  }
}
