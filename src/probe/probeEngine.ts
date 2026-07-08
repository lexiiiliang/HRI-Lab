import type {
  MockContext,
  ProbeEvaluation,
  ProbeFeedbackSignal,
  ProbeHistory,
  ProbeLayer,
  ProbeProposal,
  ProbeResolution,
  ProbeTarget,
} from "./types";

interface Candidate {
  layer: ProbeLayer;
  target: ProbeTarget;
  title: string;
  message: string;
  hypothesis: string;
  score: number;
  rationale: string[];
  interruptionCost: "low" | "medium" | "high";
}

export interface EvaluateOptions {
  force?: boolean;
}

export interface ProbeEngine {
  evaluate(
    context: MockContext,
    history: ProbeHistory,
    options?: EvaluateOptions,
  ): ProbeEvaluation;
  resolve(
    probe: ProbeProposal,
    feedback: ProbeFeedbackSignal,
    history: ProbeHistory,
  ): ProbeResolution;
  reduceHistory(
    history: ProbeHistory,
    probe: ProbeProposal,
    feedback: ProbeFeedbackSignal,
  ): ProbeHistory;
}

export const createInitialProbeHistory = (): ProbeHistory => ({
  totalProbes: 0,
  accepted: 0,
  denied: 0,
  ignored: 0,
  interrupted: 0,
  failureStreak: 0,
  layerCounts: {
    intent: 0,
    state: 0,
    relationship: 0,
  },
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const weekdayName = (day: number) => ["日", "一", "二", "三", "四", "五", "六"][day] ?? "三";

function createCandidates(context: MockContext): Candidate[] {
  const { behavior, environment, relationship } = context;
  const hour = behavior.currentTime.getHours();
  const isEvening = hour >= 17 && hour <= 22;
  const hasHome = behavior.recentDestinations.some((destination) =>
    /家|home/i.test(destination),
  );
  const hasOffice = behavior.recentDestinations.some((destination) =>
    /公司|office|园区/i.test(destination),
  );

  const candidates: Candidate[] = [];

  if (behavior.isRoutineRoute && (hasHome || hasOffice)) {
    candidates.push({
      layer: "intent",
      target: "button",
      title: "路线意图",
      message: isEvening
        ? "这像是你常走的回家路线。我先把目的地收敛到家，等你点一下再开始？"
        : "这像是你常走的通勤路线。我先把目的地收敛到公司，等你点一下再开始？",
      hypothesis: "用户可能正在重复一个高频导航意图。",
      score: 0.72 + (behavior.isRoutineRoute ? 0.12 : 0),
      rationale: [
        "recentDestinations 命中高频地点",
        `星期${weekdayName(behavior.dayOfWeek)} ${hour}:00 接近例行出行窗口`,
      ],
      interruptionCost: "medium",
    });
  }

  if (environment.vehicleState === "driving" && environment.locationType === "highway") {
    candidates.push({
      layer: "state",
      target: "button",
      title: "长途状态",
      message: "前方有服务区。你刚才安静了一段时间，我先把它作为短暂停靠点保留，可以吗？",
      hypothesis: "高速驾驶和沉默可能意味着疲劳、专注或休息需求。",
      score: 0.78,
      rationale: ["locationType=highway", "vehicleState=driving", "沉默被视为低置信信号"],
      interruptionCost: "high",
    });
  }

  if (
    environment.locationType === "urban" &&
    environment.vehicleState === "driving" &&
    relationship.sessionCount >= 3
  ) {
    candidates.push({
      layer: "intent",
      target: "switch",
      title: "空间节奏",
      message: "这段城市路你之前常切安静模式。我把播报压低一点，先试一小段？",
      hypothesis: "用户可能希望降低信息密度，而非完全关闭系统。",
      score: 0.64 + relationship.historicalAffinity * 0.18,
      rationale: ["城市驾驶信息密度高", "sessionCount 支持轻度个性化"],
      interruptionCost: "low",
    });
  }

  if (environment.vehicleState === "parked" && relationship.historicalAffinity >= 0.62) {
    candidates.push({
      layer: "relationship",
      target: "slider",
      title: "休息默契",
      message: "我们已经停稳了。我把座椅和灯光往休息位推一档，你感受一下？",
      hypothesis: "停车后的空间调整可以成为低风险关系试探。",
      score: 0.69 + relationship.historicalAffinity * 0.2,
      rationale: ["vehicleState=parked", "historicalAffinity 较高", "动作可逆且成本低"],
      interruptionCost: "low",
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      layer: "state",
      target: "ambient",
      title: "保守提示",
      message: "我先只把一个可能相关的建议放在这里，不自动执行。你有动作我就退下。",
      hypothesis: "上下文不足时，只做可忽略的低强度试探。",
      score: 0.42,
      rationale: ["没有强意图信号", "默认进入低主动性策略"],
      interruptionCost: "low",
    });
  }

  return candidates.sort((a, b) => b.score - a.score);
}

function deriveStreamMsPerChar(context: MockContext, history: ProbeHistory) {
  const isHighLoad =
    context.environment.vehicleState === "driving" &&
    context.environment.locationType === "highway";
  const affinityOffset = Math.round(context.relationship.historicalAffinity * 8);
  const failureOffset = history.failureStreak >= 2 ? 8 : 0;

  // TODO: 与用户讨论 - 是否应根据真实阅读速度/注视时长动态调整，而不是只按场景估算。
  return clamp((isHighLoad ? 46 : 36) + failureOffset - affinityOffset, 26, 58);
}

function deriveSilenceMs(context: MockContext, history: ProbeHistory, cost: Candidate["interruptionCost"]) {
  const vehicleOffset = context.environment.vehicleState === "driving" ? 700 : -300;
  const costOffset = cost === "high" ? 900 : cost === "medium" ? 350 : 0;
  const affinityOffset = Math.round(context.relationship.historicalAffinity * -450);
  const failureOffset = history.failureStreak >= 2 ? 900 : 0;

  // TODO: 与用户讨论 - 3 秒只是原型锚点；高速、低信任、连续失败时需要更长等待。
  return clamp(3000 + vehicleOffset + costOffset + affinityOffset + failureOffset, 2400, 6200);
}

function deriveCanAutoAccept(context: MockContext, history: ProbeHistory, candidate: Candidate) {
  if (history.failureStreak >= 3) {
    return false;
  }

  if (candidate.interruptionCost === "high") {
    return false;
  }

  if (context.relationship.historicalAffinity >= 0.72 && candidate.layer !== "intent") {
    return true;
  }

  // TODO: 与用户讨论 - 导航类意图是否允许沉默接受，可能需要按安全等级分层。
  return candidate.layer === "state" && candidate.target !== "button";
}

function deriveCooldownMs(context: MockContext, history: ProbeHistory) {
  const base = context.environment.vehicleState === "driving" ? 6000 : 3800;
  const failurePenalty = history.failureStreak * 1800;

  // TODO: 与用户讨论 - 礼貌不是固定冷却时间，后续可加入用户当前任务负载。
  return clamp(base + failurePenalty, 3200, 14000);
}

function decorateCandidate(
  context: MockContext,
  history: ProbeHistory,
  candidate: Candidate,
): ProbeProposal {
  const explicit = history.failureStreak >= 3;
  const familiar = context.relationship.historicalAffinity >= 0.74 && !explicit;
  const message = explicit
    ? `我说得更明确一点：${candidate.message.replace("可以吗？", "需要你明确点头或点按钮。")}`
    : candidate.message;

  return {
    id: `${context.id}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    layer: candidate.layer,
    target: candidate.target,
    title: candidate.title,
    message,
    hypothesis: candidate.hypothesis,
    confidence: clamp(candidate.score, 0, 0.96),
    rationale: candidate.rationale,
    silenceMs: deriveSilenceMs(context, history, candidate.interruptionCost),
    streamMsPerChar: deriveStreamMsPerChar(context, history),
    createdAt: Date.now(),
    tone: explicit ? "explicit" : familiar ? "familiar" : "tentative",
    politeness: {
      assertiveness: clamp(candidate.score - history.failureStreak * 0.12, 0.18, 0.88),
      canAutoAccept: deriveCanAutoAccept(context, history, candidate),
      cooldownMs: deriveCooldownMs(context, history),
      interruptionCost: candidate.interruptionCost,
    },
  };
}

export function createProbeEngine(): ProbeEngine {
  return {
    evaluate(context, history, options) {
      const now = Date.now();
      const cooldownMs = deriveCooldownMs(context, history);
      const sinceLast = history.lastProbeAt ? now - history.lastProbeAt : Number.POSITIVE_INFINITY;

      if (!options?.force && sinceLast < cooldownMs) {
        return {
          probe: null,
          reason: `礼貌冷却中：还需 ${Math.ceil((cooldownMs - sinceLast) / 1000)} 秒。`,
          blockedByCooldown: true,
        };
      }

      const candidates = createCandidates(context);
      const candidate =
        history.failureStreak >= 3
          ? candidates.find((item) => item.interruptionCost !== "high") ?? candidates[0]
          : candidates[0];

      return {
        probe: decorateCandidate(context, history, candidate),
        reason: `选择 ${candidate.layer}/${candidate.target}，置信度 ${Math.round(candidate.score * 100)}%。`,
        blockedByCooldown: false,
      };
    },

    resolve(probe, feedback, history) {
      if (feedback.type === "accept") {
        return {
          feedback: feedback.type,
          status: "accepted",
          displayText:
            feedback.source === "silence"
              ? "我先按这个轻轻执行。"
              : "收到，我就按这个方向来。",
          nextStrategy: "continue",
        };
      }

      if (feedback.type === "deny") {
        const shouldRetreat = history.failureStreak >= 2;
        return {
          feedback: feedback.type,
          status: "denied",
          displayText: "明白，这个判断不对。",
          alternativeText: shouldRetreat
            ? "我接下来会少主动一点，只保留明确可撤回的建议。"
            : `我换成更轻的方式：只提示“${probe.title}”，不默认执行。`,
          nextStrategy: shouldRetreat ? "retreat" : "more-explicit",
        };
      }

      if (feedback.type === "interrupt") {
        return {
          feedback: feedback.type,
          status: "interrupted",
          displayText: "听到了，我先不抢你的节奏。",
          alternativeText: "这次只记作“用户正在处理别的输入”，不当成否定。",
          nextStrategy: "cooldown",
        };
      }

      return {
        feedback: feedback.type,
        status: "ignored",
        displayText: probe.politeness.canAutoAccept ? "我先退下，不多说。" : "我先不执行，保持安静。",
        alternativeText:
          feedback.source === "silence" && !probe.politeness.canAutoAccept
            ? "这次沉默只记为忽略，因为当前策略需要明确反馈。"
            : undefined,
        nextStrategy: "cooldown",
      };
    },

    reduceHistory(history, probe, feedback) {
      const next: ProbeHistory = {
        ...history,
        lastProbeAt: Date.now(),
        layerCounts: {
          ...history.layerCounts,
        },
      };

      if (feedback.type === "accept") {
        next.accepted += 1;
        next.failureStreak = 0;
      } else if (feedback.type === "deny") {
        next.denied += 1;
        next.failureStreak += 1;
      } else if (feedback.type === "ignore") {
        next.ignored += 1;
        next.failureStreak += 1;
      } else if (feedback.type === "interrupt") {
        next.interrupted += 1;
      }

      next.layerCounts[probe.layer] += 1;
      return next;
    },
  };
}
