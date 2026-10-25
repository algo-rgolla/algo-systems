import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { formatDate } from '@/shared/formatting/format'
import { useConfirmTarget } from '@/shared/hooks/useConfirmTarget'
import { notify } from '@/shared/notifications/notify'
import { AddTickerDialog } from './AddTickerDialog'
import { useRemoveFromWatchlistMutation, useWatchlist } from './api'
import type { WatchlistItem } from './types'
import { WatchlistCard } from './WatchlistCard'

export default function WatchlistPage() {
  const watchlist = useWatchlist()
  const remove = useRemoveFromWatchlistMutation()
  const removal = useConfirmTarget<WatchlistItem>()
  const [adding, setAdding] = useState(false)

  const items = watchlist.data?.items
  const watchedKeys = useMemo(() => new Set(items?.map((i) => i.stock.key)), [items])

  const addButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setAdding(true)}
      disabled={!items}
    >
      Add ticker
    </Button>
  )

  async function confirmRemoval() {
    const item = removal.target
    if (!item) return
    try {
      // Resolves after the watchlist has been refetched, so the card is gone when this closes.
      await remove.mutateAsync(item.id)
      notify.success(`Removed ${item.stock.symbol} from the demo watchlist.`)
      removal.close()
    } catch {
      // Reported by the app's error toast; the dialog stays open to retry.
    }
  }

  return (
    <>
      <PageHeader title="Watchlist" actions={addButton} />

      {watchlist.isError ? (
        <ErrorState error={watchlist.error} onRetry={() => watchlist.refetch()} />
      ) : !items ? (
        <Panel>
          <LoadingState label="Loading watchlist" minHeight={280} />
        </Panel>
      ) : items.length === 0 ? (
        <Panel>
          <EmptyState
            title="Your watchlist is empty"
            message="Add a ticker to follow its daily price chart here."
            action={addButton}
          />
        </Panel>
      ) : (
        <>
          <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mb: '12px' }}>
            Simulated end-of-day prices for the session of {formatDate(items[0].quote.asOf)}. Not
            live market data.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: { xs: '10px', md: 2 },
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            {items.map((item) => (
              <WatchlistCard key={item.id} item={item} onRemove={removal.request} />
            ))}
          </Box>
        </>
      )}

      <AddTickerDialog open={adding} onClose={() => setAdding(false)} watchedKeys={watchedKeys} />

      <ConfirmDialog
        open={removal.open}
        title="Remove from watchlist?"
        message={
          removal.target &&
          `${removal.target.stock.symbol} (${removal.target.stock.name}) will be removed from the demo watchlist. You can add it again later.`
        }
        confirmLabel="Remove"
        pending={remove.isPending}
        onConfirm={confirmRemoval}
        onClose={removal.close}
      />
    </>
  )
}
