'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CountdownTimecode } from '../../components/countdown-timecode';
import { Lightbox } from '../../components/lightbox';
import { StoriesViewer } from '../../components/stories-viewer';
import { captureError, trackEvent } from '../../lib/analytics';
import {
  createGift,
  draftFromText,
  getGift,
  removeGiftAsset,
  updateGift,
  uploadGiftImageProgress,
  type DraftResult,
} from '../../lib/api';
import {
  OCCASIONS,
  assetUrl,
  clearDraftRef,
  daysSince,
  defaultCounterLabel,
  loadDraftRef,
  saveDraftRef,
  statChipText,
  statChipsFor,
  type DraftRef,
  type GiftAsset,
  type GiftCounter,
  type GiftPayload,
  type GiftStat,
  type TimelineItem,
} from '../../lib/gift';

/** Um upload em andamento (barra de progresso na seção de fotos). */
interface Upload {
  id: string;
  name: string;
  pct: number;
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// Ícone de troca (setas trocando) — usado no "trocar foto" do momento.
const SwapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M16 3l4 4-4 4" />
    <path d="M20 7H8a4 4 0 0 0-4 4" />
    <path d="M8 21l-4-4 4-4" />
    <path d="M4 17h12a4 4 0 0 0 4-4" />
  </svg>
);

const STEPS = [
  'Ocasião',
  'História',
  'Números',
  'Fotos',
  'Linha do tempo',
  'Trilha',
  'Capriche+',
  'Finalizar',
] as const;

// A prévia (stories) acompanha o passo atual: cada passo foca o slide da seção.
const STEP_FOCUS = [
  'cover',
  'cover',
  'wrapped',
  'photos',
  'timeline',
  'music',
  'closing',
  'cover',
] as const;

// Slides que a prévia pode focar ao editar um campo/extra.
type Focusable = 'cover' | 'wrapped' | 'closing' | 'roulette' | 'map' | 'astro';

// Limite de upload — precisa bater com o FileInterceptor da API (10MB).
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-panel px-4 py-3 text-glow placeholder:text-dim/60 focus:border-cyan focus:outline-none';
const labelClass = 'mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim';

export default function CriarPage() {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState('');
  const [payload, setPayload] = useState<GiftPayload>({});
  const [ref, setRef] = useState<DraftRef | null>(null);
  const [assets, setAssets] = useState<GiftAsset[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Se o usuário customizou o label do contador, a mudança de Ocasião não o
  // sobrescreve mais.
  const [counterLabelTouched, setCounterLabelTouched] = useState(false);
  // Foco de campo pode levar a prévia a um slide específico (ex.: no passo dos
  // números, o contador foca a capa e os cards focam o wrapped; no "Capriche+",
  // cada extra aberto foca seu slide).
  const [focusOverride, setFocusOverride] = useState<Focusable | null>(null);

  // Ao trocar de passo, o override de foco por campo é zerado.
  useEffect(() => {
    setFocusOverride(null);
  }, [step]);

  // Retoma um rascunho existente (guest-first, sem login).
  useEffect(() => {
    const existing = loadDraftRef();
    if (!existing) return;
    getGift(existing.id, existing.editToken)
      .then((g) => {
        if (g.status !== 'draft') {
          clearDraftRef();
          return;
        }
        setRef(existing);
        setOccasion(g.occasion ?? '');
        setPayload(g.payload ?? {});
        setAssets(g.assets ?? []);
        // Rascunho com label salvo → trata como já customizado.
        if (g.payload?.counter?.label) setCounterLabelTouched(true);
      })
      .catch(() => clearDraftRef());
  }, []);

  // Label default do contador segue a Ocasião — enquanto o usuário não editar.
  useEffect(() => {
    if (counterLabelTouched) return;
    setPayload((prev) => ({
      ...prev,
      counter: { ...prev.counter, label: defaultCounterLabel(occasion) },
    }));
  }, [occasion, counterLabelTouched]);

  function patch(p: Partial<GiftPayload>) {
    setPayload((prev) => ({ ...prev, ...p }));
  }

  function patchCounter(p: Partial<GiftCounter>) {
    setPayload((prev) => ({ ...prev, counter: { ...prev.counter, ...p } }));
  }

  // Compositor de IA: aplica o rascunho gerado sobre o formulário e avança
  // pra história, onde o cliente revisa o que a IA montou.
  function applyDraft(result: DraftResult) {
    if (result.occasion) setOccasion(result.occasion);
    setPayload((prev) => ({ ...prev, ...result.payload }));
    setStep(1);
  }

  function patchTimeline(items: TimelineItem[]) {
    setPayload((prev) => ({ ...prev, timeline: items }));
  }

  async function saveDraft(): Promise<DraftRef | null> {
    setSaving(true);
    setError(null);
    const input = { occasion: occasion || undefined, payload };
    try {
      if (ref) {
        await updateGift(ref.id, ref.editToken, input);
        return ref;
      }
      const gift = await createGift(input);
      const newRef = { id: gift.id, editToken: gift.editToken };
      setRef(newRef);
      saveDraftRef(newRef);
      return newRef;
    } catch (e) {
      // Observabilidade: é aqui que "alguém tenta criar e não consegue".
      captureError(e, { where: 'saveDraft', action: ref ? 'update' : 'create', occasion });
      trackEvent('gift_save_failed', { action: ref ? 'update' : 'create' });
      setError(e instanceof Error ? e.message : 'Não foi possível salvar o rascunho.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  /**
   * Sobe fotos com barra de progresso. Aceita novas fotos vindas do seletor,
   * do arrastar-e-soltar ou de um momento da linha do tempo. Devolve os assets
   * criados (a linha do tempo usa isso pra já vincular a foto ao momento).
   */
  async function uploadPhotos(files: File[]): Promise<GiftAsset[]> {
    // O upload precisa do rascunho já criado (para ter id + editToken).
    const current = ref ?? (await saveDraft());
    if (!current) return [];
    setError(null);
    const created: GiftAsset[] = [];
    for (const file of files) {
      const uid = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      setUploads((prev) => [...prev, { id: uid, name: file.name, pct: 0 }]);
      try {
        const asset = await uploadGiftImageProgress(current.id, current.editToken, file, (pct) =>
          setUploads((prev) => prev.map((u) => (u.id === uid ? { ...u, pct } : u))),
        );
        setAssets((prev) => [...prev, asset]);
        created.push(asset);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao enviar a foto.');
      } finally {
        setUploads((prev) => prev.filter((u) => u.id !== uid));
      }
    }
    return created;
  }

  async function removePhoto(assetId: string) {
    if (!ref) return;
    try {
      await removeGiftAsset(ref.id, ref.editToken, assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao remover a foto.');
    }
  }

  async function next() {
    // Ao entrar na prévia, garante o rascunho salvo.
    if (step === STEPS.length - 2) {
      const saved = await saveDraft();
      if (!saved) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Navegação direta por clique nos passos (barra/label). Ao pular pro passo
  // final, garante o rascunho salvo — igual ao fluxo do "finalizar".
  async function jumpTo(target: number) {
    if (target === step) return;
    if (target === STEPS.length - 1) {
      const saved = await saveDraft();
      if (!saved) return;
    }
    setStep(target);
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-5xl px-5 py-10 sm:py-16">
      <header className="mb-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-dim">
          <Link href="/" className="transition hover:text-cyan">
            <span className="rb-rew">◄◄</span> Rebobinaí
          </Link>{' '}
          · criar presente
        </p>
        <ProgressBar step={step} onJump={jumpTo} disabled={saving} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        {/* Coluna do formulário — min-w-0 deixa o conteúdo largo (ex.: a fileira
            de fotos) rolar na horizontal em vez de esticar a coluna e espremer a
            prévia. */}
        <div className="min-w-0">
          {error && (
            <p className="mb-6 rounded-lg border border-magenta/50 bg-magenta/10 px-4 py-3 text-sm text-glow">
              {error}
            </p>
          )}

      {step === 0 && (
        <Step title="Pra quem é o presente?" hint="Isso personaliza a rebobinada.">
          <AiComposer onDraft={applyDraft} />
          <div className="mb-5">
            <label className={labelClass} htmlFor="occasion">
              Ocasião
            </label>
            <select
              id="occasion"
              className={inputClass}
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            >
              <option value="">Escolha…</option>
              {OCCASIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Nome de quem vai receber"
            value={payload.recipientName ?? ''}
            onChange={(v) => patch({ recipientName: v })}
            placeholder="Ex.: Marina"
          />
          <Field
            label="Seu nome (de quem envia)"
            value={payload.senderName ?? ''}
            onChange={(v) => patch({ senderName: v })}
            placeholder="Ex.: João"
          />
          <Link
            href="/exemplos"
            className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan underline underline-offset-4"
          >
            ◄◄ ou comece de um exemplo pronto
          </Link>
        </Step>
      )}

      {step === 1 && (
        <Step
          title="Capa - A história de vocês"
          hint="Título e um recado curto — é o que aparece na capa da rebobinada."
        >
          <Field
            label="Título"
            value={payload.title ?? ''}
            onChange={(v) => patch({ title: v })}
            placeholder="Ex.: 4 anos rebobinando a gente"
          />
          <div className="mb-5">
            <label className={labelClass} htmlFor="letter">
              Recado curto
            </label>
            <textarea
              id="letter"
              maxLength={200}
              className={`${inputClass} min-h-28 resize-y`}
              value={payload.letter ?? ''}
              onChange={(e) => patch({ letter: e.target.value })}
              placeholder="Uma frase que abre a rebobinada. Ex.: Marina, cada capítulo com você virou meu preferido ◄◄"
            />
            <p className="mt-1 flex justify-between gap-3 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim/70">
              <span>curtinho — cabe na capa numa tela só</span>
              <span className={(payload.letter ?? '').length > 160 ? 'text-magenta' : ''}>
                {(payload.letter ?? '').length}/200
              </span>
            </p>
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step
          title="Os números de vocês"
          hint="Um contador da data e alguns números marcantes — tudo opcional."
        >
          <NumbersEditor
            occasion={occasion}
            counter={payload.counter}
            stats={payload.stats ?? []}
            labelTouched={counterLabelTouched}
            onCounter={patchCounter}
            onLabelTouched={() => setCounterLabelTouched(true)}
            onStats={(stats) => patch({ stats })}
            onFocusSlide={setFocusOverride}
          />
        </Step>
      )}

      {step === 3 && (
        <Step title="As fotos de vocês" hint="Elas dão vida à rebobinada. Arraste, ou suba do celular/computador.">
          <PhotoUploader
            assets={assets}
            uploads={uploads}
            onUpload={uploadPhotos}
            onRemove={removePhoto}
          />
        </Step>
      )}

      {step === 4 && (
        <Step title="Linha do tempo" hint="Momentos marcantes — opcional, mas emociona.">
          <TimelineEditor
            items={payload.timeline ?? []}
            onChange={patchTimeline}
            assets={assets}
            onUpload={uploadPhotos}
          />
        </Step>
      )}

      {step === 5 && (
        <Step title="A trilha sonora" hint="Cola o link da música de vocês (Spotify).">
          <Field
            label="Link da música (opcional)"
            value={payload.spotifyTrackUrl ?? ''}
            onChange={(v) => patch({ spotifyTrackUrl: v })}
            placeholder="https://open.spotify.com/track/…"
          />
        </Step>
      )}

      {step === 6 && (
        <Step
          title="Capriche+ na sua rebobinada"
          hint="Os passos anteriores já dão uma ótima rebobinada. Aqui é opcional — cada item vira um slide extra. Adicione só o que curtir."
        >
          <div className="space-y-3">
            <ExtraCard
              emoji="💌"
              title="Recado final"
              subtitle="Uma última mensagem, com foto"
              active={Boolean(payload.closingMessage?.trim() || payload.closingPhotoAssetId)}
              focusKind="closing"
              onFocus={setFocusOverride}
            >
              <div className="mb-4">
                <label className={labelClass} htmlFor="closing">
                  Recado de fechamento
                </label>
                <textarea
                  id="closing"
                  maxLength={280}
                  className={`${inputClass} min-h-28 resize-y`}
                  value={payload.closingMessage ?? ''}
                  onFocus={() => setFocusOverride('closing')}
                  onChange={(e) => patch({ closingMessage: e.target.value })}
                  placeholder="Ex.: Que venham muitos outros capítulos. Eu te amo ◄◄"
                />
              </div>
              <MomentPhoto
                selectedId={payload.closingPhotoAssetId}
                assets={assets}
                onSelect={(assetId) => patch({ closingPhotoAssetId: assetId })}
                onUpload={uploadPhotos}
              />
            </ExtraCard>

            <ExtraCard
              emoji="🎡"
              title="Roleta de sorteio"
              subtitle="O que vão fazer pra comemorar"
              active={(payload.roulette?.options ?? []).some((o) => o.trim())}
              focusKind="roulette"
              onFocus={setFocusOverride}
            >
              <RouletteEditor
                options={payload.roulette?.options ?? []}
                onChange={(options) => patch({ roulette: { options } })}
                onFocus={() => setFocusOverride('roulette')}
              />
            </ExtraCard>

            <ExtraCard
              emoji="🗺️"
              title="Onde se conheceram"
              subtitle="Um mapa do lugar que começou tudo"
              active={Boolean(payload.metPlace?.address?.trim())}
              focusKind="map"
              onFocus={setFocusOverride}
            >
              <label className={labelClass} htmlFor="metPlace">
                Endereço ou lugar
              </label>
              <input
                id="metPlace"
                className={inputClass}
                value={payload.metPlace?.address ?? ''}
                placeholder="Ex.: Parque Ibirapuera, São Paulo"
                onFocus={() => setFocusOverride('map')}
                onChange={(e) => patch({ metPlace: { address: e.target.value } })}
              />
              <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim/70">
                vira um slide com o mapa do local
              </p>
            </ExtraCard>

            <ExtraCard
              emoji="🔮"
              title="Mapa astral"
              subtitle="O signo da data de vocês"
              active={Boolean(payload.astro?.date)}
              focusKind="astro"
              onFocus={setFocusOverride}
            >
              <label className={labelClass} htmlFor="astroDate">
                Data (a que se conheceram, ou outra)
              </label>
              <input
                id="astroDate"
                type="date"
                className={inputClass}
                value={payload.astro?.date ?? ''}
                onFocus={() => setFocusOverride('astro')}
                onChange={(e) => patch({ astro: { date: e.target.value || undefined } })}
              />
              {payload.counter?.targetDate && payload.astro?.date !== payload.counter.targetDate && (
                <button
                  type="button"
                  onClick={() => {
                    patch({ astro: { date: payload.counter?.targetDate } });
                    setFocusOverride('astro');
                  }}
                  className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-cyan underline underline-offset-4"
                >
                  usar a data de início ({payload.counter.targetDate})
                </button>
              )}
            </ExtraCard>
          </div>
        </Step>
      )}

      {step === 7 && (
        <Step title="Seu presente está pronto ◄◄" hint="Confira a prévia ao lado. O link e o QR liberam após o pagamento.">
          <LockedLink />
        </Step>
      )}

          <div className="mt-8">
            {/* "rascunho salvo" numa linha própria acima, pra não empurrar os
                botões e quebrar linha no celular. */}
            {step < STEPS.length - 1 && ref && (
              <p className="mb-3 text-right font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim">
                rascunho salvo
              </p>
            )}
            <nav className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={back}
                disabled={step === 0 || saving}
                className="font-mono text-xs uppercase tracking-[0.2em] text-dim disabled:opacity-30"
              >
                ◄ voltar
              </button>

              {step < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={next}
                  disabled={saving}
                  className="rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'salvando…' : step === STEPS.length - 2 ? 'finalizar ►' : 'continuar ►'}
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Coluna da prévia ao vivo */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-3 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-magenta" />
            prévia ao vivo
          </p>
          <StoriesViewer
            payload={payload}
            occasion={occasion}
            assets={assets}
            watermark
            focus={focusOverride ?? STEP_FOCUS[step]}
          />
          <p className="mt-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/70">
            toque nas laterais pra navegar
          </p>
        </aside>
      </div>
    </main>
  );
}

function ProgressBar({
  step,
  onJump,
  disabled,
}: {
  step: number;
  onJump: (i: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 flex items-center gap-2">
      {STEPS.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onJump(i)}
          disabled={disabled}
          aria-current={i === step}
          aria-label={`Ir para o passo ${label}`}
          className="group flex-1 text-left disabled:opacity-50"
        >
          <div
            className={`h-1.5 rounded-full transition-colors ${
              i <= step ? 'bg-cyan' : 'bg-[var(--line)] group-hover:bg-cyan/40'
            }`}
            aria-hidden
          />
          <span
            className={`mt-2 block font-mono text-[0.6rem] uppercase tracking-[0.15em] transition-colors ${
              i === step ? 'text-cyan' : 'text-dim/60 group-hover:text-cyan'
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-glow">{title}</h2>
      {hint && <p className="mt-1 mb-6 text-sm text-dim">{hint}</p>}
      {children}
    </section>
  );
}

/** Item do menu "Capriche+": acordeão com um extra opcional da rebobinada. */
function ExtraCard({
  emoji,
  title,
  subtitle,
  active,
  focusKind,
  onFocus,
  children,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  active?: boolean;
  focusKind?: Focusable;
  onFocus?: (k: Focusable) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(Boolean(active));
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-panel/40">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && focusKind && onFocus) onFocus(focusKind); // prévia acompanha
        }}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-xl leading-none">{emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-glow">{title}</span>
          <span className="block text-xs text-dim">{subtitle}</span>
        </span>
        {active && (
          <span className="rounded-full bg-cyan/15 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-cyan">
            adicionado
          </span>
        )}
        <span className={`font-mono text-lg text-dim transition-transform ${open ? 'rotate-90' : ''}`}>
          ›
        </span>
      </button>
      {open && <div className="border-t border-[var(--line)] p-4">{children}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-5">
      <label className={labelClass}>{label}</label>
      <input
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Step "Os números de vocês": contador (data + label) + wrapped (stats). */
function NumbersEditor({
  occasion,
  counter,
  stats,
  labelTouched,
  onCounter,
  onLabelTouched,
  onStats,
  onFocusSlide,
}: {
  occasion: string;
  counter?: GiftCounter;
  stats: GiftStat[];
  labelTouched: boolean;
  onCounter: (p: Partial<GiftCounter>) => void;
  onLabelTouched: () => void;
  onStats: (stats: GiftStat[]) => void;
  /** Foca a prévia: contador → capa; números → wrapped. */
  onFocusSlide: (k: 'cover' | 'wrapped') => void;
}) {
  const targetDate = counter?.targetDate;
  const label = counter?.label ?? '';

  function setDate(date: string) {
    onCounter({ targetDate: date || undefined });
    const hasAuto = stats.some((s) => s.auto);
    // A stat automática nasce com a data e some quando ela é limpa.
    if (date && !hasAuto) {
      onStats([{ auto: 'days_since_counter', label: 'de nós dois' }, ...stats]);
    } else if (!date) {
      onStats(stats.filter((s) => !s.auto));
    }
  }

  function updateStat(i: number, p: Partial<GiftStat>) {
    onStats(stats.map((s, idx) => (idx === i ? { ...s, ...p } : s)));
  }
  function removeStat(i: number) {
    onStats(stats.filter((_, idx) => idx !== i));
  }
  function moveStat(i: number, dir: -1 | 1) {
    const j = i + dir;
    const a = stats[i];
    const b = stats[j];
    if (!a || !b || a.auto || b.auto) return;
    const arr = [...stats];
    arr[i] = b;
    arr[j] = a;
    onStats(arr);
  }
  function addChip(chip: GiftStat) {
    onStats([...stats, { ...chip }]);
  }

  const autoDays = daysSince(targetDate);
  const chips = statChipsFor(occasion);

  return (
    <div className="space-y-8">
      {/* Contador */}
      <div>
        <label className={labelClass} htmlFor="counter-date">
          Quando essa história começou?
        </label>
        <input
          id="counter-date"
          type="date"
          className={inputClass}
          value={targetDate ?? ''}
          onFocus={() => onFocusSlide('cover')}
          onChange={(e) => setDate(e.target.value)}
        />
        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim/70">
          opcional — dá pra pular
        </p>

        <div className="mt-4">
          <label className={labelClass}>Rótulo do contador</label>
          <input
            className={inputClass}
            value={label}
            placeholder={defaultCounterLabel(occasion)}
            onFocus={() => onFocusSlide('cover')}
            onChange={(e) => {
              onLabelTouched();
              onCounter({ label: e.target.value });
            }}
          />
          {!labelTouched && (
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim/70">
              sugerido pela ocasião — edite à vontade
            </p>
          )}
        </div>

        {targetDate && (
          <div className="mt-5 rounded-lg border border-[var(--line)] bg-tape/50 p-4">
            <CountdownTimecode
              targetDate={targetDate}
              label={label || defaultCounterLabel(occasion)}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Wrapped */}
      <div>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan">
          os números <span className="text-dim">· o wrapped de vocês</span>
        </p>
        <p className="mb-3 mt-1 text-xs text-dim">
          Viram o slide “Os números de vocês”, com contagem animada.
        </p>
        <div className="space-y-3">
          {stats.map((s, i) =>
            s.auto ? (
              <div key={`auto-${i}`} className="rounded-lg border border-cyan/40 bg-cyan/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cyan">
                    automático · {autoDays ?? '—'} dias
                  </span>
                </div>
                <input
                  className={inputClass}
                  value={s.label}
                  placeholder="Legenda (ex.: de nós dois)"
                  onFocus={() => onFocusSlide('wrapped')}
                  onChange={(e) => updateStat(i, { label: e.target.value })}
                />
              </div>
            ) : (
              <div key={`stat-${i}`} className="rounded-lg border border-[var(--line)] bg-panel/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim">
                    número {stats.slice(0, i + 1).filter((x) => !x.auto).length}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => moveStat(i, -1)}
                      aria-label="Subir"
                      className="font-mono text-xs text-dim hover:text-cyan"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStat(i, 1)}
                      aria-label="Descer"
                      className="font-mono text-xs text-dim hover:text-cyan"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStat(i)}
                      aria-label="Remover número"
                      className="text-dim hover:text-magenta"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} w-24`}
                    inputMode="numeric"
                    value={s.value ?? ''}
                    placeholder="nº"
                    onFocus={() => onFocusSlide('wrapped')}
                    onChange={(e) => {
                      const n = e.target.value.trim();
                      updateStat(i, { value: n === '' ? undefined : Number(n) });
                    }}
                  />
                  <input
                    className={inputClass}
                    value={s.suffix ?? ''}
                    placeholder="unidade (ex.: viagens, ∞)"
                    onFocus={() => onFocusSlide('wrapped')}
                    onChange={(e) => updateStat(i, { suffix: e.target.value })}
                  />
                </div>
                <input
                  className={`${inputClass} mt-2`}
                  value={s.label}
                  placeholder="Legenda (ex.: e contando)"
                  onFocus={() => onFocusSlide('wrapped')}
                  onChange={(e) => updateStat(i, { label: e.target.value })}
                />
              </div>
            ),
          )}
        </div>

        {/* Adicionar número: um genérico (em branco) + sugestões por ocasião */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              addChip({ label: '', suffix: '' });
              onFocusSlide('wrapped');
            }}
            className="rounded-full border border-cyan/60 bg-cyan/5 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-cyan hover:bg-cyan/15"
          >
            + Números
          </button>
          {chips.map((chip) => (
            <button
              key={statChipText(chip)}
              type="button"
              onClick={() => addChip(chip)}
              className="rounded-full border border-dashed border-[var(--line)] px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-dim hover:border-cyan hover:text-cyan"
            >
              + {statChipText(chip)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Editor da roleta (Tarefa 4): lista de opções que o destinatário sorteia. */
function RouletteEditor({
  options,
  onChange,
  onFocus,
}: {
  options: string[];
  onChange: (o: string[]) => void;
  onFocus: () => void;
}) {
  const list = options.length ? options : ['', ''];
  function update(i: number, v: string) {
    onChange(list.map((o, idx) => (idx === i ? v : o)));
  }
  function add() {
    onChange([...list, '']);
  }
  function remove(i: number) {
    onChange(list.filter((_, idx) => idx !== i));
  }
  return (
    <div className="space-y-2">
      {list.map((o, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputClass}
            value={o}
            placeholder={`Opção ${i + 1} (ex.: jantar japonês)`}
            onFocus={onFocus}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remover opção"
            className="flex shrink-0 items-center rounded-lg border border-[var(--line)] px-3 text-dim hover:border-magenta hover:text-magenta"
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border border-dashed border-[var(--line)] py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-dim hover:border-cyan hover:text-cyan"
      >
        + adicionar opção
      </button>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim/70">
        quem recebe gira a roleta e sorteia o que vão fazer
      </p>
    </div>
  );
}

function TimelineEditor({
  items,
  onChange,
  assets,
  onUpload,
}: {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
  assets: GiftAsset[];
  onUpload: (files: File[]) => Promise<GiftAsset[]>;
}) {
  function update(i: number, patch: Partial<TimelineItem>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function add() {
    onChange([...items, { title: '' }]);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  // Reordena os momentos (mesmo padrão do passo "Números").
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    const a = items[i];
    const b = items[j];
    if (!a || !b) return;
    const arr = [...items];
    arr[i] = b;
    arr[j] = a;
    onChange(arr);
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-[var(--line)] bg-panel/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan">
              momento {i + 1}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Subir momento"
                className="font-mono text-xs text-dim hover:text-cyan disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label="Descer momento"
                className="font-mono text-xs text-dim hover:text-cyan disabled:opacity-30"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim hover:text-magenta"
              >
                <TrashIcon /> remover
              </button>
            </div>
          </div>
          <input
            className={`${inputClass} mb-3`}
            value={item.date ?? ''}
            placeholder="Quando? Ex.: 2021, nosso 1º date"
            onChange={(e) => update(i, { date: e.target.value })}
          />
          <input
            className={`${inputClass} mb-3`}
            value={item.title}
            placeholder="O que aconteceu"
            onChange={(e) => update(i, { title: e.target.value })}
          />
          <textarea
            className={`${inputClass} mb-3 min-h-20 resize-y`}
            value={item.description ?? ''}
            placeholder="Detalhes (opcional)"
            onChange={(e) => update(i, { description: e.target.value })}
          />
          <MomentPhoto
            selectedId={item.photoAssetId}
            assets={assets}
            onSelect={(assetId) => update(i, { photoAssetId: assetId })}
            onUpload={onUpload}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border border-dashed border-[var(--line)] py-3 font-mono text-xs uppercase tracking-[0.2em] text-dim hover:border-cyan hover:text-cyan"
      >
        + adicionar momento
      </button>
    </div>
  );
}

/** Foto opcional de um momento: escolhe uma já enviada ou sobe uma nova. */
function MomentPhoto({
  selectedId,
  assets,
  onSelect,
  onUpload,
}: {
  selectedId?: string;
  assets: GiftAsset[];
  onSelect: (assetId: string | undefined) => void;
  onUpload: (files: File[]) => Promise<GiftAsset[]>;
}) {
  const [open, setOpen] = useState(false);
  const photos = assets.filter((a) => a.type === 'image');
  const selected = photos.find((a) => a.id === selectedId);

  async function uploadNew(files: File[]) {
    const created = await onUpload(files);
    if (created[0]) {
      onSelect(created[0].id);
      setOpen(false);
    }
  }

  function pick(id: string) {
    onSelect(id);
    setOpen(false);
  }

  if (selected) {
    return (
      <div className="space-y-2">
        {/* Controles flutuam sobre a foto pra economizar espaço */}
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetUrl(selected)}
            alt=""
            className="h-24 w-24 rounded-lg border border-[var(--line)] object-cover"
          />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Trocar foto"
            className="absolute left-1 top-1 rounded bg-tape/80 p-1.5 text-glow hover:text-cyan"
          >
            <SwapIcon />
          </button>
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            aria-label="Remover foto"
            className="absolute right-1 top-1 rounded bg-tape/80 p-1.5 text-glow hover:text-magenta"
          >
            <TrashIcon />
          </button>
        </div>
        {open && (
          <PhotoPicker photos={photos} onPick={pick} onUploadNew={uploadNew} onClose={() => setOpen(false)} />
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim hover:text-cyan"
      >
        + foto do momento (opcional)
      </button>
    );
  }

  return <PhotoPicker photos={photos} onPick={pick} onUploadNew={uploadNew} onClose={() => setOpen(false)} />;
}

function PhotoPicker({
  photos,
  onPick,
  onUploadNew,
  onClose,
}: {
  photos: GiftAsset[];
  onPick: (assetId: string) => void;
  onUploadNew: (files: File[]) => void | Promise<void>;
  onClose?: () => void;
}) {
  return (
    <div className="mt-2 w-full rounded-lg border border-[var(--line)] bg-tape/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim">
          escolha uma foto sua
        </span>
        {onClose && (
          <button type="button" onClick={onClose} className="font-mono text-[0.6rem] text-dim hover:text-magenta">
            fechar
          </button>
        )}
      </div>
      <div className="rb-hscroll flex gap-2 overflow-x-auto pb-2">
        {photos.map((a) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={a.id}
            src={assetUrl(a)}
            alt=""
            onClick={() => onPick(a.id)}
            className="h-16 w-16 shrink-0 cursor-pointer rounded-lg border border-[var(--line)] object-cover hover:border-cyan"
          />
        ))}
        <label className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-center text-dim hover:border-cyan hover:text-cyan">
          <span className="text-lg leading-none">＋</span>
          <span className="font-mono text-[0.5rem] uppercase">nova</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void onUploadNew(Array.from(e.target.files));
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}

function PhotoUploader({
  assets,
  uploads,
  onUpload,
  onRemove,
}: {
  assets: GiftAsset[];
  uploads: Upload[];
  onUpload: (files: File[]) => void | Promise<unknown>;
  onRemove: (assetId: string) => void | Promise<void>;
}) {
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [tooLarge, setTooLarge] = useState<string[]>([]);
  const photos = assets.filter((a) => a.type === 'image');
  const lightboxPhotos = photos.map((a) => ({ id: a.id, url: assetUrl(a) }));

  // Separa imagens válidas das grandes demais; as grandes viram mensagem
  // elegante (sem tentar subir e falhar feio).
  function handleFiles(list: FileList | null) {
    const imgs = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
    const valid = imgs.filter((f) => f.size <= MAX_UPLOAD_BYTES);
    setTooLarge(imgs.filter((f) => f.size > MAX_UPLOAD_BYTES).map((f) => f.name));
    if (valid.length) void onUpload(valid);
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center transition ${
          dragging ? 'border-cyan bg-cyan/10' : 'border-[var(--line)] hover:border-cyan'
        }`}
      >
        <span className="font-display text-lg text-glow">＋ arraste ou adicione fotos</span>
        <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim">
          jpg, png ou webp · até 10mb cada
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </label>

      {tooLarge.length > 0 && (
        <div className="mt-4 space-y-1">
          {tooLarge.map((name) => (
            <p
              key={name}
              className="rounded-lg border border-magenta/50 bg-magenta/10 px-3 py-2 text-sm text-glow"
            >
              A imagem {name} ultrapassa o limite de tamanho permitido
            </p>
          ))}
        </div>
      )}

      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((u) => (
            <div key={u.id}>
              <div className="mb-1 flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim">
                <span className="truncate">{u.name}</span>
                <span>{u.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-glow/15">
                <div
                  className="h-full rounded-full bg-cyan transition-all duration-200"
                  style={{ width: `${u.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {photos.map((a, i) => (
            <div key={a.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetUrl(a)}
                alt=""
                onClick={() => setLightbox(i)}
                className="aspect-square w-full cursor-pointer rounded-lg border border-[var(--line)] object-cover transition hover:brightness-110"
              />
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                className="absolute right-1 top-1 rounded bg-tape/80 p-1.5 text-glow hover:text-magenta"
                aria-label="Remover foto"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox !== null && lightboxPhotos.length > 0 && (
        <Lightbox
          photos={lightboxPhotos}
          index={lightbox}
          onIndex={(i) => setLightbox(i)}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

/**
 * Compositor de IA (F3-1): o cliente conta a história em um parágrafo e a IA
 * monta o rascunho (título, recado, linha do tempo). É o atalho de conversão —
 * fica no topo do primeiro passo, mas é opcional (dá pra preencher na mão).
 */
function AiComposer({ onDraft }: { onDraft: (result: DraftResult) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    if (text.trim().length < 10) {
      setErr('Conta um pouco mais da história (mínimo umas linhas).');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const result = await draftFromText(text.trim());
      onDraft(result);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não consegui montar o rascunho agora.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 flex w-full items-center justify-between gap-3 rounded-xl border border-cyan/40 bg-cyan/5 px-5 py-4 text-left transition hover:border-cyan hover:bg-cyan/10"
      >
        <span>
          <span className="block font-display text-base font-semibold text-glow">
            ✨ Deixa a IA montar pra você
          </span>
          <span className="mt-0.5 block text-xs text-dim">
            Conta a história num parágrafo e a gente cria o rascunho.
          </span>
        </span>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan">abrir ►</span>
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-cyan/40 bg-cyan/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-base font-semibold text-glow">
          ✨ Conta a história de vocês
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim hover:text-magenta"
        >
          fechar
        </button>
      </div>
      <textarea
        className={`${inputClass} min-h-32 resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex.: A Marina e eu nos conhecemos em 2019 numa festa de amigos. Nosso primeiro date foi no cinema, choveu muito. Em 2021 fomos morar juntos e adotamos a Nina. Quero surpreender ela nos 4 anos de namoro…"
      />
      {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="mt-3 w-full rounded-lg bg-cyan px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? 'montando o rascunho…' : 'montar meu rascunho ✨'}
      </button>
      <p className="mt-2 text-center font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim">
        você revisa e ajusta tudo depois
      </p>
    </div>
  );
}

/** Link/QR bloqueados até o pagamento (F1-4); o CTA leva ao checkout (F1-5). */
function LockedLink() {
  return (
    <div className="mt-6 rounded-xl border border-[var(--line)] bg-panel/50 p-5 text-center">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim">
        🔒 seu link secreto
      </p>
      <code className="mt-2 block font-mono text-lg text-dim/70">rebobinai.app/p/•••••</code>
      <Link
        href="/pagar"
        className="mt-4 block w-full rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
      >
        pagar e liberar ►
      </Link>
      <p className="mt-3 text-xs text-dim">
        O link compartilhável e o QR são liberados após o pagamento, sem a marca d&apos;água.
      </p>
    </div>
  );
}
