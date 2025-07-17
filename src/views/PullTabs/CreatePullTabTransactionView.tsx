'use client'

import { useEffect, useMemo, useState } from 'react'

import NumberInput from '@c/NumberInput'
import SingleValueDisplay from '@c/SingleValueDisplay'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import { LoadingButton } from '@mui/lab'
import {
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { useRouter } from 'next/navigation'

import { formatCurrency } from '@/util/functions'
import { createPullTabTransaction } from '@/util/requests'
import { getFromStorage, removeFromStorage, saveToStorage } from '@/util/storage'

export interface PulltabBreakdown extends PullTab.Transaction.Payload {
  maxBag: number
}

interface CreatePullTabTransactionViewProps {
  bagTotal: number
}
export default function CreatePullTabTransactionView({
  bagTotal: initBagTotal,
}: CreatePullTabTransactionViewProps): React.JSX.Element {
  const router = useRouter()
  const [payload, setPayload] = useState<PulltabBreakdown>({
    maxBag: 2000,
  })
  const [loading, setLoading] = useState(false)
  const isValid = useMemo(() => {
    return !!payload.machine || !!payload.bank
  }, [payload])
  const [rememberMe, setRememberMe] = useState(false)
  const [bagTotal, setBagTotal] = useState(initBagTotal)

  function updatePayload(partialPayload: Partial<PulltabBreakdown>): void {
    const newPayload = { ...payload, ...partialPayload }
    const { maxBag } = newPayload
    let funds = (newPayload?.machine ?? 0) + (maxBag < initBagTotal ? initBagTotal - maxBag : 0)

    const toBar = initBagTotal < 0 ? Math.min(Math.abs(initBagTotal), funds) : 0
    funds -= toBar

    const toBag = initBagTotal < maxBag ? Math.min(maxBag - (initBagTotal + toBar), funds) : 0
    funds -= toBag
    let bagWithdrawal = 0

    if (maxBag < initBagTotal) {
      setBagTotal(maxBag)
      bagWithdrawal = initBagTotal - maxBag
    } else {
      setBagTotal(initBagTotal + toBar + toBag)
    }

    setPayload({ ...newPayload, bar: toBar, bag: toBag, bank: funds, bagWithdrawal })
  }

  async function handleCreatePullTabTransactions(): Promise<void> {
    const { maxBag, ...createPayload } = payload
    setLoading(true)

    if (rememberMe) {
      saveToStorage('pullTabsMaxBag', payload.maxBag)
    } else {
      removeFromStorage('pullTabsMaxBag')
    }

    Object.keys(createPayload).forEach((stringKey: string) => {
      const key = stringKey as keyof PullTab.Transaction.Payload

      if (createPayload[key] === 0) {
        createPayload[key] = undefined
      }
    })

    const response = await createPullTabTransaction(createPayload)

    if (!response?.length) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to create pulltab transaction.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: {
          message: `Successfully created pulltab transaction.`,
          severity: 'success',
        },
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

  useEffect(() => {
    const remember = getFromStorage<boolean>('pullTabRememberMaxBagAmount', false)
    const maxBag = remember ? getFromStorage<number>('pullTabsMaxBag', 2000) : 2000

    updatePayload({ maxBag })
    setRememberMe(remember)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Paper sx={{ p: 1 }}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <SingleValueDisplay
            label='Initial Bag'
            value={formatCurrency(initBagTotal)}
            variant='outlined'
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <SingleValueDisplay label='Bag' value={formatCurrency(bagTotal)} variant='outlined' />
        </Grid>
        <Grid xs={12}>
          <Typography>
            Please fill out the the values below to calculate how the pulltab withdrawal will be
            broken down.
          </Typography>
        </Grid>
        <Grid xs={12} sm={6}>
          <NumberInput
            label='Cash from Machine'
            precision={0}
            disabled={loading}
            value={payload.machine ?? 0}
            onChange={(event) => {
              const { value } = event.target

              updatePayload({ machine: !value ? 0 : value })
            }}
            sx={{ '& .MuiInputBase-input': { fontSize: 32 } }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MoneyIcon sx={{ fontSize: 32 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <NumberInput
            label='Max Cash Held in Bag'
            precision={0}
            disabled={loading}
            value={payload.maxBag}
            onChange={(event) => {
              const { value } = event.target
              const maxBag = !value ? 0 : value

              updatePayload({ maxBag })
            }}
            sx={{ '& .MuiInputBase-input': { fontSize: 32 } }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MoneyIcon sx={{ fontSize: 32 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid xs={12} smOffset={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(event: React.ChangeEvent<HTMLInputElement>, checked) => {
                  setRememberMe(checked)

                  if (checked) {
                    saveToStorage('pullTabRememberMaxBagAmount', true)
                  } else {
                    removeFromStorage('pullTabRememberMaxBagAmount')
                  }
                }}
              />
            }
            label='Remember Max Dollar Amount'
          />
        </Grid>
        {!!payload.machine && (
          <Grid xs={12}>
            <Divider />
          </Grid>
        )}
        {!!payload.bar && (
          <Grid xs={12} sm={6} md={4}>
            <SingleValueDisplay
              label='Owed to Bar'
              value={formatCurrency(payload.bar ?? 0)}
              variant='outlined'
            />
          </Grid>
        )}
        {!!payload.bag && (
          <Grid xs={12} sm={6} md={4}>
            <SingleValueDisplay
              label='Owed to Bag'
              value={formatCurrency(payload.bag ?? 0)}
              variant='outlined'
            />
          </Grid>
        )}
        {!!payload.bank && (
          <Grid xs={12} sm={6} md={4}>
            <SingleValueDisplay
              label='Bank Deposit'
              value={formatCurrency(payload.bank ?? 0)}
              variant='outlined'
            />
          </Grid>
        )}
        <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            loading={loading}
            disabled={!isValid}
            onClick={handleCreatePullTabTransactions}
          >
            Submit
          </LoadingButton>
        </Grid>
      </Grid>
    </Paper>
  )
}
