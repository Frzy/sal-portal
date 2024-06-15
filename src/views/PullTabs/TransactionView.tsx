'use client'

import { useMemo, useState } from 'react'

import { Alert, Box, Button, Typography } from '@mui/material'

import { serverToPullTabTransactionItem } from '@/util/functions'

interface TransactionViewProps {
  transactions: PullTab.Transaction.ServerItem[]
}
export default function TransactionView({
  transactions: serverTransactions,
}: TransactionViewProps): React.JSX.Element {
  const [transactions, setTransactions] = useState(
    serverTransactions.map(serverToPullTabTransactionItem),
  )
  const createPayoutUrl = useMemo(() => {
    const url = new URL('/pull-tabs/create/payout', window.location.origin)
    url.searchParams.set('callbackUrl', '/pull-tabs/transactions')

    return url
  }, [])
  const createTransactionUrl = useMemo(() => {
    const url = new URL('/pull-tabs/create/transaction', window.location.origin)
    url.searchParams.set('callbackUrl', '/pull-tabs/transactions')

    return url
  }, [])

  if (transactions.length === 0) {
    return (
      <Alert severity='info'>
        <Typography paragraph>
          No Pull Tab Transactions found. Use the actions below to create some.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button href={createPayoutUrl.toString()} variant='outlined' sx={{ textAlign: 'center' }}>
            Create Pull Tab Payout
          </Button>
          <Button
            href={createTransactionUrl.toString()}
            variant='outlined'
            sx={{ textAlign: 'center' }}
          >
            Create Pull Tab Transaction
          </Button>
        </Box>
      </Alert>
    )
  }

  return <h1>Transaction View</h1>
}
