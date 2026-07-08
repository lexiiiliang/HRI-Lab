import type { MockContext } from "../probe/types";

export interface MockContextPreset {
  id: string;
  name: string;
  context: MockContext;
}

export const mockContextPresets: MockContextPreset[] = [
  {
    id: "evening-commute",
    name: "城市晚高峰",
    context: {
      id: "evening-commute",
      label: "城市晚高峰",
      description: "例行路线、城市驾驶、亲密度中等；适合意图试探。",
      behavior: {
        recentDestinations: ["公司园区", "家", "常去咖啡店"],
        currentTime: new Date("2026-07-01T18:24:00+08:00"),
        dayOfWeek: 3,
        isRoutineRoute: true,
      },
      environment: {
        vehicleState: "driving",
        locationType: "urban",
      },
      relationship: {
        sessionCount: 5,
        historicalAffinity: 0.58,
      },
    },
  },
  {
    id: "highway-fatigue",
    name: "高速沉默",
    context: {
      id: "highway-fatigue",
      label: "高速沉默",
      description: "高速驾驶、用户沉默、打断成本高；适合状态试探。",
      behavior: {
        recentDestinations: ["杭州", "服务区", "上海"],
        currentTime: new Date("2026-07-01T21:12:00+08:00"),
        dayOfWeek: 3,
        isRoutineRoute: false,
      },
      environment: {
        vehicleState: "driving",
        locationType: "highway",
      },
      relationship: {
        sessionCount: 2,
        historicalAffinity: 0.36,
      },
    },
  },
  {
    id: "parked-rest",
    name: "停车休息",
    context: {
      id: "parked-rest",
      label: "停车休息",
      description: "车辆停稳、长期亲密度高；适合关系试探。",
      behavior: {
        recentDestinations: ["家", "健身房", "常去餐厅"],
        currentTime: new Date("2026-07-01T22:04:00+08:00"),
        dayOfWeek: 3,
        isRoutineRoute: false,
      },
      environment: {
        vehicleState: "parked",
        locationType: "residential",
      },
      relationship: {
        sessionCount: 11,
        historicalAffinity: 0.82,
      },
    },
  },
  {
    id: "new-user",
    name: "新用户低信任",
    context: {
      id: "new-user",
      label: "新用户低信任",
      description: "上下文弱、亲密度低；适合保守试探。",
      behavior: {
        recentDestinations: ["机场"],
        currentTime: new Date("2026-07-01T09:16:00+08:00"),
        dayOfWeek: 3,
        isRoutineRoute: false,
      },
      environment: {
        vehicleState: "driving",
        locationType: "urban",
      },
      relationship: {
        sessionCount: 1,
        historicalAffinity: 0.14,
      },
    },
  },
];

export function getPresetContext(id: string): MockContext {
  const preset = mockContextPresets.find((item) => item.id === id) ?? mockContextPresets[0];

  return {
    ...preset.context,
    behavior: {
      ...preset.context.behavior,
      currentTime: new Date(preset.context.behavior.currentTime),
      recentDestinations: [...preset.context.behavior.recentDestinations],
    },
    environment: {
      ...preset.context.environment,
    },
    relationship: {
      ...preset.context.relationship,
    },
  };
}
