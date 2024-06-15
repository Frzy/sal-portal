'use client'

import { useMemo, useState } from 'react'

import NumberInput from '@c/NumberInput'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import RemoveIcon from '@mui/icons-material/Remove'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
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
    return serverCosts.map(serverToPullTabCostItem)
  }, [serverCosts])
  const [payload, setPayload] = useState<PullTab.Cost.Payload[]>([])
  const payloadTotal = useMemo(() => {
    return payload.reduce((cur, next) => {
      return cur + next.boxPrice
    }, 0)
  }, [payload])
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<Partial<PullTab.Cost.Payload>>({})

  function handleGamePriceChange(event: SelectChangeEvent): void {
    const { value } = event.target
    const tabPrice = parseFloat(value)
    setItem((prev) => ({ ...prev, tabPrice: isNaN(tabPrice) ? undefined : tabPrice }))
  }
  function handleAddItem(): void {
    const { boxPrice, tabPrice } = item
    if (boxPrice && tabPrice) {
      setPayload((prev) => [...prev, { boxPrice, tabPrice }])
      setItem({})
    }
  }
  function handleRemovePayload(index: number): () => void {
    return () => {
      const newPayload = [...payload]

      newPayload.splice(index, 1)

      setPayload(newPayload)
    }
  }

  async function handleCreatePullTabCosts(): Promise<void> {
    setLoading(true)

    const response = await createPullTabCosts(payload)

    if (!response?.length) {
      const event = new CustomEvent<INotification>('notify', {
        detail: {
          message: `Failed to create pull tab cost ${payload.length > 1 ? 'entries' : 'entry'}.`,
          severity: 'error',
        },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: {
          message: `Successfully created pull tab payout cost ${payload.length > 1 ? 'entries' : 'entry'}.`,
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
            <FormControl
              fullWidth
              disabled={loading}
              sx={{
                '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                  transform: 'translate(14px, 22px) scale(1.5)',
                },
              }}
            >
              <InputLabel size='normal' id='pulltab-cost-game-price-label'>
                Tab Price
              </InputLabel>
              <Select
                sx={{ '& .MuiInputBase-input': { fontSize: 32, lineHeight: '46px' } }}
                labelId='pulltab-cost-game-price-label'
                id='pulltab-cost-game-price'
                value={item.tabPrice?.toString() ?? ''}
                label='Tab Price'
                onChange={handleGamePriceChange}
              >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'0.25'}>{formatCurrency(0.25)}</MenuItem>
                <MenuItem value={'0.5'}>{formatCurrency(0.5)}</MenuItem>
                <MenuItem value={'1'}>{formatCurrency(1)}</MenuItem>
                <MenuItem value={'2'}>{formatCurrency(2)}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md>
            <NumberInput
              value={item?.boxPrice ?? 0}
              disabled={loading}
              label='Box Price'
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
          <Grid xs={12} md='auto'>
            <Button
              variant='outlined'
              startIcon={<AddShoppingCartIcon />}
              size='large'
              sx={{ height: '100%' }}
              fullWidth
              disabled={loading || !item.boxPrice || !item.tabPrice}
              onClick={handleAddItem}
            >
              Add
            </Button>
          </Grid>
          {!!payload.length && (
            <Grid xs={12}>
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tab Price ($)</TableCell>
                      <TableCell align='right'>Box Price ($)</TableCell>
                      <TableCell align='right' />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payload.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component='th' scope='row' sx={{ width: 120 }}>
                          {formatCurrency(row.tabPrice)}
                        </TableCell>
                        <TableCell align='right'>{formatCurrency(row.boxPrice)}</TableCell>
                        <TableCell align='right' sx={{ width: 70 }}>
                          <IconButton
                            onClick={handleRemovePayload(index)}
                            size='small'
                            color='secondary'
                            sx={{ display: { xs: 'inherit', sm: 'none' } }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Button
                            sx={{ display: { xs: 'none', sm: 'inherit' } }}
                            onClick={handleRemovePayload(index)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component='th' scope='row' sx={{ width: 120 }}>
                        Total
                      </TableCell>
                      <TableCell align='right'>{formatCurrency(payloadTotal)}</TableCell>
                      <TableCell align='right' sx={{ width: 70 }} />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
          {!!payload.length && (
            <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton loading={loading} onClick={handleCreatePullTabCosts}>
                Submit
              </LoadingButton>
            </Grid>
          )}
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
                  <TableCell align='right'>Tab Price</TableCell>
                  <TableCell align='right'>Box Price</TableCell>
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
                      <Typography>{formatCurrency(row.tabPrice)}</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography>{formatCurrency(row.boxPrice)}</Typography>
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
