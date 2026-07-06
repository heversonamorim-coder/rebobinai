/**
 * Gráfico dos últimos 7 dias: barras agrupadas por dia — acessos (magenta) e
 * únicos (ciano). Puro CSS/flex, responsivo, sem lib de gráfico.
 */
export function StatsWeeklyChart({ daily }: { daily: { day: string; total: number; unique: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.total));

  return (
    <div>
      <div className="flex items-end gap-2">
        {daily.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end justify-center gap-1">
              <div
                className="w-3 rounded-t bg-magenta"
                style={{ height: `${(d.total / max) * 100}%` }}
                title={`${d.total} acesso${d.total === 1 ? '' : 's'}`}
              />
              <div
                className="w-3 rounded-t bg-cyan"
                style={{ height: `${(d.unique / max) * 100}%` }}
                title={`${d.unique} único${d.unique === 1 ? '' : 's'}`}
              />
            </div>
            <span className="font-mono text-[0.6rem] text-dim">{ddmm(d.day)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-dim">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-magenta" /> acessos
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-cyan" /> únicos
        </span>
      </div>
    </div>
  );
}

function ddmm(day: string): string {
  const [, m, d] = day.split('-');
  return d && m ? `${d}/${m}` : day;
}
