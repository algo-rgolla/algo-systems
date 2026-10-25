import { useScanSummaries } from '@/features/stock-scans/api'
import { ScanLinkTiles } from '@/features/stock-scans/ScanTypeTiles'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageContent } from '@/shared/components/PageContent'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { PanelLink } from '@/shared/components/PanelLink'
import { MarketDataPanel } from './MarketDataPanel'

function TodaysScansPanel() {
  const summaries = useScanSummaries()

  return (
    <Panel title="Today’s scans" tightHeader actions={<PanelLink to="/scans">All scans</PanelLink>}>
      {summaries.isError ? (
        <ErrorState error={summaries.error} onRetry={() => summaries.refetch()} />
      ) : (
        <ScanLinkTiles
          summaries={summaries.data}
          linkTo={(scanType) => `/scans?scan=${scanType}`}
        />
      )}
    </Panel>
  )
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <PageContent>
        <TodaysScansPanel />
        <MarketDataPanel />
      </PageContent>
    </>
  )
}
