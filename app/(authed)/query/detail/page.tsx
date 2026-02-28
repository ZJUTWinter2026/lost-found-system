import { Suspense } from 'react'
import QueryDetailRouteClient from '@/components/query/QueryDetailRouteClient'

function QueryDetailPageFallback() {
  return <div className="w-full" />
}

function QueryDetailPage() {
  return (
    <Suspense fallback={<QueryDetailPageFallback />}>
      <QueryDetailRouteClient />
    </Suspense>
  )
}

export default QueryDetailPage
