import { Fragment, useMemo, useState } from 'react'

import NumberInput from '@c/NumberInput'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import EditIcon from '@mui/icons-material/Edit'
import ResetIcon from '@mui/icons-material/RestartAlt'
import {
  Alert,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Tooltip,
  Typography,
} from '@mui/material'

import { formatCurrency } from '@/util/functions'

export interface CalculatedCheckoutValues {
  sales: number
  drinkChips: number
}

export function getCalculatePayloadValues(
  payload: Kitchen.Checkout.Payload,
): CalculatedCheckoutValues {
  return payload.orders.reduce(
    (totals, item) => {
      return {
        sales: totals.sales + item.quantity * item.menuItem.price,
        drinkChips: totals.drinkChips + (item.menuItem.hasDrinkChip ? item.quantity : 0),
      }
    },
    { sales: 0, drinkChips: 0 },
  )
}

interface SummaryStepProps {
  onChange?: (partialPayload: Partial<Kitchen.Checkout.Payload>) => void
  data: Kitchen.Checkout.Payload
  isCreated?: boolean
}
export default function SummaryStep({
  data,
  isCreated,
  onChange,
}: SummaryStepProps): React.JSX.Element {
  const orders = useMemo(() => {
    return [...data.orders].sort((a, b) => b.quantity - a.quantity)
  }, [data])
  const calculatedValues = useMemo(() => {
    return getCalculatePayloadValues(data)
  }, [data])
  const barMoney = useMemo(() => {
    return data.creditCardSales - data.drinkChips
  }, [data])
  const barOwesMoney = barMoney >= 0
  const hasOrderitems = useMemo(() => {
    return data.orders.length && data.orders.some((o) => o.quantity)
  }, [data])
  const [showSaleEdit, setShowSaleEdit] = useState(false)
  const [showDrinkEdit, setShowDrinkEdit] = useState(false)
  const [drinkOverride, setDrinkOverride] = useState(data.drinkChips)
  const [salesOverride, setSalesOverride] = useState(data.sales)

  function submitSalesChange(): void {
    if (data.sales !== salesOverride && onChange) {
      onChange({ sales: salesOverride })
    }

    closeSalesDialog()
  }
  function closeSalesDialog(): void {
    setShowSaleEdit(false)
  }

  function submitDrinkChange(): void {
    if (data.drinkChips !== drinkOverride && onChange) {
      onChange({ drinkChips: drinkOverride })
    }

    closeDrinkDialog()
  }
  function closeDrinkDialog(): void {
    setShowDrinkEdit(false)
  }
  return (
    <Box>
      {isCreated && (
        <Alert severity='success' sx={{ mb: 2 }}>
          Thank you for volunteering for the kitchen crew. You have finished the checkout process.
        </Alert>
      )}
      <List disablePadding>
        {hasOrderitems ? (
          orders.map(({ menuItem, quantity }, index) => {
            if (!quantity) return null

            return (
              <ListItem key={menuItem.id} divider={index < orders.length - 1}>
                <Typography
                  component='span'
                  sx={{
                    minWidth: 28,
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 'fontWeightBold',
                    pr: 1,
                  }}
                >
                  {quantity}
                </Typography>
                <Typography component='span' sx={{ flexGrow: 1 }}>
                  {menuItem.name}
                </Typography>
                <Typography
                  component='span'
                  sx={{
                    fontFamily: 'monospace',
                    textAlign: 'right',
                    minWidth: 70,
                    color: 'text.secondary',
                  }}
                >
                  {formatCurrency(quantity * menuItem.price)}
                </Typography>
              </ListItem>
            )
          })
        ) : !isCreated ? (
          <Alert severity='warning' sx={{ mb: 1 }}>
            You do not have any orders filled out
          </Alert>
        ) : null}
        <Divider sx={{ borderBottomWidth: 'thick' }} />
        {!!data.creditCardSales && (
          <Fragment>
            <ListItem sx={{ pl: 0 }}>
              <Typography
                component='span'
                sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
              >
                Credit Cards
              </Typography>
              <Typography
                component='span'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(data.creditCardSales)}
              </Typography>
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <Typography
                component='span'
                sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
              >
                Cash
              </Typography>
              <Typography
                component='span'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(data.sales - data.creditCardSales)}
              </Typography>
            </ListItem>
            <Divider sx={{ borderBottomWidth: 'thick' }} />
          </Fragment>
        )}
        <ListItem sx={{ pl: 0 }}>
          <IconButton
            onClick={() => {
              setSalesOverride(data.sales)
              setShowSaleEdit(true)
            }}
          >
            <EditIcon />
          </IconButton>
          <Typography
            component='span'
            sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: 1, sm: 3 } }}
          >
            Total Sales
          </Typography>
          <Tooltip
            title={
              calculatedValues.drinkChips === data.drinkChips
                ? ''
                : `Calculated value of ${formatCurrency(calculatedValues.sales)} has been overridden`
            }
          >
            <Badge
              color='warning'
              variant='dot'
              invisible={calculatedValues.sales === data.sales}
              sx={{
                '& .MuiBadge-badge': {
                  right: -2.5,
                  top: 5,
                },
              }}
            >
              <Typography
                component='span'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(data.sales)}
              </Typography>
            </Badge>
          </Tooltip>
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <IconButton
            onClick={() => {
              setShowDrinkEdit(true)
            }}
          >
            <EditIcon />
          </IconButton>
          <Typography
            component='span'
            sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: 1, sm: 3 } }}
          >
            Drink Chips
          </Typography>
          <Tooltip
            title={
              calculatedValues.drinkChips === data.drinkChips
                ? ''
                : `Calculated value of ${formatCurrency(-1 * calculatedValues.drinkChips)} has been overridden`
            }
          >
            <Badge
              color='warning'
              variant='dot'
              invisible={calculatedValues.drinkChips === data.drinkChips}
              sx={{
                '& .MuiBadge-badge': {
                  right: -2.5,
                  top: 5,
                },
              }}
            >
              <Typography
                component='span'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  color: (theme) =>
                    data.drinkChips
                      ? theme.vars.palette.error.main
                      : theme.vars.palette.text.secondary,
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency((data.drinkChips ? -1 : 1) * data.drinkChips)}
              </Typography>
            </Badge>
          </Tooltip>
        </ListItem>
        {!!data.expenses && (
          <ListItem sx={{ pl: 0 }}>
            <Typography
              component='span'
              sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
            >
              Additional Expenses
            </Typography>
            <Typography
              component='span'
              sx={{
                fontFamily: 'monospace',
                textAlign: 'right',
                minWidth: 70,
                color: (theme) => theme.vars.palette.error.main,
                fontSize: '1.2rem',
                fontWeight: 'fontWeightBold',
              }}
            >
              {formatCurrency(-1 * data.expenses)}
            </Typography>
          </ListItem>
        )}
        <Divider sx={{ borderBottomWidth: 'thick' }} />
        <ListItem sx={{ pl: 0 }}>
          <Typography component='span' sx={{ flexGrow: 1, fontSize: '1.75rem', pl: 0.5 }}>
            Deposit
          </Typography>
          <Typography
            component='span'
            sx={{
              fontFamily: 'monospace',
              textAlign: 'right',
              minWidth: 70,
              color: (theme) => theme.vars.palette.success.main,
              fontSize: '1.75rem',
              fontWeight: 'fontWeightBold',
            }}
          >
            {formatCurrency(data.deposit)}
          </Typography>
        </ListItem>
      </List>
      <Alert severity={barOwesMoney ? 'info' : 'error'}>
        <Typography component='span'>
          {barOwesMoney ? 'Bar Owes Kitchen' : 'Kitchen Owes Bar'}:{' '}
          <Typography
            component='span'
            sx={{
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              fontWeight: 'fontWeightBold',
              pl: 1,
            }}
          >
            {formatCurrency(Math.abs(barMoney))}
          </Typography>
        </Typography>
      </Alert>

      <Dialog open={showDrinkEdit} onClose={closeDrinkDialog}>
        <DialogTitle>Update Drink Count</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            To update the drink count, please enter the new value in the input below.
          </DialogContentText>
          <NumberInput
            label='Drink Count'
            fullWidth
            precision={0}
            value={drinkOverride}
            InputProps={{
              endAdornment:
                drinkOverride !== calculatedValues.drinkChips ? (
                  <InputAdornment position='end'>
                    <Tooltip title='Reset to calculated value'>
                      <IconButton
                        onClick={() => {
                          setDrinkOverride(calculatedValues.drinkChips)
                        }}
                      >
                        <ResetIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
            }}
            onChange={(event) => {
              const value = typeof event.target.value === 'number' ? event.target.value : 0

              setDrinkOverride(value)
            }}
            onKeyUp={(event) => {
              if (event.key === 'Enter') submitDrinkChange()
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDrinkDialog} color='inherit'>
            Cancel
          </Button>
          <Button onClick={submitDrinkChange}>Update</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showSaleEdit} onClose={closeSalesDialog}>
        <DialogTitle>Update Total Sales</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            To update the total sales, please enter the new value in the input below.
          </DialogContentText>
          <NumberInput
            label='Total Sales'
            fullWidth
            value={salesOverride}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MoneyIcon />
                </InputAdornment>
              ),
              endAdornment:
                salesOverride !== calculatedValues.sales ? (
                  <InputAdornment position='end'>
                    <Tooltip title='Reset to calculated value'>
                      <IconButton
                        onClick={() => {
                          setSalesOverride(calculatedValues.sales)
                        }}
                      >
                        <ResetIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
            }}
            onChange={(event) => {
              const value = typeof event.target.value === 'number' ? event.target.value : 0

              setSalesOverride(value)
            }}
            onKeyUp={(event) => {
              if (event.key === 'Enter') submitSalesChange()
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSalesDialog} color='inherit'>
            Cancel
          </Button>
          <Button onClick={submitSalesChange}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
