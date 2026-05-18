// Rate limiter in-memory simples (por IP).
// Limitação conhecida: Workers podem ter múltiplas instâncias — não é à prova
// de bala, mas barra abuso casual sem dependência externa. Para produção
// pesada, mover para Upstash Redis ou tabela Supabase com TTL.

import { getRequest } from "@tanstack/react-start/server";

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

function clientIp(): string {
  const req = getRequest();
  const h = req?.headers;
  if (!h) return "unknown";
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Permite no máximo `max` chamadas em `windowMs` milissegundos por IP+chave.
 * Lança Error("Muitas requisições...") quando estoura.
 */
export function rateLimit(key: string, max: number, windowMs: number): void {
  const ip = clientIp();
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const b = store.get(bucketKey);

  if (!b || b.resetAt < now) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (b.count >= max) {
    const seconds = Math.ceil((b.resetAt - now) / 1000);
    throw new Error(`Muitas requisições. Tente novamente em ${seconds}s.`);
  }
  b.count += 1;

  // Limpeza esporádica
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
  }
}
