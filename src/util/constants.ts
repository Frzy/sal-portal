export enum TIME_FRAME {
  ALL = 'All',
  CALENDAR_YEAR = 'Calendar Year',
  LEGION_YEAR = 'Legion Year',
  LAST_WEEK = 'Last 7 Days',
  LAST_MONTH = 'Last 30 Days',
  LAST_QUARTER = 'Last 90 Days',
  CUSTOM = 'Custom',
}
export const TIME_FRAMES = Object.values(TIME_FRAME)

export enum DIALOG_TYPES {
  CREATE,
  EDIT,
  DELETE,
  VIEW,
}

export const LONG_TIME_FORMAT = 'MMM DD YYYY @ HH:mm'

// July
export const LEGION_MONTH_START = 7
