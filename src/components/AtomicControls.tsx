import { BellOff, MapPinned, Moon, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { ProbeStage, ProbeTarget } from "../probe/types";

interface AtomicControlsProps {
  activeTarget?: ProbeTarget;
  probeStage: ProbeStage;
  onInput: (target: ProbeTarget, value: string) => void;
}

const targetRing: Record<ProbeTarget, string> = {
  button: "ring-cockpit-amber/80",
  switch: "ring-cockpit-teal/80",
  slider: "ring-cockpit-coral/80",
  ambient: "ring-cockpit-violet/80",
};

export function AtomicControls({ activeTarget, probeStage, onInput }: AtomicControlsProps) {
  const [stopSaved, setStopSaved] = useState(false);
  const [quietMode, setQuietMode] = useState(false);
  const [restLevel, setRestLevel] = useState(42);

  const isActive = (target: ProbeTarget) => activeTarget === target && probeStage !== "idle";

  return (
    <section className="min-h-[420px] rounded-[8px] border border-cockpit-line bg-cockpit-panel p-5 shadow-probe">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-cockpit-text">原子控件台</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-cockpit-muted">
            按钮、开关、滑块都可以成为试探的落点；交互会回流到 ProbeEngine。
          </p>
        </div>
        <div className="rounded-full border border-cockpit-line px-3 py-1 text-xs text-cockpit-muted">
          {probeStage}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <button
          type="button"
          title="保留或撤销导航停靠点"
          onClick={() => {
            setStopSaved((current) => !current);
            onInput("button", stopSaved ? "stop-removed" : "stop-saved");
          }}
          className={`flex min-h-[168px] flex-col justify-between rounded-[8px] border border-cockpit-line bg-cockpit-panel2 p-4 text-left transition hover:border-cockpit-amber/70 focus:outline-none focus:ring-2 ${
            isActive("button") ? `ring-2 ${targetRing.button}` : "focus:ring-cockpit-amber"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-cockpit-amber/15 text-cockpit-amber">
            <MapPinned size={23} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm text-cockpit-muted">按钮</span>
            <span className="mt-1 block text-xl font-semibold text-cockpit-text">
              {stopSaved ? "已保留停靠点" : "保留停靠点"}
            </span>
          </span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={quietMode}
          title="切换安静模式"
          onClick={() => {
            setQuietMode((current) => !current);
            onInput("switch", quietMode ? "quiet-off" : "quiet-on");
          }}
          className={`flex min-h-[168px] flex-col justify-between rounded-[8px] border border-cockpit-line bg-cockpit-panel2 p-4 text-left transition hover:border-cockpit-teal/70 focus:outline-none focus:ring-2 ${
            isActive("switch") ? `ring-2 ${targetRing.switch}` : "focus:ring-cockpit-teal"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-cockpit-teal/15 text-cockpit-teal">
            {quietMode ? <Moon size={23} aria-hidden="true" /> : <BellOff size={23} aria-hidden="true" />}
          </span>
          <span>
            <span className="block text-sm text-cockpit-muted">开关</span>
            <span className="mt-1 block text-xl font-semibold text-cockpit-text">
              {quietMode ? "安静模式开启" : "播报保持正常"}
            </span>
          </span>
          <span className="h-2 w-full rounded-full bg-cockpit-line">
            <span
              className={`block h-2 rounded-full transition-all ${
                quietMode ? "w-full bg-cockpit-teal" : "w-1/3 bg-cockpit-muted"
              }`}
            />
          </span>
        </button>

        <div
          className={`flex min-h-[168px] flex-col justify-between rounded-[8px] border border-cockpit-line bg-cockpit-panel2 p-4 transition ${
            isActive("slider") ? `ring-2 ${targetRing.slider}` : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-cockpit-coral/15 text-cockpit-coral">
              <SlidersHorizontal size={23} aria-hidden="true" />
            </span>
            <span className="text-2xl font-semibold text-cockpit-text">{restLevel}</span>
          </div>
          <label className="block">
            <span className="block text-sm text-cockpit-muted">滑块</span>
            <span className="mt-1 block text-xl font-semibold text-cockpit-text">休息位强度</span>
            <input
              className="range-control mt-6 w-full"
              type="range"
              min="0"
              max="100"
              value={restLevel}
              onChange={(event) => {
                setRestLevel(Number(event.target.value));
                onInput("slider", `rest-level-${event.target.value}`);
              }}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
