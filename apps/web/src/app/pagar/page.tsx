'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShareTools } from '../../components/share-tools';
import { StoriesViewer } from '../../components/stories-viewer';
import {
  checkoutCard,
  checkoutPix,
  getGift,
  getOrderStatus,
  getPlans,
  type PixCheckoutResult,
  type PlanKeyPaid,
} from '../../lib/api';
import { loadDraftRef, type DraftRef, type Gift } from '../../lib/gift';
import { PLANS_FALLBACK, priceDisplay, type Plan } from '../../lib/plans';

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-panel px-4 py-3 text-glow placeholder:text-dim/60 focus:border-cyan focus:outline-none';
const labelClass = 'mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim';

export default function PagarPage() {
  const [ref, setRef] = useState<DraftRef | null>(null);
  const [noDraft, setNoDraft] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(PLANS_FALLBACK);
  const [planKey, setPlanKey] = useState<PlanKeyPaid>('digital');
  const [method, setMethod] = useState<'pix' | 'card'>('pix');

  const [customer, setCustomer] = useState({ name: '', email: '', cpfCnpj: '' });
  const [card, setCard] = useState({ holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '' });
  const [holder, setHolder] = useState({ postalCode: '', addressNumber: '', phone: '' });

  const [pix, setPix] = useState<PixCheckoutResult['pix'] | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paidGift, setPaidGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadDraftRef();
    if (!existing) {
      setNoDraft(true);
      return;
    }
    setRef(existing);
    getGift(existing.id, existing.editToken)
      .then((g) => {
        // Já pago (voltou pra cá): mostra direto a tela de compartilhar.
        if (g.status === 'paid' && g.slug) {
          setPaidGift(g);
          setPaid(true);
        }
      })
      .catch(() => setNoDraft(true));
    getPlans().then((p) => p.length > 0 && setPlans(p));
  }, []);

  // Poll do pedido enquanto não confirmar (o webhook do Asaas é assíncrono).
  useEffect(() => {
    if (!orderId || paid) return;
    const t = setInterval(async () => {
      try {
        const s = await getOrderStatus(orderId);
        if (s.status === 'paid') setPaid(true);
      } catch {
        // mantém o poll
      }
    }, 3000);
    return () => clearInterval(t);
  }, [orderId, paid]);

  // Ao confirmar, busca o presente recém-liberado (slug + payload) pra tela de
  // compartilhamento — sem sair da página.
  useEffect(() => {
    if (!paid || !ref || paidGift) return;
    getGift(ref.id, ref.editToken)
      .then((g) => setPaidGift(g))
      .catch(() => setError('Pagamento confirmado, mas não consegui abrir o presente. Recarregue.'));
  }, [paid, ref, paidGift]);

  async function payPix() {
    if (!ref) return;
    setLoading(true);
    setError(null);
    try {
      const res = await checkoutPix({ giftId: ref.id, editToken: ref.editToken, planKey, customer });
      setPix(res.pix);
      setOrderId(res.orderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao gerar o Pix.');
    } finally {
      setLoading(false);
    }
  }

  async function payCard() {
    if (!ref) return;
    setLoading(true);
    setError(null);
    try {
      const res = await checkoutCard({
        giftId: ref.id,
        editToken: ref.editToken,
        planKey,
        customer,
        card,
        holder,
      });
      setOrderId(res.orderId);
      if (res.status === 'paid') setPaid(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível processar o cartão.');
    } finally {
      setLoading(false);
    }
  }

  if (noDraft) {
    return (
      <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-5 text-center">
        <p className="text-dim">Nenhum rascunho encontrado neste navegador.</p>
        <Link href="/criar" className="mt-6 rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape">
          criar meu presente ►
        </Link>
      </main>
    );
  }

  const selected = plans.find((p) => p.key === planKey);

  return (
    <main className="mx-auto min-h-svh w-full max-w-lg px-5 py-10 sm:py-16">
      <header className="mb-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-dim">
          <span className="rb-rew">◄◄</span> Rebobinaí · {paid ? 'pronto' : 'pagamento'}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-glow">
          {paid ? 'Tá no ar! Agora é só compartilhar' : 'Libere o seu presente'}
        </h1>
      </header>

      {error && (
        <p className="mb-6 rounded-lg border border-magenta/50 bg-magenta/10 px-4 py-3 text-sm text-glow">
          {error}
        </p>
      )}

      {paid ? (
        paidGift && paidGift.slug ? (
          <PostPurchase gift={paidGift} />
        ) : (
          <p className="rounded-lg border border-cyan/50 bg-cyan/10 px-4 py-6 text-center text-glow">
            ✓ Pagamento confirmado! Preparando o seu presente…
          </p>
        )
      ) : (
        <>
          {/* Plano */}
          <div className="mb-6">
            <span className={labelClass}>Plano</span>
            <div className="grid gap-3">
              {plans
                .filter((p) => p.key !== 'free')
                .map((p) => {
                  const price = priceDisplay(p);
                  const active = p.key === planKey;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPlanKey(p.key as PlanKeyPaid)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left ${
                        active ? 'border-magenta bg-panel' : 'border-[var(--line)] bg-panel/40'
                      }`}
                    >
                      <span>
                        <span className="font-display text-glow">{p.name}</span>
                        {p.tagline && <span className="ml-2 text-xs text-dim">{p.tagline}</span>}
                      </span>
                      <span className="font-display text-cyan">{price.current}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Dados do cliente */}
          <div className="mb-6 space-y-4">
            <Field label="Seu nome" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} />
            <Field label="E-mail (recibo + link)" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} placeholder="voce@email.com" />
            <Field label="CPF" value={customer.cpfCnpj} onChange={(v) => setCustomer({ ...customer, cpfCnpj: v })} placeholder="somente números" />
          </div>

          {/* Método */}
          <div className="mb-6 flex gap-2">
            {(['pix', 'card'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 rounded-lg border py-3 font-mono text-xs uppercase tracking-[0.2em] ${
                  method === m ? 'border-cyan text-cyan' : 'border-[var(--line)] text-dim'
                }`}
              >
                {m === 'pix' ? 'Pix' : 'Cartão'}
              </button>
            ))}
          </div>

          {method === 'pix' && !pix && (
            <button
              type="button"
              onClick={payPix}
              disabled={loading}
              className="w-full rounded-lg bg-magenta px-6 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'gerando…' : `gerar Pix · ${selected ? priceDisplay(selected).current : ''}`}
            </button>
          )}

          {method === 'pix' && pix && (
            <div className="rounded-xl border border-[var(--line)] bg-panel/50 p-6 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pix.qrImage} alt="QR code Pix" width={220} height={220} className="mx-auto rounded-lg bg-glow p-2" />
              <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim">Pix copia e cola</p>
              <textarea readOnly value={pix.copyPaste} className={`${inputClass} mt-2 min-h-20 resize-none text-xs`} />
              <p className="mt-4 animate-pulse font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan">
                aguardando pagamento…
              </p>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-4">
              <Field label="Nome no cartão" value={card.holderName} onChange={(v) => setCard({ ...card, holderName: v })} />
              <Field label="Número do cartão" value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="0000 0000 0000 0000" />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Mês" value={card.expiryMonth} onChange={(v) => setCard({ ...card, expiryMonth: v })} placeholder="MM" />
                <Field label="Ano" value={card.expiryYear} onChange={(v) => setCard({ ...card, expiryYear: v })} placeholder="AAAA" />
                <Field label="CVV" value={card.ccv} onChange={(v) => setCard({ ...card, ccv: v })} placeholder="123" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CEP" value={holder.postalCode} onChange={(v) => setHolder({ ...holder, postalCode: v })} />
                <Field label="Nº" value={holder.addressNumber} onChange={(v) => setHolder({ ...holder, addressNumber: v })} />
              </div>
              <Field label="Telefone" value={holder.phone} onChange={(v) => setHolder({ ...holder, phone: v })} placeholder="DDD + número" />
              <button
                type="button"
                onClick={payCard}
                disabled={loading}
                className="w-full rounded-lg bg-magenta px-6 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'processando…' : `pagar ${selected ? priceDisplay(selected).current : ''}`}
              </button>
            </div>
          )}

          <p className="mt-6 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/60">
            pagamento processado pelo Asaas · seus dados de cartão não ficam no Rebobinaí
          </p>
        </>
      )}
    </main>
  );
}

/**
 * Tela pós-compra: prévia da rebobinada liberada + ferramentas de compartilhar
 * (WhatsApp, link com copiar, download do QR). A URL é montada no cliente a
 * partir do domínio atual, então bate com onde a página foi aberta.
 */
function PostPurchase({ gift }: { gift: Gift }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (gift.slug) setUrl(`${window.location.origin}/p/${gift.slug}`);
  }, [gift.slug]);

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="w-full rounded-lg border border-cyan/50 bg-cyan/10 px-4 py-3 text-center text-sm text-glow">
        ✓ Pagamento confirmado — sua rebobinada está no ar.
      </p>

      <StoriesViewer payload={gift.payload} occasion={gift.occasion} assets={gift.assets} />

      {url && <ShareTools url={url} title={gift.payload.title} />}

      <Link
        href={url || '#'}
        target="_blank"
        className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim underline underline-offset-4 transition hover:text-cyan"
      >
        abrir a página do presente ►
      </Link>
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
    <div>
      <label className={labelClass}>{label}</label>
      <input className={inputClass} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
