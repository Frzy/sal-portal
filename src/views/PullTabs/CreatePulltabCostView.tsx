'use client'

import { useMemo, useState } from 'react'

import NumberInput from '@c/NumberInput'
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
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRouter } from 'next/navigation'

import { formatCurrency, serverToPullTabCostItem } from '@/util/functions'
import { createPullTabCosts } from '@/util/requests'

dayjs.extend(relativeTime)

interface CreatePullTabCostViewProps {
  costs: PullTab.Cost.ServerItem[]
}
export default function CreatePullTabCostView({
  costs: serverCosts,
}: CreatePullTabCostViewProps): React.JSX.Element {
  const router = useRouter()
  const costs = useMemo(() => {
    return serverCosts.map(serverToPullTabCostItem).reverse()
  }, [serverCosts])
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<PullTab.Cost.Payload>({ tabPrice: 0, boxPrice: 0 })

  async function handleCreatePullTabCosts(): Promise<void> {
    setLoading(true)
    const payload = [{ ...item } satisfies PullTab.Cost.Payload]
    const response = await createPullTabCosts(payload)

    if (!response?.length) {
      const event = new CustomEvent<INotification>('notify', {
        detail: {
          message: 'Failed to create pull tab cost entry.',
          severity: 'error',
        },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: {
          message: 'Successfully created pull tab cost entry.',
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

  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 1 }}>
        <Typography variant='h4'>Add Pull Tab Costs</Typography>
      </Paper>
      <Paper sx={{ p: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md>
            <NumberInput
              value={item?.boxPrice ?? 0}
              disabled={loading}
              label='Pull Tab Price'
              onChange={(event) => {
                const { value } = event.target

                setItem((prev) => ({ ...prev, boxPrice: !value ? 0 : value }))
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: 32 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon sx={{ fontSize: 32 }} />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>

          <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              loading={loading}
              onClick={handleCreatePullTabCosts}
              variant='outlined'
              size='large'
              sx={{ height: '100%' }}
              fullWidth
              disabled={loading || !item.boxPrice}
            >
              Submit
            </LoadingButton>
          </Grid>
        </Grid>
      </Paper>
      {!!costs.length && (
        <Paper sx={{ p: 1 }}>
          <Typography variant='h5'>Previous {costs.length > 1 ? 'Entries' : 'Entry'}</Typography>
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Created</TableCell>
                  <TableCell align='right'>Price ($)</TableCell>
                  <TableCell align='right'>Created By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costs.map((row) => (
                  <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component='th' scope='row'>
                      <Tooltip title={row.created.format()}>
                        <Typography>{row.created.fromNow()}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography>{formatCurrency(row.boxPrice)}</Typography>
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
