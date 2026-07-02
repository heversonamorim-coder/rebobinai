export interface OsdProps {
  /** ex.: "● REC" (fica magenta se começar com ●) */
  left?: string;
  /** ex.: "SP · 0:00:31" */
  right?: string;
}

/** OSD de videocassete — overlay de rótulos/timecode no topo da tela. */
export function Osd({ left = '● REC', right = 'SP · 0:00:00' }: OsdProps) {
  return (
    <div className="rb-osd pointer-events-none absolute inset-x-0 top-6 flex justify-between px-6 sm:px-10">
      <span className={left.startsWith('●') ? 'rb-rec' : undefined}>{left}</span>
      <span>{right}</span>
    </div>
  );
}
