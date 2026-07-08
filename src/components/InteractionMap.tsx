export function InteractionMap({ expression, agency, targetExpression, targetAgency }: { expression: number; agency: number; targetExpression: number; targetAgency: number }) {
  const point = (x: number, y: number) => ({ cx: 22 + x * 196, cy: 146 - y * 116 });
  const current = point(expression, agency);
  const target = point(targetExpression, targetAgency);
  return (
    <div className="interaction-map">
      <svg viewBox="0 0 244 166" role="img" aria-label="表达强度与行动承诺二维矩阵">
        <rect x="22" y="84" width="118" height="50" rx="20" className="probe-zone" />
        <path d="M22 146H228M22 146V18" className="axis" />
        <path d={`M${current.cx} ${current.cy} Q${(current.cx + target.cx) / 2} ${Math.min(current.cy, target.cy) - 22} ${target.cx} ${target.cy}`} className="map-path" />
        <circle {...point(.12,.78)} r="3" className="map-dot muted" /><circle {...point(.28,.12)} r="3" className="map-dot muted" />
        <circle {...point(.82,.38)} r="3" className="map-dot muted" /><circle {...point(.86,.9)} r="3" className="map-dot muted" />
        <circle {...target} r="4" className="map-target" /><circle {...current} r="5" className="map-current" />
        <text x="26" y="157">低表达</text><text x="192" y="157">高表达</text><text x="4" y="22">高承诺</text>
      </svg>
      <div className="map-values"><span>表达 {Math.round(expression * 100)}</span><span>承诺 {Math.round(agency * 100)}</span></div>
    </div>
  );
}

