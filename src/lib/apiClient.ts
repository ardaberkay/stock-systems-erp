import { ApiError } from '@/lib/apiError';
import { env } from '@/lib/env';
import { z } from 'zod';

type RequestOptions<TSchema extends z.ZodType> = {
  // Yanıtın `result` alanı bu şemayla doğrulanır; dönen veri şemadan türetilen tiptedir.
  schema: TSchema;
  arguments?: Record<string, unknown>;
  // React Query'nin queryFn'e verdiği signal; ekran kapanınca istek iptal edilir.
  signal?: AbortSignal;
};

type Credentials = {
  userName: string;
  password: string;
};

type ApiClientConfig = {
  getCredentials?: () => Credentials;
  onUnauthorized?: () => void;
};

const REQUEST_TIMEOUT_MS = 20_000;
// Hızlı art arda istekler rate limit'e takılıyor; bu aralıkla atılanlar testte geçti.
const MIN_REQUEST_GAP_MS = 1_250;

const envelopeSchema = z.object({
  status: z.boolean(),
  error: z.string().nullish(),
  result: z.unknown(),
});

// GEÇİCİ: login gelene kadar test hesabı kullanılır; configureApiClient ile değiştirilir.
let getCredentials: () => Credentials = () => ({
  userName: env.devUsername,
  password: env.devPassword,
});
let onUnauthorized: () => void = () => {};

let queueTail: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

export function configureApiClient(config: ApiClientConfig) {
  if (config.getCredentials) getCredentials = config.getCredentials;
  if (config.onUnauthorized) onUnauthorized = config.onUnauthorized;
}

function buildUrl(path: string) {
  return `${env.apiUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

// Tüm istekler tek sırada ve aralıklı atılır; ekranlar rate limit'i düşünmek zorunda kalmaz.
function enqueue<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  const run = async () => {
    // Sırada beklerken iptal edilen istek, sıradakilerin süresini harcamaz.
    if (signal?.aborted) {
      throw new Error('aborted');
    }

    const wait = lastRequestAt + MIN_REQUEST_GAP_MS - Date.now();
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    lastRequestAt = Date.now();
    return task();
  };

  const result = queueTail.then(run, run);
  queueTail = result.catch(() => undefined);
  return result;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    if (response.ok) {
      throw new ApiError('parse', { status: response.status, data: text });
    }
    return text;
  }
}

async function send<TSchema extends z.ZodType>(
  path: string,
  { schema, arguments: args, signal }: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth: getCredentials(), arguments: args ?? {} }),
      signal: controller.signal,
    });
  } catch (error) {
    // React Query'nin iptal ettiği istek hata sayılmaz, olduğu gibi bırakılır.
    if (signal?.aborted) {
      throw error;
    }
    throw new ApiError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }

  const data = await readBody(response);

  if (!response.ok) {
    const error = ApiError.fromStatus(response.status, data);
    if (error.kind === 'unauthorized') {
      onUnauthorized();
    }
    throw error;
  }

  const envelope = envelopeSchema.safeParse(data);

  if (!envelope.success) {
    throw new ApiError('parse', { status: response.status, data: envelope.error });
  }

  if (!envelope.data.status) {
    const error = ApiError.fromServiceCode(envelope.data.error);
    if (error.kind === 'unauthorized') {
      onUnauthorized();
    }
    throw error;
  }

  const result = schema.safeParse(envelope.data.result);

  if (!result.success) {
    throw new ApiError('parse', { status: response.status, data: result.error });
  }

  return result.data;
}

export const apiClient = {
  // ButikSistem'de tüm çağrılar POST'tur: `{auth, arguments}` gövdesi ile.
  post: <TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>) => {
    if (!env.apiUrl) {
      return Promise.reject(new ApiError('config'));
    }
    return enqueue(() => send(path, options), options.signal);
  },
};
