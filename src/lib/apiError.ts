export type ApiErrorKind =
  | 'config'
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'rateLimit'
  | 'server'
  | 'parse'
  | 'unknown';

type ApiErrorOptions = {
  status?: number;
  data?: unknown;
};

// apiClient'tan çıkan her hata bu tipe çevrilir; ekranlar yalnızca `kind`'a bakar.
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly data?: unknown;

  constructor(kind: ApiErrorKind, options: ApiErrorOptions = {}) {
    super(options.status ? `ApiError: ${kind} (${options.status})` : `ApiError: ${kind}`);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.data = options.data;
  }

  static fromStatus(status: number, data?: unknown): ApiError {
    return new ApiError(kindFromStatus(status), { status, data });
  }

  // Sunucu hataları HTTP 200 ve `{status: false, error: 'Kod'}` olarak gelir.
  static fromServiceCode(code: string | null | undefined): ApiError {
    return new ApiError(kindFromServiceCode(code ?? ''), { data: code });
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429) return 'rateLimit';
  if (status >= 500) return 'server';
  return 'unknown';
}

function kindFromServiceCode(code: string): ApiErrorKind {
  if (code === 'Rate Limit Exceeded') return 'rateLimit';
  if (code === 'ServiceUserNotFound') return 'unauthorized';
  if (code === 'MaxQueryRangeIs30Days' || code.endsWith('FormatNotValid')) return 'validation';
  return 'unknown';
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Kullanıcıya gösterilecek mesajın i18n anahtarı: t(getErrorMessageKey(error))
export function getErrorMessageKey(error: unknown): `errors.${ApiErrorKind}` {
  return isApiError(error) ? `errors.${error.kind}` : 'errors.unknown';
}
