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
export const DATE_FORMAT = 'MMM DD, YYYY'

// July
export const LEGION_MONTH_START = 6

export const OLD_SCHOOL_QOH = [
  'c76c12d9-3dfb-4ba6-980b-b32ff882b947',
  'a8e76cc2-84ac-4535-b756-f77bdf89a055',
  'ecacfd29-78fe-4425-b80f-08ccb2facfd6',
  '6c482ba8-4726-471c-8b89-94a2fffcdaf1',
  'eca1f5d6-ff09-48c1-a9e2-efc4fa7a8cfb',
  '0502659a-5e06-40b4-ac19-bff924462679',
  '2bb7f631-81d9-418d-a631-ad78c34f4847',
  '480585c5-12db-4ba9-97e8-f22b27b8e7fb',
  'e06ce82e-f4a7-4e8d-84a4-c3ea53947ed6',
  'f9c23007-960e-4645-ab97-fc4a1f4a1149',
  '6c938130-daa2-4496-8f10-c8a441e7435b',
  'f4019b0d-ccc2-43d5-bbd6-1bfca8130215',
]

export const DRAWER_WIDTH = 240
export const CARD_VALUE_MAP: Record<Card.Value, string> = {
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
  '10': 'Ten',
  J: 'Jack',
  Q: 'Queen',
  K: 'King',
  A: 'Ace',
  X: 'Joker',
}
