import { PageHeader } from '@/shared/components/PageHeader'
import { PagePlaceholder } from '@/shared/components/PagePlaceholder'

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <PagePlaceholder>Today’s scans and market data will appear here.</PagePlaceholder>
    </>
  )
}
