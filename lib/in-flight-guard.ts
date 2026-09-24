/**
 * In-flight mutation guard (dedupe de requests concorrentes).
 *
 * Objetivo: impedir que um duplo-clique (ou re-render acidental) dispare a MESMA
 * mutação (POST/PATCH/PUT/DELETE) duas vezes no backend. Enquanto uma request
 * idêntica está "em voo", chamadas subsequentes com a mesma chave reutilizam a
 * mesma Promise em vez de disparar uma nova request.
 *
 * É uma defesa em profundidade, complementar à trava de UI do `Button`
 * (que desabilita o botão enquanto o onClick assíncrono não resolve). Aqui o foco
 * é a rede de segurança na camada de rede, cobrindo também botões ainda não
 * migrados e fluxos disparados fora de um botão.
 *
 * Semântica segura:
 * - A chave inclui método + URL + corpo, então mutações DIFERENTES nunca são
 *   deduplicadas — apenas cliques repetidos idênticos.
 * - A entrada é removida assim que a Promise conclui (sucesso ou erro), então um
 *   retry após falha funciona normalmente.
 */

const inFlight = new Map<string, Promise<unknown>>();

/** Métodos considerados mutação. GET/HEAD nunca são deduplicados. */
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isMutationMethod(method: string | undefined): boolean {
  return MUTATION_METHODS.has((method || "GET").toUpperCase());
}

/**
 * Executa `run()` deduplicando por `key` enquanto a Promise não conclui.
 * Se já houver uma execução em voo com a mesma chave, retorna a Promise existente.
 */
export function dedupeInFlight<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = (async () => run())().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise as Promise<T>;
}

/**
 * Monta uma chave estável para dedupe a partir de método, URL e corpo.
 * O corpo é serializado de forma best-effort (string/JSON); tipos não
 * serializáveis (FormData, Blob, etc.) usam um marcador, evitando dedupe
 * incorreto entre payloads distintos não comparáveis.
 */
export function buildMutationKey(
  method: string,
  url: string,
  body?: BodyInit | null
): string {
  let bodyKey = "";
  if (typeof body === "string") {
    bodyKey = body;
  } else if (body == null) {
    bodyKey = "";
  } else {
    // FormData/Blob/etc. não são comparáveis de forma barata: não deduplica.
    bodyKey = `__nondeterministic__:${Date.now()}:${Math.random()}`;
  }
  return `${method.toUpperCase()} ${url}\n${bodyKey}`;
}

/** Status HTTP que não podem ter corpo (proíbem body no construtor de Response). */
const NULL_BODY_STATUS = new Set([101, 103, 204, 205, 304]);

/**
 * Wrapper de `fetch` com dedupe de mutações em voo.
 *
 * Mesma assinatura de `fetch`: use como drop-in nas libs que fazem `fetch` cru.
 * - Para GET/HEAD, chama `fetch` diretamente (sem dedupe).
 * - Para POST/PUT/PATCH/DELETE, deduplica requests idênticas concorrentes
 *   (mesma URL + método + corpo), evitando request duplicado por duplo-clique.
 *
 * Importante: quando uma mutação é deduplicada, o corpo da resposta é
 * bufferizado uma única vez e cada chamador recebe uma `Response` NOVA e
 * independente. Isso evita o erro "body stream already read" que ocorreria se a
 * mesma `Response` fosse compartilhada entre dois chamadores.
 */
export function guardedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || "GET").toString();
  if (!isMutationMethod(method)) {
    return fetch(input, init);
  }
  const url = typeof input === "string" ? input : input.toString();
  const key = buildMutationKey(method, url, init?.body ?? null);

  const snapshot = dedupeInFlight(key, async () => {
    const res = await fetch(input, init);
    const bodyBuffer = await res.arrayBuffer();
    return {
      bodyBuffer,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    };
  });

  // Reconstrói uma Response independente por chamador (corpo relegível).
  return snapshot.then((snap) => {
    const body = NULL_BODY_STATUS.has(snap.status) ? null : snap.bodyBuffer;
    return new Response(body, {
      status: snap.status,
      statusText: snap.statusText,
      headers: snap.headers,
    });
  });
}
