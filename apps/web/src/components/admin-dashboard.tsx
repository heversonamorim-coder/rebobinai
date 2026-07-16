'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { AdminGift, AdminMessage, AdminOrder, AdminStock } from '../lib/admin-types';
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
  messages = [],
  stock = [],
  error = null,
}: {
  orders: AdminOrder[];
  gifts?: AdminGift[];
  messages?: AdminMessage[];
  stock?: AdminStock[];
  error?: string | null;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [tab, setTab] = useState<'vendas' | 'rebobinadas' | 'mensagens' | 'produção'>('vendas');
  const unread = messages.filter((m) => !m.handled).length;

  // Agrupa os pedidos por rebobinada (uma linha por gift). Uma mesma rebobinada
  // pode ter vários pedidos (tentativas de checkout); mostra o pago se houver,
  // senão o mais recente, com um contador de tentativas. (Os pedidos já vêm
  // ordenados por data desc da API.)
  const salesByGift = useMemo(() => {
    // Pedidos vêm desc por data, então o 1º visto de cada gift é o mais recente
    // (vira o representante). Se aparecer um pago, ele assume como representante.
    const groups = new Map<string, { rep: AdminOrder; attempts: number; hasPaid: boolean }>();
    for (const o of orders) {
      const g = groups.get(o.giftId);
      if (!g) {
        groups.set(o.giftId, { rep: o, attempts: 1, hasPaid: o.status === 'paid' });
      } else {
        g.attempts += 1;
        if (o.status === 'paid' && !g.hasPaid) {
          g.rep = o;
          g.hasPaid = true;
        }
      }
    }
    return [...groups.values()].map(({ rep, attempts }) => ({ rep, attempts }));
  }, [orders]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === 'paid');
    const toShip = paid.filter((o) => o.productKey && !o.trackingCode);
    const revenue = paid.reduce((s, o) => s + o.amountCharged, 0);
    return { rebobinadas: salesByGift.length, paid: paid.length, toShip: toShip.length, revenue };
  }, [orders, salesByGift]);

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

      {/* Abas: vendas, rebobinadas, mensagens e produção */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['vendas', 'rebobinadas', 'mensagens', 'produção'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] ${
              tab === t ? 'border-cyan text-cyan' : 'border-[var(--line)] text-dim hover:text-glow'
            }`}
          >
            {t === 'vendas' && `vendas · ${salesByGift.length}`}
            {t === 'rebobinadas' && `rebobinadas · ${gifts.length}`}
            {t === 'produção' && 'produção'}
            {t === 'mensagens' && (
              <>
                mensagens · {messages.length}
                {unread > 0 && (
                  <span className="rounded-full bg-magenta px-1.5 py-0.5 text-[0.6rem] leading-none text-tape">
                    {unread}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {tab === 'vendas' && (
        <>
          <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="rebobinadas" value={String(stats.rebobinadas)} />
            <StatCard label="pagos" value={String(stats.paid)} accent />
            <StatCard label="a enviar" value={String(stats.toShip)} warn={stats.toShip > 0} />
            <StatCard label="receita" value={formatBRL(stats.revenue)} accent />
          </section>

          {salesByGift.length === 0 ? (
            <p className="rounded-lg border border-[var(--line)] bg-panel/40 px-4 py-8 text-center text-dim">
              Nenhuma venda ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {salesByGift.map(({ rep, attempts }) => (
                <OrderCard key={rep.id} order={rep} attempts={attempts} onTracked={onTracked} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'rebobinadas' && <GiftsList gifts={gifts} />}

      {tab === 'mensagens' && <MessagesList messages={messages} />}

      {tab === 'produção' && <ProductionTab orders={orders} stock={stock} />}
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

function MessagesList({ messages: initial }: { messages: AdminMessage[] }) {
  const [messages, setMessages] = useState(initial);

  async function toggle(id: string, handled: boolean) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, handled } : m)));
    try {
      const res = await fetch(`/api/admin/messages/${id}/handled`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ handled }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // reverte se a API falhar
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, handled: !handled } : m)));
    }
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-lg border border-[var(--line)] bg-panel/40 px-4 py-8 text-center text-dim">
        Nenhuma mensagem ainda.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-xl border bg-panel/40 p-4 ${
            m.handled ? 'border-[var(--line)] opacity-60' : 'border-cyan/40'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-display text-glow">{m.name}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim">
              {fmtDate(m.createdAt)}
            </span>
          </div>
          <a
            href={`mailto:${m.email}`}
            className="mt-1 block font-mono text-[0.7rem] text-cyan hover:underline"
          >
            {m.email}
          </a>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-glow/90">{m.message}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => toggle(m.id, !m.handled)}
              className={`rounded-lg border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] transition ${
                m.handled
                  ? 'border-[var(--line)] text-dim hover:text-glow'
                  : 'border-cyan text-cyan hover:bg-cyan hover:text-tape'
              }`}
            >
              {m.handled ? '↩ reabrir' : '✓ marcar tratada'}
            </button>
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent('Rebobinaí ◄◄ — sua mensagem')}`}
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim transition hover:text-cyan"
            >
              responder ►
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductionTab({ orders, stock: initialStock }: { orders: AdminOrder[]; stock: AdminStock[] }) {
  const [stock, setStock] = useState(initialStock);
  const [filter, setFilter] = useState<'caneca' | 'camiseta'>('caneca');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Pedidos "não tratados" = pagos, do produto filtrado, ainda sem rastreio.
  const pending = orders.filter(
    (o) => o.status === 'paid' && o.productKey === filter && !o.trackingCode,
  );

  async function toggleStock(key: string, available: boolean) {
    setStock((prev) => prev.map((s) => (s.productKey === key ? { ...s, available } : s)));
    try {
      const res = await fetch(`/api/admin/stock/${key}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ available }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setStock((prev) => prev.map((s) => (s.productKey === key ? { ...s, available: !available } : s)));
    }
  }

  function switchFilter(f: 'caneca' | 'camiseta') {
    setFilter(f);
    setSelected(new Set());
  }

  function toggleSel(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function download() {
    const orderIds = pending.filter((o) => selected.has(o.id)).map((o) => o.id);
    if (orderIds.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/admin/work-orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productKey: filter, orderIds }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || 'Falha ao gerar o ZIP.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `producao-${filter}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha ao gerar o ZIP.');
    } finally {
      setBusy(false);
    }
  }

  const selCount = pending.filter((o) => selected.has(o.id)).length;

  return (
    <div className="space-y-8">
      {/* Estoque: liga/desliga a venda de cada produto */}
      <section>
        <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">estoque</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {stock.map((s) => (
            <div
              key={s.productKey}
              className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-panel/40 px-4 py-3"
            >
              <div>
                <p className="font-display text-glow">{s.name}</p>
                <p className={`font-mono text-[0.65rem] uppercase tracking-[0.2em] ${s.available ? 'text-cyan' : 'text-magenta'}`}>
                  {s.available ? 'à venda' : 'em falta'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleStock(s.productKey, !s.available)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] transition ${
                  s.available
                    ? 'border-[var(--line)] text-dim hover:border-magenta hover:text-magenta'
                    : 'border-cyan text-cyan hover:bg-cyan hover:text-tape'
                }`}
              >
                {s.available ? 'marcar em falta' : 'voltar à venda'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Plano de produção: seleciona pedidos e baixa o ZIP */}
      <section>
        <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
          plano de produção
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(['caneca', 'camiseta'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => switchFilter(f)}
              className={`rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] ${
                filter === f ? 'border-cyan text-cyan' : 'border-[var(--line)] text-dim hover:text-glow'
              }`}
            >
              {f} · {orders.filter((o) => o.status === 'paid' && o.productKey === f && !o.trackingCode).length}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set(pending.map((o) => o.id)))}
              disabled={pending.length === 0}
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim hover:text-cyan disabled:opacity-30"
            >
              todos
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              disabled={selCount === 0}
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim hover:text-cyan disabled:opacity-30"
            >
              limpar
            </button>
            <button
              type="button"
              onClick={download}
              disabled={busy || selCount === 0}
              className="rounded-lg bg-magenta px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-40"
            >
              {busy ? 'gerando…' : `baixar ZIP (${selCount})`}
            </button>
          </div>
        </div>

        {err && <p className="mb-3 text-sm text-magenta">{err}</p>}

        {pending.length === 0 ? (
          <p className="rounded-lg border border-[var(--line)] bg-panel/40 px-4 py-8 text-center text-dim">
            Nenhum pedido de {filter} pendente de produção.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((o) => {
              const s = o.shipping;
              const checked = selected.has(o.id);
              return (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
                    checked ? 'border-cyan bg-panel' : 'border-[var(--line)] bg-panel/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSel(o.id)}
                    className="h-4 w-4 accent-cyan"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-glow">
                      {s?.name || 'Sem nome'}
                      {o.productSize ? (
                        <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-cyan">
                          tam {o.productSize}
                        </span>
                      ) : null}
                    </span>
                    <span className="block font-mono text-[0.65rem] uppercase tracking-[0.15em] text-dim">
                      {s ? `${s.city}/${s.uf} · CEP ${s.cep}` : 'sem endereço'}
                      {o.productKey === 'caneca' && (o.photoUrl ? ' · com foto' : ' · sem foto')}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </section>
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
  attempts = 1,
  onTracked,
}: {
  order: AdminOrder;
  attempts?: number;
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
              {order.productSize ? ` · tam ${order.productSize}` : ''}
            </span>
          )}
          {attempts > 1 && (
            <span className="ml-2 rounded-full bg-[var(--line)]/60 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim">
              {attempts} tentativas
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
