'use client'

import { useMemo, useState } from 'react'

import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import DrinkIcon from '@mui/icons-material/LocalBar'
import NoDrinksIcon from '@mui/icons-material/NoDrinks'
import { Autocomplete, Box, Button, Checkbox, Chip, TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs, { type Dayjs } from 'dayjs'
import { useSession } from 'next-auth/react'

import TimeFrame, { type TimeFrameValue } from '@/components/TimeFrame'
import { TIME_FRAME } from '@/util/constants'

import EnhancedList, { type EnhancedListRef } from './ListComponents/EnhancedList'
import { type ListColumns } from './ListComponents/ListHeader'

interface Filters {
  modifiedBy?: string[]
  term?: string
  timeframe?: TimeFrameValue
}

const columns: ListColumns<Kitchen.Menu.Item>[] = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 100,
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 250,
    align: 'left',
  },
  {
    id: 'price',
    label: 'Price',
    isCurrency: true,
  },
  {
    id: 'hasDrinkChip',
    label: 'Drink Chip',
    cellRender: (row) => {
      return row.hasDrinkChip ? (
        <DrinkIcon sx={{ color: (theme) => theme.vars.palette.success.main }} />
      ) : (
        <NoDrinksIcon sx={{ color: (theme) => theme.vars.palette.error.main }} />
      )
    },
  },
]
const adminColumns: ListColumns<Kitchen.Menu.Item>[] = [
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

interface MenuItemListFiltersProps {
  isAdmin?: boolean
  onFilterChange?: (filter?: Filters) => void
  modifiedOptions?: string[]
  minDate?: Dayjs
}
function MenuItemListFilters({
  onFilterChange,
  isAdmin,
  modifiedOptions,
  minDate,
}: MenuItemListFiltersProps): React.JSX.Element {
  const [filters, setFilters] = useState<Filters>()

  function updateFilters(partialFilter: Filters): void {
    const newFilter = { ...filters, ...partialFilter }

    setFilters(newFilter)
    if (onFilterChange) onFilterChange(newFilter)
  }
  function handleTimeframeChange(timeframe: TimeFrameValue): void {
    updateFilters({ timeframe })
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
        {isAdmin && !!modifiedOptions?.length && (
          <Grid xs={12}>
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

interface MenuItemListProps {
  menuItems: Kitchen.Menu.Item[]
  onCreate?: () => void
  onDelete?: (items: Kitchen.Menu.Item[]) => void
  onEdit?: (item: Kitchen.Menu.Item) => void
  title: string
  forwardedRef?: React.Ref<EnhancedListRef>
}
export default function MenuItemList({
  menuItems,
  onCreate,
  onDelete,
  onEdit,
  title,
  forwardedRef,
}: MenuItemListProps): React.JSX.Element {
  const { data: session } = useSession()
  const minDate = useMemo(() => {
    const min = dayjs.min(menuItems.map((c) => c.created))

    return min ?? undefined
  }, [menuItems])
  const isAdmin = useMemo(() => session?.user.isAdmin, [session])
  const tableColumns = useMemo(() => {
    return isAdmin ? [...columns, ...adminColumns] : columns
  }, [isAdmin])
  const [filters, setFilters] = useState<Filters>()
  const filterItems = useMemo(() => {
    if (!filters) return menuItems

    return menuItems.filter((item: Kitchen.Menu.Item): boolean => {
      if (filters.timeframe) {
        const { startDate, endDate } = filters.timeframe
        if (item.created.isBefore(startDate) || item.created.isAfter(endDate)) return false
      }
      if (filters.modifiedBy?.length && !filters.modifiedBy.includes(item.lastModifiedBy))
        return false

      return true
    })
  }, [menuItems, filters])
  const { modifiedOptions } = useMemo(() => {
    const createdOptions: string[] = []
    const modifiedOptions: string[] = []

    if (isAdmin) {
      menuItems.forEach((item) => {
        if (!modifiedOptions.includes(item.lastModifiedBy))
          modifiedOptions.push(item.lastModifiedBy)
      })
    }

    return { createdOptions, modifiedOptions }
  }, [isAdmin, menuItems])

  return (
    <EnhancedList
      ref={forwardedRef}
      title={title}
      columns={tableColumns}
      totalRows={menuItems.length}
      hasFilters={!!filters}
      rows={filterItems}
      orderBy='name'
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      selection='multiple'
      filterComponent={
        <MenuItemListFilters
          modifiedOptions={modifiedOptions}
          minDate={minDate}
          onFilterChange={(newFilters) => {
            setFilters(newFilters)
          }}
          isAdmin
        />
      }
    />
  )
}
