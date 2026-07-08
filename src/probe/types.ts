export type ProbeLayer = "intent" | "state" | "relationship";

export type ProbeTarget = "button" | "switch" | "slider" | "ambient";

export type ProbeStage =
  | "idle"
  | "emerging"
  | "presenting"
  | "awaiting"
  | "resolving"
  | "fading";

export type VehicleState = "driving" | "parked";

export type LocationType = "highway" | "urban" | "residential";

export interface MockContext {
  id: string;
  label: string;
  description: string;
  behavior: {
    recentDestinations: string[];
    currentTime: Date;
    dayOfWeek: number;
    isRoutineRoute: boolean;
  };
  environment: {
    vehicleState: VehicleState;
    locationType: LocationType;
  };
  relationship: {
    sessionCount: number;
    historicalAffinity: number;
  };
}

export interface ProbeHistory {
  totalProbes: number;
  accepted: number;
  denied: number;
  ignored: number;
  interrupted: number;
  failureStreak: number;
  lastProbeAt?: number;
  layerCounts: Record<ProbeLayer, number>;
}

export type ProbeFeedbackType = "accept" | "deny" | "ignore" | "interrupt" | "gaze";

export interface ProbeFeedbackSignal {
  id: number;
  type: ProbeFeedbackType;
  source: "silence" | "touch" | "voice" | "atomic-control" | "gaze";
  target?: ProbeTarget;
  at: number;
  note?: string;
}

export interface ProbeProposal {
  id: string;
  layer: ProbeLayer;
  target: ProbeTarget;
  title: string;
  message: string;
  hypothesis: string;
  confidence: number;
  rationale: string[];
  silenceMs: number;
  streamMsPerChar: number;
  createdAt: number;
  tone: "tentative" | "explicit" | "familiar";
  politeness: {
    assertiveness: number;
    canAutoAccept: boolean;
    cooldownMs: number;
    interruptionCost: "low" | "medium" | "high";
  };
}

export interface ProbeEvaluation {
  probe: ProbeProposal | null;
  reason: string;
  blockedByCooldown: boolean;
}

export interface ProbeResolution {
  feedback: ProbeFeedbackType;
  status: "accepted" | "denied" | "ignored" | "interrupted";
  displayText: string;
  alternativeText?: string;
  nextStrategy: "continue" | "cooldown" | "more-explicit" | "retreat";
}
