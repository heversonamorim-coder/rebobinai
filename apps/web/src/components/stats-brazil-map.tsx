import { BRAZIL_UF_PATHS, BRAZIL_VIEWBOX } from '../lib/brazil-map';

const UF_NAME: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

/**
 * Mapa do Brasil (choropleth) plotando os acessos por UF. Estados mais escuros
 * = mais acessos. Tooltip nativo por estado (via <title>). Ao lado, o ranking
 * dos estados. Derivado da geo do IP no servidor.
 */
export function StatsBrazilMap({ byUf }: { byUf: { uf: string; count: number }[] }) {
  const counts = new Map(byUf.map((u) => [u.uf, u.count]));
  const max = Math.max(1, ...byUf.map((u) => u.count));
  const hasData = byUf.length > 0;

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
      <svg viewBox={BRAZIL_VIEWBOX} className="w-full max-w-sm" role="img" aria-label="Mapa de acessos por estado">
        {Object.entries(BRAZIL_UF_PATHS).map(([uf, d]) => {
          const c = counts.get(uf) ?? 0;
          const opacity = c > 0 ? 0.25 + 0.75 * (c / max) : 1;
          return (
            <path
              key={uf}
              d={d}
              fill={c > 0 ? '#18E9FF' : '#1c1033'}
              fillOpacity={opacity}
              stroke="#0A0713"
              strokeWidth={1}
            >
              <title>{`${UF_NAME[uf] ?? uf}: ${c} acesso${c === 1 ? '' : 's'}`}</title>
            </path>
          );
        })}
      </svg>

      <div className="w-full md:max-w-[220px]">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan">por estado</p>
        {hasData ? (
          <ul className="space-y-2">
            {byUf.slice(0, 8).map((u) => (
              <li key={u.uf} className="flex items-center justify-between text-sm">
                <span className="text-glow">{UF_NAME[u.uf] ?? u.uf}</span>
                <span className="font-mono text-cyan">{u.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-dim">Sem dados de localização ainda.</p>
        )}
      </div>
    </div>
  );
}
