'use client'

import { useMemo } from 'react'

import { serverToCheckoutItem } from '@/util/functions'

interface KitchenSummaryProps {
  serverCheckouts: Kitchen.Checkout.ServerItem[]
}
export default function KitchenSummaryView({
  serverCheckouts,
}: KitchenSummaryProps): React.JSX.Element {
  const checkouts = useMemo(() => serverCheckouts.map(serverToCheckoutItem), [serverCheckouts])

  console.log({ checkouts })
  return <h1>Summaries</h1>
}
