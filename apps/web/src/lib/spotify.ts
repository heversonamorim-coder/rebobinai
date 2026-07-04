/**
 * Converte um link do Spotify (track/album/playlist/episode) na URL de embed
 * usada no iframe do player. Aceita links com locale (ex.: /intl-pt/track/…) e
 * querystring. Retorna null se não for um link reconhecível do Spotify.
 */
const EMBEDDABLE = ['track', 'album', 'playlist', 'episode', 'show', 'artist'];

export function spotifyEmbedUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!u.hostname.endsWith('spotify.com')) return null;

  const parts = u.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex((p) => EMBEDDABLE.includes(p));
  if (idx === -1) return null;
  const type = parts[idx];
  const id = parts[idx + 1];
  if (!id || !/^[a-zA-Z0-9]+$/.test(id)) return null;

  return `https://open.spotify.com/embed/${type}/${id}`;
}
