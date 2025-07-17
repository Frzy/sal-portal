'use client'

import { useMemo, useState } from 'react'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import SingleValueDisplay from '@c/SingleValueDisplay'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import { LoadingButton } from '@mui/lab'
import {
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRouter } from 'next/navigation'

import { formatCurrency, serverToPullTabTransactionItem } from '@/util/functions'
import { createPullTabTransaction } from '@/util/requests'

dayjs.extend(relativeTime)

interface CreatePullTabPayoutViewProps {
  payouts: PullTab.Transaction.ServerItem[]
  bagValue: number
}
export default function CreatePullTabPayoutView({
  payouts: serverPayouts,
  bagValue,
}: CreatePullTabPayoutViewProps): React.JSX.Element {
  const router = useRouter()
  const payouts = useMemo(() => {
    return serverPayouts.map(serverToPullTabTransactionItem).reverse()
  }, [serverPayouts])
  const [payload, setPayload] = useState<PullTab.Transaction.Payload>({
    payout: 0,
  })
  const [loading, setLoading] = useState(false)

  function handleAmountChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value } = event.target

    updateState({ payout: !value ? 0 : value })
  }
  function updateState(partialState: Partial<PullTab.Transaction.Payload>): void {
    setPayload((prev) => ({ ...prev, ...partialState }))
  }

  async function handleCreatePullTabPayout(): Promise<void> {
    if (!payload.payout) return

    setLoading(true)

    const response = await createPullTabTransaction({
      ...payload,
      payout: Math.abs(payload.payout) * -1,
    })

    if (!response?.length) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to create pull tab payout entry.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully created pull tab payout entry.`, severity: 'success' },
      })

      dispatchEvent(event)
    }

    const urlParams = new URLSearchParams(window.location.search)
    const callbackUrl = urlParams.get('callbackUrl')

    if (callbackUrl) {
      router.push(callbackUrl)
    } else {
      window.location.reload()
    }
  }

  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 1 }}>
        <Typography variant='h4'>Pull Tab Payout</Typography>
      </Paper>
      <Paper sx={{ p: 1 }}>
        <Stack spacing={2}>
          <SingleValueDisplay
            label={!payload?.payout ? 'Bag Total' : 'New Bag Total'}
            value={formatCurrency(bagValue - (payload?.payout ?? 0))}
            variant='outlined'
          />
          <Typography>
            Please enter the amount paid out for the pull tabs that have been collected. The total
            above will reflect your current changes.
          </Typography>
          <NumberInput
            label='Payout Amount'
            precision={0}
            value={payload.payout}
            disabled={loading}
            onChange={handleAmountChange}
            onKeyUp={(event) => {
              if (event.key === 'Enter' && (payload?.payout ?? 0) > 0)
                void handleCreatePullTabPayout()
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MoneyIcon sx={{ fontSize: 32 }} />
                </InputAdornment>
              ),
            }}
          />

          <LoadingButton
            loading={loading}
            disabled={(payload?.payout ?? 0) <= 0}
            onClick={handleCreatePullTabPayout}
            size='large'
            variant='outlined'
            fullWidth
          >
            Submit
          </LoadingButton>
        </Stack>
      </Paper>

      {!!payouts.length && (
        <Paper sx={{ p: 1 }}>
          <Typography variant='h5'>Previous Payouts</Typography>
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 150 }}>Created</TableCell>
                  <TableCell align='right'>Amount</TableCell>
                  <TableCell align='right'>Bag</TableCell>
                  <TableCell align='right'>Created By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((row) => (
                  <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component='th' scope='row'>
                      <Tooltip title={row.created.format()}>
                        <Typography>{row.created.fromNow()}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography>{formatCurrency(row.amount)}</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography>
                        {row.runningTotal == null ? '--' : formatCurrency(row.runningTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography>{row.createdBy}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Stack>
  )
}
