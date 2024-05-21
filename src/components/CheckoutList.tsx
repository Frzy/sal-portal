'use client'

import { useMemo, useState } from 'react'

import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs, { type Dayjs } from 'dayjs'
import { useSession } from 'next-auth/react'

import TimeFrame, { type TimeFrameValue } from '@/components/TimeFrame'
import { TIME_FRAME } from '@/util/constants'
import { formatCurrency } from '@/util/functions'

import EnhancedList from './ListComponents/EnhancedList'
import { type ListColumns } from './ListComponents/ListHeader'

interface Filters {
  timeframe?: TimeFrameValue
  createdBy?: string[]
  modifiedBy?: string[]
}

const columns: ListColumns<Kitchen.Checkout.Item>[] = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 105,
  },
  {
    id: 'deposit',
    label: 'Deposit',
    isCurrency: true,
    cellRender: (row) => {
      const percent = Math.round((row?.depositChange ?? 0) * 100)
      const percentText = percent === 0 ? '0' : percent > 0 ? `+${percent}` : percent.toString()

      return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography sx={{ fontFamily: 'monospace' }}>{formatCurrency(row.deposit)}</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {percent === 0 ? (
              <TrendingFlatIcon />
            ) : percent > 0 ? (
              <TrendingUpIcon color='success' />
            ) : (
              <TrendingDownIcon color='error' />
            )}
            <Typography variant='caption'>{percentText}%</Typography>
          </Box>
        </Box>
      )
    },
  },
  {
    id: 'sales',
    label: 'Sales',
    isCurrency: true,
    cellRender: (row) => {
      const modified = row.calculated.sales !== row.sales
      const percent = Math.round((row?.salesChange ?? 0) * 100)
      const percentText = percent === 0 ? '0' : percent > 0 ? `+${percent}` : percent.toString()

      return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Tooltip
            title={
              modified
                ? `Calculated value of ${formatCurrency(row.calculated.sales)} has been overridden`
                : undefined
            }
          >
            <Badge
              variant={modified ? 'dot' : 'standard'}
              color='warning'
              hidden={!modified}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  left: -6,
                  top: 12,
                },
              }}
            >
              <Typography sx={{ fontFamily: 'monospace' }}>{formatCurrency(row.sales)}</Typography>
            </Badge>
          </Tooltip>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {percent === 0 ? (
              <TrendingFlatIcon />
            ) : percent > 0 ? (
              <TrendingUpIcon color='success' />
            ) : (
              <TrendingDownIcon color='error' />
            )}
            <Typography variant='caption'>{percentText}%</Typography>
          </Box>
        </Box>
      )
    },
  },
  {
    id: 'creditCardSales',
    label: 'Credit Sales',
    isCurrency: true,
    minWidth: 135,
  },
  {
    id: 'drinkChips',
    label: 'Drink Chips',
    minWidth: 130,
    cellRender: (row) => {
      if (row.calculated.drinkChips !== row.drinkChips) {
        return (
          <Tooltip title={`Calculated value of ${row.calculated.drinkChips} has been overridden`}>
            <Badge
              variant='dot'
              color='warning'
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  left: -6,
                  top: 12,
                },
              }}
            >
              <Typography sx={{ fontFamily: 'monospace' }}>{row.drinkChips}</Typography>
            </Badge>
          </Tooltip>
        )
      }
    },
  },
  {
    id: 'expenses',
    label: 'Expenses',
    isCurrency: true,
  },
  {
    id: 'totalOrders',
    label: 'Orders',
  },
  {
    id: 'created',
    label: 'Created',
    minWidth: 150,
  },
]
const adminColumns: ListColumns<Kitchen.Checkout.Item>[] = [
  {
    id: 'createdBy',
    label: 'Created By',
    minWidth: 130,
  },
  {
    id: 'modified',
    label: 'Modified',
    minWidth: 150,
  },
  {
    id: 'lastModifiedBy',
    label: 'Modified By',
    minWidth: 135,
  },
]
const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

interface CheckoutListFiltersProps {
  adminOptions?: List.AdminOptions
  createdOptions?: string[]
  isAdmin?: boolean
  minDate?: Dayjs
  modifiedOptions?: string[]
  onAdminOptionChange?: (options: Partial<List.AdminOptions>) => void
  onFilterChange?: (filter?: Filters) => void
}
function CheckoutListFilters({
  adminOptions,
  createdOptions,
  isAdmin,
  minDate,
  modifiedOptions,
  onAdminOptionChange,
  onFilterChange,
}: CheckoutListFiltersProps): React.JSX.Element {
  const [filters, setFilters] = useState<Filters>()

  function updateFilters(partialFilter: Filters): void {
    const newFilter = { ...filters, ...partialFilter }

    setFilters(newFilter)
    if (onFilterChange) onFilterChange(newFilter)
  }
  function handleTimeframeChange(timeframe: TimeFrameValue): void {
    updateFilters({ timeframe })
  }
  function handleCreatedOptionChange(event: React.SyntheticEvent, value: string[]): void {
    updateFilters({ createdBy: value })
  }
  function handleModifiedOptionChange(event: React.SyntheticEvent, value: string[]): void {
    updateFilters({ modifiedBy: value })
  }

  return (
    <Box
      sx={{
        py: 2,
        px: 1,
        backgroundColor: (theme) => theme.vars.palette.background.paper,
        borderRight: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderLeft: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      <Grid container spacing={1}>
        <Grid xs={12}>
          <TimeFrame
            id='cost-timeframe'
            value={filters?.timeframe?.value ?? TIME_FRAME.ALL}
            onChange={handleTimeframeChange}
            minDate={minDate}
          />
        </Grid>
        {isAdmin && !!createdOptions?.length && (
          <Grid xs={12} md={6}>
            <Autocomplete
              disableCloseOnSelect
              fullWidth
              multiple
              value={filters?.createdBy ?? []}
              options={createdOptions}
              onChange={handleCreatedOptionChange}
              renderOption={(props, option, { selected }) => {
                return (
                  <li {...props} key={option}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option}
                  </li>
                )
              }}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option} label={option} />
                ))
              }}
              renderInput={(params) => (
                <TextField {...params} label='Created By' placeholder='Pick users' />
              )}
            />
          </Grid>
        )}
        {isAdmin && !!modifiedOptions?.length && (
          <Grid xs={12} md={6}>
            <Autocomplete
              disableCloseOnSelect
              fullWidth
              multiple
              options={modifiedOptions}
              value={filters?.modifiedBy ?? []}
              onChange={handleModifiedOptionChange}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              )}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option} label={option} />
                ))
              }}
              renderInput={(params) => (
                <TextField {...params} label='Modified By' placeholder='Pick users' />
              )}
            />
          </Grid>
        )}
        {isAdmin && (
          <Grid xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={adminOptions?.showAdminColumns}
                  onChange={(event) => {
                    if (onAdminOptionChange)
                      onAdminOptionChange({ showAdminColumns: event.target.checked })
                  }}
                />
              }
              label='Show Administrator Columns'
            />
          </Grid>
        )}
        <Grid xs={12}>
          <Button
            onClick={() => {
              setFilters(undefined)
              if (onFilterChange) onFilterChange()
            }}
            variant='outlined'
            fullWidth
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

interface CheckoutListProps {
  title: string
  checkouts: Kitchen.Checkout.Item[]
  selection?: List.SelectionMode
  onEdit?: (item: Kitchen.Checkout.Item) => void
  onCreate?: () => void
  onDelete?: (items: Kitchen.Checkout.Item[]) => void
}
export default function CheckoutList({
  checkouts,
  title,
  selection = 'multiple',
  onCreate,
  onDelete,
  onEdit,
}: CheckoutListProps): React.JSX.Element {
  const { data: session } = useSession()
  const minDate = useMemo(() => {
    const min = dayjs.min(checkouts.map((c) => c.created))

    return min ?? undefined
  }, [checkouts])
  const [adminOptions, setAdminOptions] = useState<List.AdminOptions>({
    showAdminColumns: false,
  })
  const isAdmin = useMemo(() => session?.user.isAdmin, [session])
  const tableColumns = useMemo(() => {
    return adminOptions.showAdminColumns ? [...columns, ...adminColumns] : columns
  }, [adminOptions])
  const [filters, setFilters] = useState<Filters>()
  const filterItems = useMemo(() => {
    if (!filters) return checkouts

    return checkouts.filter((item: Kitchen.Checkout.Item): boolean => {
      if (filters.timeframe) {
        const { startDate, endDate } = filters.timeframe
        if (item.created.isBefore(startDate) || item.created.isAfter(endDate)) return false
      }

      if (filters.createdBy?.length && !filters.createdBy.includes(item.createdBy)) return false
      if (filters.modifiedBy?.length && !filters.modifiedBy.includes(item.lastModifiedBy))
        return false

      return true
    })
  }, [checkouts, filters])
  const { createdOptions, modifiedOptions } = useMemo(() => {
    const createdOptions: string[] = []
    const modifiedOptions: string[] = []

    if (isAdmin) {
      checkouts.forEach((item) => {
        if (!createdOptions.includes(item.createdBy)) createdOptions.push(item.createdBy)
        if (!modifiedOptions.includes(item.lastModifiedBy))
          modifiedOptions.push(item.lastModifiedBy)
      })
    }

    return { createdOptions, modifiedOptions }
  }, [isAdmin, checkouts])

  return (
    <EnhancedList
      columns={tableColumns}
      hasFilters={!!filters}
      onCreate={onCreate}
      onDelete={onDelete}
      onEdit={onEdit}
      orderBy='created'
      rows={filterItems}
      sortOrder='desc'
      title={title}
      totalRows={checkouts.length}
      selection={selection}
      renderExpandable={(row) => {
        const hasOrders = !!row.orders.length

        return (
          <Stack
            spacing={1}
            sx={{
              p: 1,
            }}
          >
            <Typography variant='h5'>Orders</Typography>
            <Paper variant='outlined' sx={{ p: 1 }} square>
              {hasOrders ? (
                <List disablePadding>
                  {row.orders.map((order, index) => {
                    return (
                      <ListItem key={order.id} divider={index < row.orders.length - 1}>
                        <Typography
                          component='span'
                          sx={{
                            minWidth: 65,
                            textAlign: 'right',
                            fontFamily: 'monospace',
                            fontSize: 32,
                            pr: 4,
                            color: 'text.secondary',
                          }}
                        >
                          {order.menuItemQuantity}
                        </Typography>
                        <ListItemText
                          primary={order.menuItemName}
                          secondary={formatCurrency(order.menuItemPrice)}
                        />
                        <Typography
                          component='span'
                          sx={{
                            fontFamily: 'monospace',
                            textAlign: 'right',
                            minWidth: 70,
                            fontSize: 32,
                          }}
                        >
                          {formatCurrency(order.menuItemQuantity * order.menuItemPrice)}
                        </Typography>
                      </ListItem>
                    )
                  })}
                </List>
              ) : (
                <Typography>No Orders</Typography>
              )}
            </Paper>
          </Stack>
        )
      }}
      filterComponent={
        <CheckoutListFilters
          adminOptions={adminOptions}
          createdOptions={createdOptions}
          modifiedOptions={modifiedOptions}
          minDate={minDate}
          onAdminOptionChange={(options) => {
            setAdminOptions((prev) => ({ ...prev, ...options }))
          }}
          onFilterChange={(newFilters) => {
            setFilters(newFilters)
          }}
          isAdmin
        />
      }
    />
  )
}
