import Skeleton from '@mui/material/Skeleton'
import { Fragment } from 'react'
import { EmptyState } from '@/shared/components/EmptyState'
import { MetricRow } from '@/shared/components/MetricRow'
import { Panel } from '@/shared/components/Panel'
import { ProgressBar } from '@/shared/components/ProgressBar'
import { formatPercent } from '@/shared/formatting/format'
import type { SectorAllocation } from './types'

/** Share of invested market value by sector, as labelled rows with bars. */
export function SectorAllocationPanel({
  allocation,
}: {
  allocation: SectorAllocation[] | undefined
}) {
  return (
    <Panel title="Sector allocation">
      {!allocation ? (
        [0, 1, 2, 3].map((i) => <Skeleton key={i} height={44} />)
      ) : allocation.length === 0 ? (
        <EmptyState title="Nothing invested yet" />
      ) : (
        allocation.map(({ sector, percent }) => {
          const label = formatPercent(percent, { signed: false, decimals: 0 })
          return (
            <Fragment key={sector}>
              <MetricRow label={sector} value={label} />
              <ProgressBar value={percent} label={`${sector}: ${label} of market value`} />
            </Fragment>
          )
        })
      )}
    </Panel>
  )
}
