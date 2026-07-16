'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Lightbox } from '../../components/lightbox';
import { ShareTools } from '../../components/share-tools';
import { StoriesViewer } from '../../components/stories-viewer';
import {
  checkoutCard,
  checkoutPix,
  getFreight,
  getGift,
  getOrderStatus,
  getPlans,
  getProductAvailability,
  uploadGiftImageProgress,
  type PhysicalCheckout,
  type PixCheckoutResult,
  type PlanKeyPaid,
} from '../../lib/api';
import { assetUrl, clearDraftRef, loadDraftRef, type DraftRef, type Gift, type GiftAsset } from '../../lib/gift';
import { formatBRL, PLANS_FALLBACK, priceDisplay, type Plan } from '../../lib/plans';
import {
  emptyShipping,
  PHYSICAL_PRODUCTS,
  physicalFromPrice,
  SHIRT_SIZES,
  type FreightQuote,
  type ProductKey,
  type Shipping,
  type ShirtSize,
} from '../../lib/products';
import { ProductThumb } from '../../components/product-thumb';

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

  // Plano físico ("+Lembrança física"): produto, foto (caneca), endereço, frete.
  const [assets, setAssets] = useState<GiftAsset[]>([]);
  const [product, setProduct] = useState<ProductKey | ''>('');
  const [size, setSize] = useState<ShirtSize | ''>('');
  const [photoAssetId, setPhotoAssetId] = useState<string>('');
  const [availability, setAvailability] = useState<Partial<Record<ProductKey, boolean>>>({});
  // Imagem do produto ampliada (lupa) — o cliente vê como vai ficar.
  const [zoomImage, setZoomImage] = useState<{ url: string; alt: string } | null>(null);
  // Presente montado com IA → Digital travado (só Pra Sempre / +Lembrança Física).
  const [composedWithAi, setComposedWithAi] = useState(false);
  const [shipping, setShipping] = useState<Shipping>(emptyShipping());
  const [freight, setFreight] = useState<FreightQuote | null>(null);
  const [freightErr, setFreightErr] = useState<string | null>(null);

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
        setAssets(g.assets ?? []);
        // Presente com IA não pode ir no Digital — já entra num plano com IA.
        if (g.composedWithAi) {
          setComposedWithAi(true);
          setPlanKey((k) => (k === 'digital' ? 'forever' : k));
        }
        // Já pago (voltou pra cá): mostra direto a tela de compartilhar.
        if (g.status === 'paid' && g.slug) {
          setPaidGift(g);
          setPaid(true);
        }
      })
      .catch(() => setNoDraft(true));
    getPlans().then((p) => p.length > 0 && setPlans(p));
  }, []);

  // Disponibilidade de estoque (Tarefa 8) — produto esgotado não pode ser vendido.
  useEffect(() => {
    getProductAvailability().then(setAvailability);
  }, []);

  const isPhysical = planKey === 'quadro';

  // Cotação de frete por CEP — recalcula quando muda produto ou CEP (8 dígitos).
  useEffect(() => {
    if (!isPhysical || !product) {
      setFreight(null);
      return;
    }
    const cep = shipping.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      setFreight(null);
      return;
    }
    let alive = true;
    setFreightErr(null);
    getFreight(cep, product)
      .then((q) => alive && setFreight(q))
      .catch((e) => {
        if (!alive) return;
        setFreight(null);
        setFreightErr(e instanceof Error ? e.message : 'Não consegui calcular o frete.');
      });
    return () => {
      alive = false;
    };
  }, [isPhysical, product, shipping.cep]);

  // Poll do pedido enquanto não confirmar (o webhook do Asaas é assíncrono).
  // O endpoint exige o x-edit-token (dono do presente) — sem ele volta 403 e a
  // tela ficaria presa em "Aguardando pagamento...".
  useEffect(() => {
    if (!orderId || paid || !ref) return;
    const editToken = ref.editToken;
    const t = setInterval(async () => {
      try {
        const s = await getOrderStatus(orderId, editToken);
        if (s.status === 'paid') setPaid(true);
      } catch {
        // mantém o poll
      }
    }, 3000);
    return () => clearInterval(t);
  }, [orderId, paid, ref]);

  // Ao confirmar, busca o presente recém-liberado (slug + payload) pra tela de
  // compartilhamento — sem sair da página.
  useEffect(() => {
    if (!paid || !ref || paidGift) return;
    getGift(ref.id, ref.editToken)
      .then((g) => setPaidGift(g))
      .catch(() => setError('Pagamento confirmado, mas não consegui abrir o presente. Recarregue.'));
  }, [paid, ref, paidGift]);

  // Campos extras do plano físico (vazios nos planos digitais).
  const physical: PhysicalCheckout = isPhysical
    ? {
        product: product || undefined,
        photoAssetId: photoAssetId || undefined,
        size: size || undefined,
        shipping,
      }
    : {};

  async function payPix() {
    if (!ref) return;
    setLoading(true);
    setError(null);
    try {
      const res = await checkoutPix({ giftId: ref.id, editToken: ref.editToken, planKey, customer, ...physical });
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
        ...physical,
      });
      setOrderId(res.orderId);
      if (res.status === 'paid') setPaid(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível processar o cartão.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadMugPhoto(file: File) {
    if (!ref) return;
    try {
      const asset = await uploadGiftImageProgress(ref.id, ref.editToken, file);
      setAssets((prev) => [...prev, asset]);
      setPhotoAssetId(asset.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar a foto.');
    }
  }

  // Total e validação do plano físico.
  const shippingComplete = Boolean(
    shipping.name &&
      shipping.phone &&
      shipping.cep.replace(/\D/g, '').length === 8 &&
      shipping.street &&
      shipping.number &&
      shipping.district &&
      shipping.city &&
      shipping.uf,
  );
  const physicalValid =
    !isPhysical ||
    Boolean(
      product &&
        availability[product] !== false &&
        shippingComplete &&
        freight &&
        (product !== 'caneca' || photoAssetId) &&
        (product !== 'camiseta' || size),
    );

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
  // No plano físico o valor é produto + frete; nos digitais, o preço do plano.
  const amountLabel = isPhysical
    ? freight
      ? formatBRL(freight.total)
      : 'calcule o frete'
    : selected
      ? priceDisplay(selected).current
      : '';
  const payDisabled = loading || (isPhysical && !physicalValid);

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
                  // Plano físico mostra "a partir de" o produto mais barato.
                  const priceLabel =
                    p.key === 'quadro'
                      ? `a partir de ${formatBRL(physicalFromPrice())}`
                      : priceDisplay(p).current;
                  const active = p.key === planKey;
                  // Presente com IA trava o Digital (não inclui IA).
                  const locked = composedWithAi && p.key === 'digital';
                  return (
                    <button
                      key={p.key}
                      type="button"
                      disabled={locked}
                      onClick={() => !locked && setPlanKey(p.key as PlanKeyPaid)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left ${
                        locked
                          ? 'cursor-not-allowed border-[var(--line)] bg-panel/20 opacity-55'
                          : active
                            ? 'border-magenta bg-panel'
                            : 'border-[var(--line)] bg-panel/40'
                      }`}
                    >
                      <span>
                        <span className="font-display text-glow">{p.name}</span>
                        {locked ? (
                          <span className="ml-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-magenta">
                            usa IA — indisponível
                          </span>
                        ) : (
                          p.tagline && <span className="ml-2 text-xs text-dim">{p.tagline}</span>
                        )}
                      </span>
                      <span className="shrink-0 font-display text-cyan">{priceLabel}</span>
                    </button>
                  );
                })}
            </div>
            {composedWithAi && (
              <p className="mt-3 text-xs leading-relaxed text-dim">
                Este presente foi montado com IA — disponível no <b className="text-glow">Pra Sempre</b> e no{' '}
                <b className="text-glow">+ Lembrança Física</b>.{' '}
                <Link
                  href="/criar"
                  onClick={() => clearDraftRef()}
                  className="text-cyan underline underline-offset-2 hover:text-glow"
                >
                  Prefere o Digital? Recomeçar sem a IA
                </Link>
                .
              </p>
            )}
          </div>

          {/* Plano físico: produto + foto (caneca) + endereço + frete */}
          {isPhysical && (
            <div className="mb-6 space-y-5 rounded-xl border border-magenta/40 bg-panel/30 p-5">
              <div>
                <span className={labelClass}>Produto</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PHYSICAL_PRODUCTS.map((p) => {
                    const active = product === p.key;
                    const soldOut = availability[p.key] === false;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        disabled={soldOut}
                        onClick={() => {
                          if (soldOut) return;
                          setProduct(p.key);
                          if (!p.needsPhoto) setPhotoAssetId('');
                          if (!p.needsSize) setSize('');
                        }}
                        className={`relative flex items-center gap-3 rounded-lg border px-3 py-3 text-left ${
                          soldOut
                            ? 'cursor-not-allowed border-[var(--line)] bg-panel/20 opacity-60'
                            : active
                              ? 'border-cyan bg-panel'
                              : 'border-[var(--line)] bg-panel/40'
                        }`}
                      >
                        <ProductThumb
                          src={p.image}
                          emoji={p.emoji}
                          alt={p.name}
                          onZoom={(url, alt) => setZoomImage({ url, alt })}
                        />
                        <span className="min-w-0">
                          <span className="block font-display text-glow">{p.name}</span>
                          {soldOut ? (
                            <span className="mt-1 block font-mono text-xs uppercase tracking-[0.15em] text-magenta">
                              em falta
                            </span>
                          ) : (
                            <span className="mt-1 block font-mono text-xs text-cyan">
                              {formatBRL(p.price)} + frete
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {product === 'camiseta' && (
                <div>
                  <span className={labelClass}>Tamanho da camiseta</span>
                  <div className="flex flex-wrap gap-2">
                    {SHIRT_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`h-11 w-11 rounded-lg border font-display text-sm font-semibold transition ${
                          size === s
                            ? 'border-cyan bg-cyan text-tape'
                            : 'border-[var(--line)] bg-panel/40 text-glow hover:border-cyan'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product === 'caneca' && (
                <div>
                  <span className={labelClass}>Foto da caneca</span>
                  <div className="flex flex-wrap gap-2">
                    {assets
                      .filter((a) => a.type === 'image' && assetUrl(a))
                      .map((a) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={a.id}
                          src={assetUrl(a)}
                          alt=""
                          onClick={() => setPhotoAssetId(a.id)}
                          className={`h-16 w-16 cursor-pointer rounded-lg border-2 object-cover ${
                            photoAssetId === a.id ? 'border-cyan' : 'border-[var(--line)]'
                          }`}
                        />
                      ))}
                    <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-center text-dim hover:border-cyan hover:text-cyan">
                      <span className="text-lg leading-none">＋</span>
                      <span className="font-mono text-[0.5rem] uppercase">subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadMugPhoto(f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-dim/70">
                    escolha uma foto sua ou suba uma nova
                  </p>
                </div>
              )}

              <div>
                <span className={labelClass}>Entrega</span>
                <div className="space-y-3">
                  <Field label="Nome de quem recebe" value={shipping.name} onChange={(v) => setShipping({ ...shipping, name: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CEP" value={shipping.cep} onChange={(v) => setShipping({ ...shipping, cep: v })} placeholder="00000-000" />
                    <Field label="Telefone" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} placeholder="DDD + número" />
                  </div>
                  <div className="grid grid-cols-[1fr_90px] gap-3">
                    <Field label="Rua" value={shipping.street} onChange={(v) => setShipping({ ...shipping, street: v })} />
                    <Field label="Nº" value={shipping.number} onChange={(v) => setShipping({ ...shipping, number: v })} />
                  </div>
                  <Field label="Complemento (opcional)" value={shipping.complement ?? ''} onChange={(v) => setShipping({ ...shipping, complement: v })} />
                  <div className="grid grid-cols-[1fr_1fr_70px] gap-3">
                    <Field label="Bairro" value={shipping.district} onChange={(v) => setShipping({ ...shipping, district: v })} />
                    <Field label="Cidade" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                    <Field label="UF" value={shipping.uf} onChange={(v) => setShipping({ ...shipping, uf: v.toUpperCase().slice(0, 2) })} />
                  </div>
                </div>
                {freightErr && <p className="mt-2 text-sm text-magenta">{freightErr}</p>}
              </div>

              {product && (
                <div className="rounded-lg border border-[var(--line)] bg-tape/50 p-4 font-mono text-xs text-dim">
                  <div className="flex justify-between">
                    <span>produto</span>
                    <span className="text-glow">
                      {formatBRL(PHYSICAL_PRODUCTS.find((p) => p.key === product)?.price ?? 0)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span>frete{freight ? ` · ${freight.region}` : ''}</span>
                    <span className="text-glow">{freight ? formatBRL(freight.shippingCost) : 'informe o CEP'}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-[var(--line)] pt-2 text-sm">
                    <span className="text-cyan">total</span>
                    <span className="font-display text-cyan">{freight ? formatBRL(freight.total) : '—'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

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
              disabled={payDisabled}
              className="w-full rounded-lg bg-magenta px-6 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'gerando…' : `gerar Pix · ${amountLabel}`}
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
                disabled={payDisabled}
                className="w-full rounded-lg bg-magenta px-6 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'processando…' : `pagar ${amountLabel}`}
              </button>
            </div>
          )}

          <p className="mt-6 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/60">
            pagamento processado pelo Asaas · seus dados de cartão não ficam no Rebobinaí
          </p>
        </>
      )}

      {zoomImage && (
        <Lightbox
          photos={[{ id: 'produto', url: zoomImage.url }]}
          index={0}
          onIndex={() => {}}
          onClose={() => setZoomImage(null)}
        />
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
