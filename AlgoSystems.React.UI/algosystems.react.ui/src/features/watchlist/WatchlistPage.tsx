import { PageHeader } from '@/shared/components/PageHeader'
import { PagePlaceholder } from '@/shared/components/PagePlaceholder'

export default function WatchlistPage() {
  return (
    <>
      <PageHeader title="Watchlist" />
      <PagePlaceholder>
        The stocks you are watching, with daily price charts, will appear here.
      </PagePlaceholder>
    </>
  )
}
