// components/nodos/BatteryChart.tsx
export default function BatteryChart({ data }: { data: number[] }) {
  const width = 400, height = 140;
  const step = width / (data.length - 1);
  const toY = (v: number) => height - (v / 100) * height;

  const points = data.map((v, i) => `${i * step},${toY(v)}`).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  const trendingDown = data[data.length - 1] < data[0];
  const lineColor = trendingDown ? "#EF4444" : "#22C55E";

  const min = Math.min(...data);
  const max = Math.max(...data);
  const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Batería — últimos 7 días</h2>
          <p className="text-xs text-gray-500 mt-1">Nivel reportado en cada heartbeat.</p>
        </div>
        <span className={`text-sm font-semibold ${trendingDown ? "text-red-500" : "text-agrogreen-600"}`}>
          {data[data.length - 1]}%
        </span>
      </div>

      <div className="flex gap-2">
        {/* Eje Y */}
        <div className="flex flex-col justify-between text-xs text-gray-400 py-1 h-32">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        <div className="flex-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
            <defs>
              <linearGradient id="batteryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Líneas guía */}
            <line x1="0" y1={toY(100)} x2={width} y2={toY(100)} stroke="#F1F1EE" strokeWidth="1" />
            <line x1="0" y1={toY(50)} x2={width} y2={toY(50)} stroke="#F1F1EE" strokeWidth="1" />
            <line x1="0" y1={toY(0)} x2={width} y2={toY(0)} stroke="#F1F1EE" strokeWidth="1" />

            <polygon points={areaPoints} fill="url(#batteryFill)" />
            <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2.5" />
            {data.map((v, i) => (
              <circle key={i} cx={i * step} cy={toY(v)} r="3" fill={lineColor} />
            ))}
          </svg>

          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Hace 7 días</span>
            <span>Hoy</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Mínimo</p>
          <p className="text-sm font-semibold text-gray-800">{min}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Promedio</p>
          <p className="text-sm font-semibold text-gray-800">{avg}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Máximo</p>
          <p className="text-sm font-semibold text-gray-800">{max}%</p>
        </div>
      </div>

      {trendingDown && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-4">
          Caída sostenida — revisar si el panel solar está sucio o tapado.
        </p>
      )}
    </div>
  );
}