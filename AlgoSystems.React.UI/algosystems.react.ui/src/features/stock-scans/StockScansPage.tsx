import { useSearchParams } from 'react-router'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageContent } from '@/shared/components/PageContent'
import { PageHeader } from '@/shared/components/PageHeader'
import { PagePlaceholder } from '@/shared/components/PagePlaceholder'
import { Panel } from '@/shared/components/Panel'
import { useScanSummaries } from './api'
import { SCAN_CATALOG } from './catalog'
import { parseScanType } from './model'
import { ScanTypeSelector } from './ScanTypeTiles'

export default function StockScansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // The selected scan lives in the URL, so dashboard links and reloads land on it.
  const scanType = parseScanType(searchParams.get('scan'))
  const summaries = useScanSummaries()

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
        <PagePlaceholder>{SCAN_CATALOG[scanType].label} results will appear here.</PagePlaceholder>
      </PageContent>
    </>
  )
}
