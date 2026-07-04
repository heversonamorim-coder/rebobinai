'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GiftPreview } from '../../components/gift-preview';
import {
  createGift,
  draftFromText,
  getGift,
  removeGiftAsset,
  updateGift,
  uploadGiftImage,
  type DraftResult,
} from '../../lib/api';
import {
  OCCASIONS,
  assetUrl,
  clearDraftRef,
  loadDraftRef,
  saveDraftRef,
  type DraftRef,
  type GiftAsset,
  type GiftPayload,
  type TimelineItem,
} from '../../lib/gift';

const STEPS = ['Ocasião', 'História', 'Fotos', 'Linha do tempo', 'Trilha', 'Finalizar'] as const;

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-panel px-4 py-3 text-glow placeholder:text-dim/60 focus:border-cyan focus:outline-none';
const labelClass = 'mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim';

export default function CriarPage() {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState('');
  const [payload, setPayload] = useState<GiftPayload>({});
  const [ref, setRef] = useState<DraftRef | null>(null);
  const [assets, setAssets] = useState<GiftAsset[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      })
      .catch(() => clearDraftRef());
  }, []);

  function patch(p: Partial<GiftPayload>) {
    setPayload((prev) => ({ ...prev, ...p }));
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
      setError(e instanceof Error ? e.message : 'Não foi possível salvar o rascunho.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhotos(files: FileList) {
    // O upload precisa do rascunho já criado (para ter id + editToken).
    let current = ref ?? (await saveDraft());
    if (!current) return;
    setError(null);
    for (const file of Array.from(files)) {
      try {
        const asset = await uploadGiftImage(current.id, current.editToken, file);
        setAssets((prev) => [...prev, asset]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao enviar a foto.');
      }
    }
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

  return (
    <main className="mx-auto min-h-svh w-full max-w-5xl px-5 py-10 sm:py-16">
      <header className="mb-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-dim">
          <span className="rb-rew">◄◄</span> Rebobinaí · criar presente
        </p>
        <ProgressBar step={step} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,400px)]">
        {/* Coluna do formulário */}
        <div>
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
        <Step title="A história de vocês" hint="Um título e um recado de coração.">
          <Field
            label="Título"
            value={payload.title ?? ''}
            onChange={(v) => patch({ title: v })}
            placeholder="Ex.: 4 anos rebobinando a gente"
          />
          <div className="mb-5">
            <label className={labelClass} htmlFor="letter">
              Recado
            </label>
            <textarea
              id="letter"
              className={`${inputClass} min-h-40 resize-y`}
              value={payload.letter ?? ''}
              onChange={(e) => patch({ letter: e.target.value })}
              placeholder="Conta um pedaço da história de vocês…"
            />
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step title="As fotos de vocês" hint="Elas dão vida à rebobinada. Suba do celular ou do computador.">
          <PhotoUploader assets={assets} onUpload={uploadPhotos} onRemove={removePhoto} />
        </Step>
      )}

      {step === 3 && (
        <Step title="Linha do tempo" hint="Momentos marcantes — opcional, mas emociona.">
          <TimelineEditor items={payload.timeline ?? []} onChange={patchTimeline} />
        </Step>
      )}

      {step === 4 && (
        <Step title="A trilha sonora" hint="Cola o link da música de vocês (Spotify).">
          <Field
            label="Link da música (opcional)"
            value={payload.spotifyTrackUrl ?? ''}
            onChange={(v) => patch({ spotifyTrackUrl: v })}
            placeholder="https://open.spotify.com/track/…"
          />
        </Step>
      )}

      {step === 5 && (
        <Step title="Seu presente está pronto ◄◄" hint="Confira a prévia ao lado. O link e o QR liberam após o pagamento.">
          <LockedLink />
        </Step>
      )}

          <nav className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || saving}
              className="font-mono text-xs uppercase tracking-[0.2em] text-dim disabled:opacity-30"
            >
              ◄ voltar
            </button>

            <div className="flex items-center gap-4">
              {step < STEPS.length - 1 && ref && (
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim">
                  rascunho salvo
                </span>
              )}
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
            </div>
          </nav>
        </div>

        {/* Coluna da prévia ao vivo */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-3 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-magenta" />
            prévia ao vivo
          </p>
          <GiftPreview payload={payload} occasion={occasion} assets={assets} watermark />
        </aside>
      </div>
    </main>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex-1">
          <div
            className={`h-1.5 rounded-full ${i <= step ? 'bg-cyan' : 'bg-[var(--line)]'}`}
            aria-hidden
          />
          <span
            className={`mt-2 block font-mono text-[0.6rem] uppercase tracking-[0.15em] ${
              i === step ? 'text-cyan' : 'text-dim/60'
            }`}
          >
            {label}
          </span>
        </div>
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

function TimelineEditor({
  items,
  onChange,
}: {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
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

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-[var(--line)] bg-panel/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan">
              momento {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim hover:text-magenta"
            >
              remover
            </button>
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
            className={`${inputClass} min-h-20 resize-y`}
            value={item.description ?? ''}
            placeholder="Detalhes (opcional)"
            onChange={(e) => update(i, { description: e.target.value })}
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

function PhotoUploader({
  assets,
  onUpload,
  onRemove,
}: {
  assets: GiftAsset[];
  onUpload: (files: FileList) => void | Promise<void>;
  onRemove: (assetId: string) => void | Promise<void>;
}) {
  const photos = assets.filter((a) => a.type === 'image');
  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line)] py-10 text-center transition hover:border-cyan">
        <span className="font-display text-lg text-glow">＋ adicionar fotos</span>
        <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim">
          jpg, png ou webp · até 10mb cada
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void onUpload(e.target.files);
            e.target.value = '';
          }}
        />
      </label>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {photos.map((a) => (
            <div key={a.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetUrl(a)}
                alt=""
                className="aspect-square w-full rounded-lg border border-[var(--line)] object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                className="absolute right-1 top-1 rounded bg-tape/80 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wide text-glow hover:text-magenta"
              >
                remover
              </button>
            </div>
          ))}
        </div>
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
