/**
 * List query contract for endpoints that page, sort and filter on the server. The query maps
 * to URL parameters (`page`, `pageSize`, `sort`, `direction`, `search`, plus each filter), and
 * the API answers with a `PagedResult`. MUI X Data Grid's server-side mode maps onto it directly.
 */

export type SortDirection = 'asc' | 'desc'

export interface SortRequest<Field extends string = string> {
  field: Field
  direction: SortDirection
}

export interface PageRequest {
  /** Zero-based, as in the Data Grid's pagination model. */
  page: number
  pageSize: number
}

export interface ListQuery<SortField extends string = string, Filters extends object = object> {
  page?: PageRequest
  sort?: SortRequest<SortField>
  /** Free-text match, e.g. on symbol and company name. */
  search?: string
  filters?: Partial<Filters>
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  /** Matching items across all pages, after filtering. */
  totalCount: number
}
