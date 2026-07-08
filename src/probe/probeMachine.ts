import type { ProbeStage } from "./types";

export type ProbeMachineEvent =
  | "PROBE_AVAILABLE"
  | "GAZE"
  | "PRESENT"
  | "STREAM_DONE"
  | "USER_INPUT"
  | "ACCEPT"
  | "DENY"
  | "IGNORE"
  | "SILENCE_TIMEOUT"
  | "RESOLVED"
  | "FADED"
  | "CANCEL";

export const probeMachineConfig = {
  id: "probeBubble",
  initial: "idle",
  states: {
    idle: {
      on: {
        PROBE_AVAILABLE: "emerging",
      },
    },
    emerging: {
      description: "底部轻微鼓起，等待注视或自然展开。",
      after: {
        650: "presenting",
      },
      on: {
        GAZE: "presenting",
        CANCEL: "fading",
      },
    },
    presenting: {
      description: "逐字流式上屏；任何输入都可视为用户已经听到。",
      on: {
        STREAM_DONE: "awaiting",
        USER_INPUT: "resolving",
      },
    },
    awaiting: {
      description: "完整文本与光标停留；沉默策略由 ProbeEngine 决定。",
      after: {
        SILENCE_TIMEOUT: "resolving",
      },
      on: {
        ACCEPT: "resolving",
        DENY: "resolving",
        IGNORE: "resolving",
      },
    },
    resolving: {
      description: "根据反馈显示确认、否认、忽略或中断后的收束语。",
      after: {
        1100: "fading",
      },
    },
    fading: {
      description: "平滑消失，不在主界面留下惩罚性痕迹。",
      after: {
        520: "idle",
      },
    },
  },
} as const;

export const transitionTable: Record<
  ProbeStage,
  Partial<Record<ProbeMachineEvent, ProbeStage>>
> = {
  idle: {
    PROBE_AVAILABLE: "emerging",
  },
  emerging: {
    GAZE: "presenting",
    PRESENT: "presenting",
    CANCEL: "fading",
  },
  presenting: {
    STREAM_DONE: "awaiting",
    USER_INPUT: "resolving",
  },
  awaiting: {
    ACCEPT: "resolving",
    DENY: "resolving",
    IGNORE: "resolving",
    SILENCE_TIMEOUT: "resolving",
  },
  resolving: {
    RESOLVED: "fading",
  },
  fading: {
    FADED: "idle",
  },
};

export function nextProbeStage(stage: ProbeStage, event: ProbeMachineEvent): ProbeStage {
  return transitionTable[stage][event] ?? stage;
}
