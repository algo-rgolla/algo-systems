import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { GridColDef } from '@mui/x-data-grid'
import { Fragment } from 'react'
import { CandlestickChart } from '@/shared/components/CandlestickChart'
import { DataTable } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { MetricRow } from '@/shared/components/MetricRow'
import { PageContent, SplitLayout } from '@/shared/components/PageContent'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { PanelLink } from '@/shared/components/PanelLink'
import { ProgressBar } from '@/shared/components/ProgressBar'
import { SignedValue } from '@/shared/components/SignedValue'
import { StatCell, StatStrip } from '@/shared/components/StatStrip'
import { StatusPill } from '@/shared/components/StatusPill'
import { TwoLineCell } from '@/shared/components/TwoLineCell'
import { formatCurrency, formatPercent, formatPrice } from '@/shared/formatting/format'
import { sampleAllocation, sampleCandles, sampleStocks, type SampleStock } from './sampleData'

const columns: GridColDef<SampleStock>[] = [
  {
    field: 'symbol',
    headerName: 'Stock',
    flex: 1,
    minWidth: 160,
    renderCell: ({ row }) => <TwoLineCell primary={row.symbol} secondary={row.name} />,
  },
  {
    field: 'price',
    headerName: 'Price',
    type: 'number',
    width: 100,
    valueFormatter: (value: number) => formatPrice(value),
  },
  {
    field: 'changePercent',
    headerName: 'Day change',
    type: 'number',
    width: 110,
    renderCell: ({ value }) => <SignedValue value={value ?? null} format={formatPercent} />,
  },
  { field: 'sector', headerName: 'Sector', width: 150 },
  {
    field: 'signal',
    headerName: 'Signal',
    width: 140,
    renderCell: ({ row }) => <StatusPill tone={row.signalTone}>{row.signal}</StatusPill>,
  },
]

const signedCurrency = (value: number | null) => formatCurrency(value, { signed: true })

/** Development-only page (/dev/theme) that renders every shared visual building block. */
export default function ThemePreviewPage() {
  return (
    <>
      <PageHeader
        title="Theme preview"
        actions={
          <>
            <Button variant="outlined">Secondary</Button>
            <Button variant="contained" startIcon={<AddIcon />}>
              Add holding
            </Button>
          </>
        }
      />
      <PageContent>
        <StatStrip>
          <StatCell label="Total market value" value="$248,650" detail="Across 12 positions" />
          <StatCell
            label="Total return"
            value={signedCurrency(28420)}
            detail="+12.90% all time"
            detailDirection="up"
          />
          <StatCell
            label="Today’s change"
            value={signedCurrency(-1284)}
            detail={`${formatPercent(-0.52)} today`}
            detailDirection="down"
          />
          <StatCell label="Cash available" value="" loading />
        </StatStrip>

        <Panel title="Holdings" actions={<PanelLink to="/portfolio">View all</PanelLink>}>
          <DataTable rows={sampleStocks} columns={columns} getRowId={(row) => row.rowKey} />
        </Panel>

        <SplitLayout>
          <Panel title="Financial values and status labels">
            <MetricRow
              label="Positive"
              value={<SignedValue value={360} format={signedCurrency} />}
            />
            <MetricRow
              label="Negative"
              value={<SignedValue value={-213.36} format={signedCurrency} />}
            />
            <MetricRow label="Unchanged" value={<SignedValue value={0} format={formatPercent} />} />
            <MetricRow
              label="Missing"
              value={<SignedValue value={null} format={formatPercent} />}
            />
            <MetricRow
              label="Pills"
              value={
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'end' }}>
                  <StatusPill>Win</StatusPill>
                  <StatusPill tone="warn">EMA crossover</StatusPill>
                  <StatusPill tone="negative">Loss</StatusPill>
                  <StatusPill tone="neutral">Long</StatusPill>
                </Stack>
              }
            />
          </Panel>
          <Panel title="Sector allocation">
            {sampleAllocation.map(({ sector, percent }) => (
              <Fragment key={sector}>
                <MetricRow label={sector} value={`${percent}%`} />
                <ProgressBar value={percent} label={`${sector} allocation`} />
              </Fragment>
            ))}
            <Box sx={{ mt: '14px' }}>
              <ProgressBar value={63} tone="up" label="Win rate" />
            </Box>
          </Panel>
        </SplitLayout>

        <Panel title="Candlestick chart">
          <CandlestickChart
            candles={sampleCandles}
            height={{ xs: 220, md: 280 }}
            label="Sample daily candlestick chart"
          />
        </Panel>

        <SplitLayout>
          <Panel title="Empty and loading">
            <EmptyState
              title="No holdings yet"
              message="Add your first holding to start tracking performance."
              action={
                <Button variant="contained" startIcon={<AddIcon />}>
                  Add holding
                </Button>
              }
            />
            <LoadingState label="Loading holdings" minHeight={80} />
          </Panel>
          <Panel title="Error">
            <ErrorState error={new Error('The API returned 500.')} onRetry={() => undefined} />
          </Panel>
        </SplitLayout>
      </PageContent>
    </>
  )
}
