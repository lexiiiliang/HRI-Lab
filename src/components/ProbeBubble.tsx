import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Hand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { nextProbeStage, type ProbeMachineEvent } from "../probe/probeMachine";
import type {
  ProbeFeedbackSignal,
  ProbeFeedbackType,
  ProbeProposal,
  ProbeResolution,
  ProbeStage,
} from "../probe/types";

interface ProbeBubbleProps {
  probe: ProbeProposal | null;
  resolution: ProbeResolution | null;
  externalFeedback: ProbeFeedbackSignal | null;
  onFeedback: (feedback: Omit<ProbeFeedbackSignal, "id" | "at">) => void;
  onStageChange: (stage: ProbeStage) => void;
  onTransitionLog: (message: string) => void;
  onFinished: () => void;
}

const stageLabel: Record<ProbeStage, string> = {
  idle: "idle",
  emerging: "emerging",
  presenting: "presenting",
  awaiting: "awaiting",
  resolving: "resolving",
  fading: "fading",
};

export function ProbeBubble({
  probe,
  resolution,
  externalFeedback,
  onFeedback,
  onStageChange,
  onTransitionLog,
  onFinished,
}: ProbeBubbleProps) {
  const [stage, setStage] = useState<ProbeStage>("idle");
  const [displayed, setDisplayed] = useState("");
  const consumedExternalId = useRef<number | null>(null);
  const stageRef = useRef<ProbeStage>("idle");

  const transitionTo = useCallback(
    (event: ProbeMachineEvent, explicitTarget?: ProbeStage) => {
      const current = stageRef.current;
      const next = explicitTarget ?? nextProbeStage(current, event);

      if (next === current) {
        return;
      }

      stageRef.current = next;
      setStage(next);

      const message = `[ProbeBubble] ${current} --${event}--> ${next}`;
      console.log(message, { probeId: probe?.id });
      onTransitionLog(message);
      onStageChange(next);
    },
    [onStageChange, onTransitionLog, probe?.id],
  );

  const resolveWith = useCallback(
    (
      type: ProbeFeedbackType,
      source: ProbeFeedbackSignal["source"],
      event: ProbeMachineEvent,
      target?: ProbeFeedbackSignal["target"],
      note?: string,
    ) => {
      if (!probe || stage === "idle" || stage === "resolving" || stage === "fading") {
        return;
      }

      transitionTo(event, "resolving");
      onFeedback({ type, source, target, note });
    },
    [onFeedback, probe, stage, transitionTo],
  );

  useEffect(() => {
    if (!probe) {
      setDisplayed("");
      stageRef.current = "idle";
      setStage("idle");
      onStageChange("idle");
      return;
    }

    setDisplayed("");
    consumedExternalId.current = null;
    stageRef.current = "emerging";
    setStage("emerging");
    onStageChange("emerging");
    console.log("[ProbeBubble] idle --PROBE_AVAILABLE--> emerging", { probeId: probe.id });
    onTransitionLog("[ProbeBubble] idle --PROBE_AVAILABLE--> emerging");
  }, [onStageChange, onTransitionLog, probe]);

  useEffect(() => {
    if (!probe) {
      return;
    }

    if (stage === "emerging") {
      const timer = window.setTimeout(() => transitionTo("PRESENT", "presenting"), 650);
      return () => window.clearTimeout(timer);
    }

    if (stage === "presenting") {
      if (displayed.length >= probe.message.length) {
        const timer = window.setTimeout(() => transitionTo("STREAM_DONE", "awaiting"), 120);
        return () => window.clearTimeout(timer);
      }

      const timer = window.setTimeout(() => {
        setDisplayed(probe.message.slice(0, displayed.length + 1));
      }, probe.streamMsPerChar);
      return () => window.clearTimeout(timer);
    }

    if (stage === "awaiting") {
      const timer = window.setTimeout(() => {
        if (probe.politeness.canAutoAccept) {
          resolveWith("accept", "silence", "SILENCE_TIMEOUT", probe.target, "silence-auto-accept");
        } else {
          resolveWith("ignore", "silence", "SILENCE_TIMEOUT", probe.target, "silence-as-ignore");
        }
      }, probe.silenceMs);
      return () => window.clearTimeout(timer);
    }

    if (stage === "resolving") {
      const timer = window.setTimeout(() => transitionTo("RESOLVED", "fading"), 1100);
      return () => window.clearTimeout(timer);
    }

    if (stage === "fading") {
      const timer = window.setTimeout(() => {
        transitionTo("FADED", "idle");
        onFinished();
      }, 520);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [displayed, onFinished, probe, resolveWith, stage, transitionTo]);

  useEffect(() => {
    if (!externalFeedback || consumedExternalId.current === externalFeedback.id || !probe) {
      return;
    }

    consumedExternalId.current = externalFeedback.id;

    if (stage === "emerging" && externalFeedback.type === "gaze") {
      transitionTo("GAZE", "presenting");
      return;
    }

    if (stage === "presenting") {
      resolveWith(
        "interrupt",
        externalFeedback.source,
        "USER_INPUT",
        externalFeedback.target,
        externalFeedback.note,
      );
      return;
    }

    if (stage === "awaiting") {
      const feedbackType =
        externalFeedback.type === "gaze"
          ? "accept"
          : externalFeedback.target === probe.target
            ? "accept"
            : "deny";
      resolveWith(
        feedbackType,
        externalFeedback.source,
        feedbackType === "accept" ? "ACCEPT" : "DENY",
        externalFeedback.target,
        externalFeedback.note,
      );
    }
  }, [externalFeedback, probe, resolveWith, stage, transitionTo]);

  const text =
    stage === "resolving" || stage === "fading"
      ? resolution?.displayText ?? "收到。"
      : displayed;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <AnimatePresence>
        {probe && stage !== "idle" ? (
          <motion.div
            key={probe.id}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{
              opacity: stage === "fading" ? 0 : 1,
              y: stage === "emerging" ? 18 : 0,
              scale: stage === "emerging" ? 0.86 : 1,
              width: stage === "emerging" ? 170 : "min(760px, 100%)",
            }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onMouseEnter={() => {
              if (stage === "emerging") {
                transitionTo("GAZE", "presenting");
              }
            }}
            onClick={() => {
              if (stage === "presenting") {
                resolveWith("interrupt", "touch", "USER_INPUT", probe.target, "bubble-touch");
              }
            }}
            className="pointer-events-auto overflow-hidden rounded-[8px] border border-white/10 bg-[#f4f2ed] text-cockpit-ink shadow-probe"
          >
            {stage === "emerging" ? (
              <div className="flex h-12 items-center justify-center gap-2 text-sm font-medium text-cockpit-ink">
                <Eye size={17} aria-hidden="true" />
                <span>有个轻提示</span>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cockpit-ink/50">
                      {probe.layer} / {probe.target}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-cockpit-ink">{probe.title}</h3>
                  </div>
                  <span className="rounded-full bg-cockpit-ink px-2.5 py-1 text-xs text-cockpit-text">
                    {stageLabel[stage]}
                  </span>
                </div>

                <p className="min-h-[64px] text-pretty text-lg font-medium leading-8 text-cockpit-ink sm:text-xl">
                  {text}
                  {(stage === "presenting" || stage === "awaiting") && (
                    <span className="cursor-blink ml-1 inline-block h-6 w-[2px] translate-y-1 bg-cockpit-ink" />
                  )}
                </p>

                {resolution?.alternativeText && (stage === "resolving" || stage === "fading") ? (
                  <p className="mt-2 text-sm leading-6 text-cockpit-ink/65">{resolution.alternativeText}</p>
                ) : null}

                {stage === "awaiting" ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      title="明确接受"
                      onClick={() => resolveWith("accept", "touch", "ACCEPT", probe.target)}
                      className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-cockpit-ink px-4 text-sm font-semibold text-cockpit-text transition hover:bg-cockpit-panel2 focus:outline-none focus:ring-2 focus:ring-cockpit-teal"
                    >
                      <Check size={17} aria-hidden="true" />
                      可以
                    </button>
                    <button
                      type="button"
                      title="明确否认"
                      onClick={() => resolveWith("deny", "touch", "DENY", probe.target)}
                      className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-cockpit-ink/20 px-4 text-sm font-semibold text-cockpit-ink transition hover:bg-cockpit-ink/5 focus:outline-none focus:ring-2 focus:ring-cockpit-coral"
                    >
                      <X size={17} aria-hidden="true" />
                      不对
                    </button>
                    <button
                      type="button"
                      title="暂不回应"
                      onClick={() => resolveWith("ignore", "touch", "IGNORE", probe.target)}
                      className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-cockpit-ink/20 px-4 text-sm font-semibold text-cockpit-ink transition hover:bg-cockpit-ink/5 focus:outline-none focus:ring-2 focus:ring-cockpit-amber"
                    >
                      <Hand size={17} aria-hidden="true" />
                      先别
                    </button>
                    <span className="ml-auto text-xs text-cockpit-ink/55">
                      {probe.politeness.canAutoAccept ? "沉默会默认接受" : "沉默只记为忽略"} ·{" "}
                      {Math.round(probe.silenceMs / 100) / 10}s
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
