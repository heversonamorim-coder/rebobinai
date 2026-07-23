/**
 * Injeta um bloco schema.org (JSON-LD) no HTML renderizado no servidor —
 * é assim que Google (rich results) e motores de resposta (AEO) leem a
 * estrutura da página. Server component, zero JS no cliente.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON puro gerado no servidor a partir de dados nossos (não do usuário).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
