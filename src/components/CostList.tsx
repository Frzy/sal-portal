'use client'

import React, { useCallback, useMemo, useState } from 'react'

import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'

import { TIME_FRAME, TIME_FRAMES } from '@/util/constants'

import EnhancedList from './ListComponents/EnhancedList'
import { type ListColumns } from './ListComponents/ListHeader'

interface Filters {
  timeframe?: TIME_FRAME
  createdBy?: string[]
  modifiedBy?: string[]
}

const columns: ListColumns<Kitchen.CostItem>[] = [
  {
    id: 'name',
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'amount',
    disablePadding: false,
    label: 'Amount',
    isNumber: true,
    isCurrency: true,
  },
  {
    id: 'created',
    disablePadding: false,
    label: 'Created',
    isDate: true,
  },
]
const adminColumns: ListColumns<Kitchen.CostItem>[] = [
  {
    id: 'createdBy',
    disablePadding: false,
    label: 'Created By',
  },
  {
    id: 'modified',
    disablePadding: false,
    label: 'Modified',
    isDate: true,
  },
  {
    id: 'lastModifiedBy',
    disablePadding: false,
    label: 'Modified By',
  },
]
const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

interface CostListFiltersProps {
  isAdmin?: boolean
  onFilterChange?: (filter?: Filters) => void
  createdOptions?: string[]
  modifiedOptions?: string[]
}
function CostListFilters({
  onFilterChange,
  isAdmin,
  createdOptions,
  modifiedOptions,
}: CostListFiltersProps): React.JSX.Element {
  const [filters, setFilters] = useState<Filters>()

  function updateFilters(partialFilter: Filters): void {
    const newFilter = { ...filters, ...partialFilter }

    setFilters(newFilter)
    if (onFilterChange) onFilterChange(newFilter)
  }
  function handleTimeframeChange(event: SelectChangeEvent<TIME_FRAME>): void {
    const { value } = event.target

    updateFilters({ timeframe: value as TIME_FRAME })
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
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormControl fullWidth>
            <InputLabel id='timeframe-select-label'>Created Timeframe</InputLabel>
            <Select
              labelId='timeframe-select-label'
              id='timeframe-select'
              value={filters?.timeframe ?? TIME_FRAME.ALL}
              label='Created Timeframe'
              onChange={handleTimeframeChange}
            >
              {TIME_FRAMES.map((time, index) => (
                <MenuItem key={index} value={time}>
                  {time}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
  costItems: Kitchen.CostItem[]
  onEdit?: (item: Kitchen.CostItem) => void
  onCreate?: () => void
  onDelete?: (items: Kitchen.CostItem[]) => void
}
export default function CostList({
  costItems,
  onCreate,
  onDelete,
  onEdit,
}: CostListProps): React.JSX.Element {
  const { data: session } = useSession()
  const isAdmin = useMemo(() => session?.user.isAdmin, [session])
  const tableColumns = useMemo(() => {
    return isAdmin ? [...columns, ...adminColumns] : columns
  }, [isAdmin])
  const [filters, setFilters] = useState<Filters>()
  const getFilterFunction = useCallback(() => {
    if (!filters) return undefined

    return (item: Kitchen.CostItem): boolean => {
      switch (filters.timeframe) {
        case TIME_FRAME.LAST_WEEK: {
          const endDate = dayjs().endOf('day')
          const startDate = endDate.subtract(7, 'days').startOf('day')
          const itemDate = dayjs(item.created)

          if (itemDate.isBefore(startDate) || itemDate.isAfter(endDate)) return false
          break
        }
        case TIME_FRAME.LAST_MONTH: {
          const endDate = dayjs().endOf('day')
          const startDate = endDate.subtract(1, 'month').startOf('day')
          const itemDate = dayjs(item.created)

          if (itemDate.isBefore(startDate) || itemDate.isAfter(endDate)) return false
          break
        }
        case TIME_FRAME.LAST_QUARTER: {
          const endDate = dayjs().endOf('day')
          const startDate = endDate.subtract(3, 'months').startOf('day')
          const itemDate = dayjs(item.created)

          if (itemDate.isBefore(startDate) || itemDate.isAfter(endDate)) return false
          break
        }
        case TIME_FRAME.CALENDAR_YEAR: {
          const endDate = dayjs().endOf('day')
          const startDate = endDate.startOf('year')
          const itemDate = dayjs(item.created)

          if (itemDate.isBefore(startDate) || itemDate.isAfter(endDate)) return false
          break
        }
      }

      if (filters.createdBy?.length && !filters.createdBy.includes(item.createdBy)) return false
      if (filters.modifiedBy?.length && !filters.modifiedBy.includes(item.lastModifiedBy))
        return false

      return true
    }
  }, [filters])
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
      rows={costItems}
      orderBy='created'
      sortOrder='desc'
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      filterComponent={
        <CostListFilters
          createdOptions={createdOptions}
          modifiedOptions={modifiedOptions}
          onFilterChange={(newFilters) => {
            setFilters(newFilters)
          }}
          isAdmin
        />
      }
      filter={getFilterFunction()}
    />
  )
}
