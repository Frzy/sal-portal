'use client'

import { useMemo, useRef, useState } from 'react'

import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import KitchenIcon from '@mui/icons-material/Countertops'
import ShoppingIcon from '@mui/icons-material/ShoppingCart'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs, { type Dayjs } from 'dayjs'
import { useSession } from 'next-auth/react'

import TimeFrame, { type TimeFrameValue } from '@/components/TimeFrame'
import { TIME_FRAME } from '@/util/constants'

import EnhancedList, { type EnhancedListRef } from './ListComponents/EnhancedList'
import { type ListColumn } from './ListComponents/ListHeader'

interface Filters {
  timeframe?: TimeFrameValue
  createdBy?: string[]
  modifiedBy?: string[]
}

const columns: ListColumn<Kitchen.Cost.Item>[] = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 100,
  },
  {
    id: 'amount',
    label: 'Amount',
    isCurrency: true,
  },
  {
    id: 'checkoutId',
    label: 'Originated',
    cellRender: (row) => {
      return (
        <Box sx={{ pr: 2 }}>
          <Tooltip title={row.checkoutId ? 'Kitchen Service' : 'Shopping'}>
            {row.checkoutId ? <KitchenIcon /> : <ShoppingIcon />}
          </Tooltip>
        </Box>
      )
    },
  },
  {
    id: 'created',
    label: 'Created',
    minWidth: 150,
  },
]
const adminColumns: ListColumn<Kitchen.Cost.Item>[] = [
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

interface CostListFiltersProps {
  adminOptions?: List.AdminOptions
  createdOptions?: string[]
  isAdmin?: boolean
  minDate?: Dayjs
  modifiedOptions?: string[]
  onAdminOptionChange?: (options: Partial<List.AdminOptions>) => void
  onFilterChange?: (filter?: Filters) => void
}
function CostListFilters({
  adminOptions,
  createdOptions,
  isAdmin,
  minDate,
  modifiedOptions,
  onFilterChange,
  onAdminOptionChange,
}: CostListFiltersProps): React.JSX.Element {
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

interface CostListProps {
  costItems: Kitchen.Cost.Item[]
  listRef?: React.MutableRefObject<EnhancedListRef | null>
  onCreate?: () => void
  onDelete?: (items: Kitchen.Cost.Item[]) => void
  onEdit?: (item: Kitchen.Cost.Item) => void
  onSelectionChange?: (items: Kitchen.Cost.Item[]) => void
  title: string
}
export default function CostList({
  costItems,
  listRef,
  onCreate,
  onDelete,
  onEdit,
  onSelectionChange,
  title,
}: CostListProps): React.JSX.Element {
  const { data: session } = useSession()
  const minDate = useMemo(() => {
    const min = dayjs.min(costItems.map((c) => c.created))

    return min ?? undefined
  }, [costItems])
  const [adminOptions, setAdminOptions] = useState<List.AdminOptions>({
    showAdminColumns: false,
  })
  const isAdmin = useMemo(() => session?.user.isAdmin, [session])
  const tableColumns = useMemo(() => {
    return adminOptions.showAdminColumns ? [...columns, ...adminColumns] : columns
  }, [adminOptions])
  const [filters, setFilters] = useState<Filters>()
  const filterItems = useMemo(() => {
    if (!filters) return costItems

    return costItems.filter((item: Kitchen.Cost.Item): boolean => {
      if (filters.timeframe) {
        const { startDate, endDate } = filters.timeframe
        if (item.created.isBefore(startDate) || item.created.isAfter(endDate)) return false
      }

      if (filters.createdBy?.length && !filters.createdBy.includes(item.createdBy)) return false
      if (filters.modifiedBy?.length && !filters.modifiedBy.includes(item.lastModifiedBy))
        return false

      return true
    })
  }, [costItems, filters])
  const { createdOptions, modifiedOptions } = useMemo(() => {
    const createdOptions: string[] = []
    const modifiedOptions: string[] = []

    if (isAdmin) {
      costItems.forEach((item) => {
        if (!createdOptions.includes(item.createdBy)) createdOptions.push(item.createdBy)
        if (!modifiedOptions.includes(item.lastModifiedBy))
          modifiedOptions.push(item.lastModifiedBy)
      })
    }

    return { createdOptions, modifiedOptions }
  }, [isAdmin, costItems])
  const thisRef = useRef<EnhancedListRef | null>(null)

  return (
    <EnhancedList
      ref={listRef ?? thisRef}
      columns={tableColumns}
      hasFilters={!!filters}
      onCreate={onCreate}
      onDelete={onDelete}
      onEdit={onEdit}
      orderBy='created'
      rows={filterItems}
      sortOrder='desc'
      title={title}
      totalRows={costItems.length}
      selection='multiple'
      onSelectionChange={onSelectionChange}
      filterComponent={
        <CostListFilters
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
