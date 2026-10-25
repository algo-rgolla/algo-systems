import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageContent, SplitLayout } from '@/shared/components/PageContent'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { AccountPerformancePanel } from './AccountPerformancePanel'
import { AddHoldingDialog } from './AddHoldingDialog'
import { usePortfolio } from './api'
import { HoldingsTable } from './HoldingsTable'
import { PortfolioSummaryStrip } from './PortfolioSummaryStrip'
import { SectorAllocationPanel } from './SectorAllocationPanel'

export default function PortfolioPage() {
  const view = usePortfolio()
  const [adding, setAdding] = useState(false)

  const addButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setAdding(true)}
      disabled={!view.data}
    >
      Add holding
    </Button>
  )

  return (
    <>
      <PageHeader title="Portfolio" actions={addButton} />

      {view.isError ? (
        <ErrorState error={view.error} onRetry={() => view.refetch()} />
      ) : (
        <PageContent>
          <PortfolioSummaryStrip summary={view.data?.summary} />

          <Panel>
            {view.data && view.data.rows.length === 0 ? (
              <EmptyState
                title="No holdings yet"
                message="Add your first holding to track its value and performance."
                action={addButton}
              />
            ) : (
              <HoldingsTable
                rows={view.data?.rows ?? []}
                baseCurrency={view.data?.portfolio.baseCurrency ?? 'AUD'}
                loading={view.isPending}
              />
            )}
          </Panel>

          <SplitLayout>
            <AccountPerformancePanel totalReturnPercent={view.data?.summary.totalReturnPercent} />
            <SectorAllocationPanel allocation={view.data?.allocation} />
          </SplitLayout>
        </PageContent>
      )}

      {view.data && (
        <AddHoldingDialog
          open={adding}
          onClose={() => setAdding(false)}
          portfolio={view.data.portfolio}
        />
      )}
    </>
  )
}
