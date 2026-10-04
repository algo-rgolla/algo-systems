const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type QueryValue = string | number | boolean | null | undefined

interface RequestOptions {
  query?: Record<string, QueryValue>
  body?: unknown
  signal?: AbortSignal
}

/**
 * Supplies the Authorization header once auth is wired up. The API's Firebase
 * middleware does not verify tokens yet, so this returns nothing for now.
 */
let getAccessToken: () => Promise<string | null> = async () => null

export function setAccessTokenProvider(provider: () => Promise<string | null>) {
  getAccessToken = provider
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = `${API_BASE_URL}${path}`
  if (!query) return url

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

/**
 * The API returns plain-text messages for 400/404/500 (e.g. "Invalid Id."), but
 * unhandled exceptions arrive as a full .NET stack trace. Keep only the first line.
 */
function errorMessage(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0].trim()
  return firstLine.length > 200 ? `${firstLine.slice(0, 200)}…` : firstLine
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const token = await getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const text = await response.text()

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(text) || response.statusText || 'Request failed',
    )
  }

  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    // Some endpoints (add-edit/delete algo portfolio) return a bare string.
    return text as T
  }
}

export const httpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),
  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', path, options),
}
