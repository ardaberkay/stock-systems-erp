import { ApiError } from '@/lib/apiError';
import { env } from '@/lib/env';
import type { z } from 'zod';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions<TSchema extends z.ZodType> = {
  // Yanıt bu şemayla doğrulanır; dönen veri şemadan türetilen tiptedir.
  schema: TSchema;
  params?: Record<string, QueryValue>;
  body?: unknown;
  // React Query'nin queryFn'e verdiği signal; ekran kapanınca istek iptal edilir.
  signal?: AbortSignal;
};

type ApiClientConfig = {
  getAuthToken?: () => string | null;
  onUnauthorized?: () => void;
};

const REQUEST_TIMEOUT_MS = 15_000;

// Oturum altyapısı kurulduğunda configureApiClient ile bağlanır.
let getAuthToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureApiClient(config: ApiClientConfig) {
  if (config.getAuthToken) getAuthToken = config.getAuthToken;
  if (config.onUnauthorized) onUnauthorized = config.onUnauthorized;
}

function buildUrl(path: string, params?: Record<string, QueryValue>) {
  const url = `${env.apiUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

  if (!params) {
    return url;
  }

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `${url}?${query}` : url;
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

async function request<TSchema extends z.ZodType>(
  method: HttpMethod,
  path: string,
  { schema, params, body, signal }: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  if (!env.apiUrl) {
    throw new ApiError('config');
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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

  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError('parse', { status: response.status, data: result.error });
  }

  return result.data;
}

export const apiClient = {
  get: <TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>) =>
    request('GET', path, options),
  post: <TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>) =>
    request('POST', path, options),
  put: <TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>) =>
    request('PUT', path, options),
  patch: <TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>) =>
    request('PATCH', path, options),
  delete: <TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>) =>
    request('DELETE', path, options),
};
