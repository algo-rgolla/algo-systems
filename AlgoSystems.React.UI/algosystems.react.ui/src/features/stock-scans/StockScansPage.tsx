import Button from '@mui/material/Button'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { MARKETS, type Market } from '@/features/stocks/markets'
import { DataTable } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageContent } from '@/shared/components/PageContent'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { StatCell, StatStrip } from '@/shared/components/StatStrip'
import { StatusPill } from '@/shared/components/StatusPill'
import type { IsoDate } from '@/shared/formatting/dates'
import { formatDate, formatTime } from '@/shared/formatting/format'
import { useScanResults, useScanSummaries } from './api'
import { SCAN_CATALOG } from './catalog'
import { SCAN_COLUMNS } from './columns'
import {
  DEFAULT_SCAN_FILTERS,
  filterScanResults,
  scanFilterOptions,
  STRONG_SCORE,
  summariseScanResults,
  type ScanFilters,
} from './filters'
import { parseScanType, type ScanSummary } from './model'
import { ScanFiltersBar } from './ScanFiltersBar'
import { ScanTypeSelector } from './ScanTypeTiles'
import type { ScanType } from './types'

const PAGE_SIZE = 10

/** "4:05 pm" in each exchange's own time, for the markets in view. */
function lastScanTime(summary: ScanSummary | undefined, market: Market | 'all') {
  const runs = Object.entries(summary?.runAtByMarket ?? {}) as [Market, string][]
  const shown = runs.filter(([m]) => market === 'all' || m === market)
  if (shown.length === 0) return { time: '—', date: null }
  const times = [...new Set(shown.map(([m, at]) => formatTime(at, MARKETS[m].timeZone)))]
  return { time: times.join(' / '), date: shown[0][1].slice(0, 10) as IsoDate }
}

export default function StockScansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // The selected scan lives in the URL, so dashboard links and reloads land on it.
  const scanType = parseScanType(searchParams.get('scan'))
  const summaries = useScanSummaries()
  const results = useScanResults(scanType)

  // Filters belong to one scan: switching scans starts from the defaults.
  const [filterState, setFilterState] = useState<{ scanType: ScanType; filters: ScanFilters }>({
    scanType,
    filters: DEFAULT_SCAN_FILTERS,
  })
  const filters = filterState.scanType === scanType ? filterState.filters : DEFAULT_SCAN_FILTERS
  const setFilters = (next: ScanFilters) => setFilterState({ scanType, filters: next })

  const all = useMemo(() => results.data ?? [], [results.data])
  const filtered = useMemo(() => filterScanResults(all, filters), [all, filters])
  const options = useMemo(() => scanFilterOptions(all), [all])
  const summary = summariseScanResults(filtered)
  const lastScan = lastScanTime(
    summaries.data?.find((s) => s.scanType === scanType),
    filters.market,
  )
  const label = SCAN_CATALOG[scanType].label
  const loading = results.isPending

  return (
    <>
      <PageHeader title="Stock Scans" />
      <PageContent>
        <Panel title="Select scan type" tightHeader>
          {summaries.isError ? (
            <ErrorState error={summaries.error} onRetry={() => summaries.refetch()} />
          ) : (
            <ScanTypeSelector
              summaries={summaries.data}
              value={scanType}
              onChange={(next) => setSearchParams({ scan: next })}
            />
          )}
        </Panel>

        <StatStrip>
          <StatCell
            label="Results in this scan"
            loading={loading}
            value={results.isError ? '—' : String(summary.count)}
            detail={summary.count === all.length ? 'Matching stocks' : `of ${all.length} shown`}
          />
          <StatCell
            label="Strong scan scores"
            loading={loading}
            value={results.isError ? '—' : String(summary.strongCount)}
            detail={`Score ≥ ${STRONG_SCORE}/10`}
          />
          <StatCell
            label="Last scan"
            loading={summaries.isPending}
            value={lastScan.time}
            detail={lastScan.date ? `${formatDate(lastScan.date)}, exchange time` : ''}
          />
        </StatStrip>

        <Panel
          title={`${label} results`}
          actions={<StatusPill tone="neutral">Simulated, not trading signals</StatusPill>}
        >
          {results.isError ? (
            <ErrorState error={results.error} onRetry={() => results.refetch()} />
          ) : (
            <>
              <ScanFiltersBar
                filters={filters}
                onChange={setFilters}
                sectors={options.sectors}
                signals={options.signals}
              />
              {!loading && all.length === 0 ? (
                <EmptyState
                  title={`No ${label} results`}
                  message="No stocks met this scan’s rules in the latest demo run."
                />
              ) : !loading && filtered.length === 0 ? (
                <EmptyState
                  title="No results match these filters"
                  message="Try a different search or fewer filters."
                  action={
                    <Button variant="outlined" onClick={() => setFilters(DEFAULT_SCAN_FILTERS)}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <DataTable
                  // Remount per scan so sorting and paging start fresh with its columns.
                  key={scanType}
                  rows={filtered}
                  columns={SCAN_COLUMNS[scanType]}
                  getRowId={(row) => row.stock.key}
                  loading={loading}
                  aria-label={`${label} results`}
                  pageSizeOptions={[PAGE_SIZE, 25, 50]}
                  initialState={{
                    sorting: { sortModel: [{ field: 'score', sort: 'desc' }] },
                    pagination: { paginationModel: { pageSize: PAGE_SIZE } },
                  }}
                />
              )}
            </>
          )}
        </Panel>
      </PageContent>
    </>
  )
}
