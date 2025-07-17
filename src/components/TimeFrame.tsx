import { useState } from 'react'

import {
  Box,
  Collapse,
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material'
import {
  DatePicker,
  type DateValidationError,
  type PickerChangeHandlerContext,
} from '@mui/x-date-pickers'
import dayjs, { type Dayjs } from 'dayjs'

import { TIME_FRAME, TIME_FRAMES } from '@/util/constants'
import { getCurrentLegionYear } from '@/util/functions'

export interface TimeFrameValue {
  value: TIME_FRAME
  startDate: Dayjs
  endDate: Dayjs
}

export function getTimeFrameStartEndDate(
  timeFrame: Exclude<TIME_FRAME, TIME_FRAME.CUSTOM>,
  minDate: Dayjs,
): Omit<TimeFrameValue, 'value'> {
  const endDate = dayjs().endOf('day')

  switch (timeFrame) {
    case TIME_FRAME.LAST_WEEK: {
      const startDate = endDate.subtract(7, 'days').startOf('day')

      return { startDate, endDate }
    }
    case TIME_FRAME.LAST_MONTH: {
      const startDate = endDate.subtract(1, 'month').startOf('day')

      return { startDate, endDate }
    }
    case TIME_FRAME.LAST_QUARTER: {
      const startDate = endDate.subtract(3, 'months').startOf('day')

      return { startDate, endDate }
    }
    case TIME_FRAME.CALENDAR_YEAR: {
      const startDate = endDate.startOf('year')

      return { startDate, endDate }
    }
    case TIME_FRAME.LEGION_YEAR:
      return getCurrentLegionYear()
    default: {
      return { startDate: minDate, endDate }
    }
  }
}

interface TimeFrameProps {
  id: string
  label?: string
  minDate?: Dayjs
  onChange: (timeFrame: TimeFrameValue) => void
  size?: FormControlProps['size']
  value: TIME_FRAME
}
export default function TimeFrame({
  id,
  label = 'Timeframe',
  minDate = dayjs('2000', 'YYYY').startOf('year'),
  onChange,
  size = 'medium',
  value,
}: TimeFrameProps): React.JSX.Element {
  const showCustomDates = value === TIME_FRAME.CUSTOM
  const [customDates, setCustomDates] = useState<Omit<TimeFrameValue, 'value'>>({
    startDate: minDate,
    endDate: dayjs().endOf('day'),
  })

  function handleChange(event: SelectChangeEvent<TIME_FRAME>): void {
    const value = event.target.value as unknown as TIME_FRAME

    if (value === TIME_FRAME.CUSTOM) {
      const endDate = dayjs().endOf('day')
      setCustomDates({
        startDate: minDate,
        endDate,
      })
      onChange({ value, startDate: minDate, endDate })
    } else {
      onChange({ value, ...getTimeFrameStartEndDate(value, minDate) })
    }
  }
  function handleCustomStartChange(
    date: Dayjs | null,
    context: PickerChangeHandlerContext<DateValidationError>,
  ): void {
    if (!context.validationError) {
      const startDate = date ?? minDate
      setCustomDates((prev) => ({ ...prev, startDate }))

      onChange({ value, ...customDates, startDate })
    }
  }
  function handleCustomEndChange(
    date: Dayjs | null,
    context: PickerChangeHandlerContext<DateValidationError>,
  ): void {
    if (!context.validationError) {
      const endDate = date ?? dayjs()
      setCustomDates((prev) => ({ ...prev, endDate }))
      onChange({ value, ...customDates, endDate })
    }
  }

  return (
    <Box>
      <FormControl fullWidth size={size} sx={{ pb: showCustomDates ? 1 : 0 }}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select id={id} label={label} labelId={`${id}-label`} onChange={handleChange} value={value}>
          {TIME_FRAMES.map((time, index) => (
            <MenuItem key={index} value={time}>
              {time}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Collapse in={showCustomDates}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <DatePicker
            label='Start Date'
            sx={{ flexGrow: 1 }}
            minDate={minDate}
            maxDate={customDates.endDate.subtract(1, 'day')}
            value={customDates.startDate}
            onChange={handleCustomStartChange}
          />
          <DatePicker
            label='End Date'
            sx={{ flexGrow: 1 }}
            value={customDates.endDate}
            minDate={customDates.startDate.add(1, 'day')}
            disableFuture
            onChange={handleCustomEndChange}
          />
        </Box>
      </Collapse>
    </Box>
  )
}
