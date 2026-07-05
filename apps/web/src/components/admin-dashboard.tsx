'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { AdminGift, AdminOrder } from '../lib/admin-types';
import { formatBRL } from '../lib/plans';

const STATUS_LABEL: Record<AdminOrder['status'], string> = {
  pending: 'aguardando',
  paid: 'pago',
  failed: 'falhou',
  canceled: 'cancelado',
  refunded: 'estornado',
};
const STATUS_COLOR: Record<AdminOrder['status'], string> = {
  pending: 'text-dim',
  paid: 'text-cyan',
  failed: 'text-magenta',
  canceled: 'text-dim',
  refunded: 'text-magenta',
};

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminDashboard({
  orders: initial,
  gifts = [],
  error = null,
}: {
  orders: AdminOrder[];
  gifts?: AdminGift[];
  error?: string | null;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [tab, setTab] = useState<'vendas' | 'rebobinadas'>('vendas');

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === 'paid');
    const physical = orders.filter((o) => o.productKey);
    const toShip = physical.filter((o) => o.status === 'paid' && !o.trackingCode);
    const revenue = paid.reduce((s, o) => s + o.amountCharged, 0);
    return { total: orders.length, paid: paid.length, physical: physical.length, toShip: toShip.length, revenue };
  }, [orders]);

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.replace('/admin/login');
    router.refresh();
  }

  function onTracked(id: string, trackingCode: string, shippedAt: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, trackingCode, shippedAt } : o)));
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-4xl px-5 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-dim">
            <span className="rb-rew">◄◄</span> Rebobinaí · admin
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-glow">Painel</h1>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-[var(--line)] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-dim transition hover:border-magenta hover:text-magenta"
        >
          sair
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded-lg border border-magenta/50 bg-magenta/10 px-4 py-3 text-sm text-glow">
          ⚠ {error}
        </p>
      )}

      {/* Abas: vendas (pedidos) e rebobinadas (todas as criadas) */}
      <div className="mb-6 flex gap-2">
        {(['vendas', 'rebobinadas'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] ${
              tab === t ? 'border-cyan text-cyan' : 'border-[var(--line)] text-dim hover:text-glow'
            }`}
          >
            {t === 'vendas' ? `vendas · ${orders.length}` : `rebobinadas · ${gifts.length}`}
          </button>
        ))}
      </div>

      {tab === 'vendas' ? (
        <>
          <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="pedidos" value={String(stats.total)} />
            <StatCard label="pagos" value={String(stats.paid)} accent />
            <StatCard label="a enviar" value={String(stats.toShip)} warn={stats.toShip > 0} />
            <StatCard label="receita" value={formatBRL(stats.revenue)} accent />
          </section>

          {orders.length === 0 ? (
            <p className="rounded-lg border border-[var(--line)] bg-panel/40 px-4 py-8 text-center text-dim">
              Nenhuma venda ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <OrderCard key={o.id} order={o} onTracked={onTracked} />
              ))}
            </div>
          )}
        </>
      ) : (
        <GiftsList gifts={gifts} />
      )}
    </main>
  );
}

const GIFT_STATUS: Record<AdminGift['status'], { label: string; color: string }> = {
  draft: { label: 'rascunho', color: 'text-dim' },
  paid: { label: 'pago', color: 'text-cyan' },
  archived: { label: 'arquivado', color: 'text-dim' },
};

function GiftsList({ gifts }: { gifts: AdminGift[] }) {
  if (gifts.length === 0) {
    return (
      <p className="rounded-lg border border-[var(--line)] bg-panel/40 px-4 py-8 text-center text-dim">
        Nenhuma rebobinada criada ainda.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {gifts.map((g) => {
        const s = GIFT_STATUS[g.status];
        return (
          <div key={g.id} className="rounded-xl border border-[var(--line)] bg-panel/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-glow">{g.title || 'Rebobinada sem título'}</span>
              <span className={`font-mono text-[0.65rem] uppercase tracking-[0.2em] ${s.color}`}>
                {s.label}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-dim">
              {(g.recipientName || g.senderName) && (
                <span className="normal-case tracking-normal">
                  {g.senderName ? `de ${g.senderName}` : ''}
                  {g.senderName && g.recipientName ? ' · ' : ''}
                  {g.recipientName ? `pra ${g.recipientName}` : ''}
                </span>
              )}
              {g.occasion && <span>{g.occasion}</span>}
              <span>
                <span className="text-cyan">{g.viewCount}</span> {g.viewCount === 1 ? 'abertura' : 'aberturas'}
              </span>
              <span>{new Date(g.createdAt).toLocaleDateString('pt-BR')}</span>
              {g.status === 'paid' && g.slug && (
                <a href={`/p/${g.slug}`} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
                  abrir ►
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-panel/40 p-4">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${warn ? 'text-magenta' : accent ? 'text-cyan' : 'text-glow'}`}>
        {value}
      </p>
    </div>
  );
}

function OrderCard({
  order,
  onTracked,
}: {
  order: AdminOrder;
  onTracked: (id: string, trackingCode: string, shippedAt: string) => void;
}) {
  const isPhysical = Boolean(order.productKey);
  return (
    <div
      className={`rounded-xl border bg-panel/40 p-5 ${
        isPhysical && order.status === 'paid' && !order.trackingCode
          ? 'border-magenta/60'
          : 'border-[var(--line)]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-glow">
          {order.gift.title || 'Rebobinada'}
          {isPhysical && order.productName && (
            <span className="ml-2 rounded-full bg-magenta/20 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-magenta">
              {order.productName}
            </span>
          )}
        </span>
        <span className={`font-mono text-[0.65rem] uppercase tracking-[0.2em] ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]} · {formatBRL(order.amountCharged)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-dim">
        <span>{fmtDate(order.paidAt ?? order.createdAt)}</span>
        {order.customerEmail && <span className="lowercase tracking-normal">{order.customerEmail}</span>}
        {order.billingType && <span>{order.billingType === 'PIX' ? 'pix' : 'cartão'}</span>}
        {order.gift.slug && (
          <a href={`/p/${order.gift.slug}`} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
            ver rebobinada ►
          </a>
        )}
      </div>

      {isPhysical && <PhysicalDetails order={order} onTracked={onTracked} />}
    </div>
  );
}

function PhysicalDetails({
  order,
  onTracked,
}: {
  order: AdminOrder;
  onTracked: (id: string, trackingCode: string, shippedAt: string) => void;
}) {
  const s = order.shipping;
  return (
    <div className="mt-4 border-t border-[var(--line)] pt-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        {order.photoUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={order.photoUrl}
            alt="Foto do produto"
            className="h-24 w-24 shrink-0 rounded-lg border border-[var(--line)] object-cover"
          />
        )}
        <div className="flex-1 text-sm text-glow/90">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cyan">entrega</p>
          {s ? (
            <p className="mt-1 leading-relaxed">
              {s.name}
              <br />
              {s.street}, {s.number}
              {s.complement ? ` · ${s.complement}` : ''}
              <br />
              {s.district} · {s.city}/{s.uf} · CEP {s.cep}
              <br />
              <span className="text-dim">tel {s.phone}</span>
              {order.shippingCost != null && (
                <span className="text-dim"> · frete {formatBRL(order.shippingCost)}</span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-dim">endereço não informado</p>
          )}
        </div>
      </div>

      <TrackingForm order={order} onTracked={onTracked} />
    </div>
  );
}

function TrackingForm({
  order,
  onTracked,
}: {
  order: AdminOrder;
  onTracked: (id: string, trackingCode: string, shippedAt: string) => void;
}) {
  const [code, setCode] = useState(order.trackingCode ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function save() {
    if (code.trim().length < 3) {
      setErr('Código muito curto.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ trackingCode: code.trim() }),
      });
      if (res.ok) {
        const b = (await res.json()) as { shippedAt?: string };
        onTracked(order.id, code.trim(), b.shippedAt ?? new Date().toISOString());
        setDone(true);
        setTimeout(() => setDone(false), 2500);
      } else {
        const b = (await res.json().catch(() => ({}))) as { message?: string };
        setErr(b.message ?? 'Falha ao salvar.');
      }
    } catch {
      setErr('Falha de rede.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4">
      <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cyan">
        rastreio dos Correios
        {order.shippedAt && (
          <span className="ml-2 text-dim">
            enviado {new Date(order.shippedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
      </p>
      <div className="flex items-stretch gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ex.: AA123456789BR"
          className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-panel px-4 py-2.5 font-mono text-sm uppercase tracking-wide text-glow placeholder:text-dim/50 focus:border-cyan focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="shrink-0 rounded-lg bg-magenta px-5 font-display text-xs font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? '…' : order.trackingCode ? 'atualizar' : 'enviar ►'}
        </button>
      </div>
      {err && <p className="mt-1 text-xs text-magenta">{err}</p>}
      {done && <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cyan">✓ rastreio salvo · e-mail enviado</p>}
    </div>
  );
}
