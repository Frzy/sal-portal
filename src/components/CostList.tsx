'use client'

import React, { useMemo, useState } from 'react'

import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { Autocomplete, Box, Button, Checkbox, Chip, TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs, { type Dayjs } from 'dayjs'
import { useSession } from 'next-auth/react'

import TimeFrame, { type TimeFrameValue } from '@/components/TimeFrame'
import { TIME_FRAME } from '@/util/constants'

import EnhancedList from './ListComponents/EnhancedList'
import { type ListColumns } from './ListComponents/ListHeader'

interface Filters {
  timeframe?: TimeFrameValue
  createdBy?: string[]
  modifiedBy?: string[]
}

const columns: ListColumns<Kitchen.Cost.Item>[] = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 100,
  },
  {
    id: 'amount',
    label: 'Amount',
    isNumber: true,
    isCurrency: true,
  },
  {
    id: 'created',
    label: 'Created',
    isDate: true,
    minWidth: 150,
  },
]
const adminColumns: ListColumns<Kitchen.Cost.Item>[] = [
  {
    id: 'createdBy',
    label: 'Created By',
    minWidth: 130,
  },
  {
    id: 'modified',
    label: 'Modified',
    isDate: true,
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
  isAdmin?: boolean
  onFilterChange?: (filter?: Filters) => void
  createdOptions?: string[]
  modifiedOptions?: string[]
  minDate?: Dayjs
}
function CostListFilters({
  onFilterChange,
  isAdmin,
  createdOptions,
  modifiedOptions,
  minDate,
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
  title: string
  costItems: Kitchen.Cost.Item[]
  onEdit?: (item: Kitchen.Cost.Item) => void
  onCreate?: () => void
  onDelete?: (items: Kitchen.Cost.Item[]) => void
}
export default function CostList({
  costItems,
  title,
  onCreate,
  onDelete,
  onEdit,
}: CostListProps): React.JSX.Element {
  const { data: session } = useSession()
  const minDate = useMemo(() => {
    const min = dayjs.min(costItems.map((c) => c.created))

    return min ?? undefined
  }, [costItems])
  const isAdmin = useMemo(() => session?.user.isAdmin, [session])
  const tableColumns = useMemo(() => {
    return isAdmin ? [...columns, ...adminColumns] : columns
  }, [isAdmin])
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
      totalRows={costItems.length}
      selection='single'
      filterComponent={
        <CostListFilters
          createdOptions={createdOptions}
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
