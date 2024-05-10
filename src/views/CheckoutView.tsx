'use client'

import React, { useEffect, useMemo, useState } from 'react'

import CreditCardStep from '@c/CheckoutSteps/CreditCardStep'
import DetailStep, { getCalculatePayloadValues } from '@c/CheckoutSteps/DetailStep'
import ExpenseStep from '@c/CheckoutSteps/ExpenseStep'
import OrderStep from '@c/CheckoutSteps/OrderStep'
import { type HTMLNumericElement } from '@c/NumberInput'
import ExpenseIcon from '@mui/icons-material/AddShoppingCart'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import OrderIcon from '@mui/icons-material/Fastfood'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Divider,
  MobileStepper,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import { serverToMenuItem } from '@/util/functions'
import { createKitchenCheckout } from '@/util/requests'
import { getFromStorage, removeFromStorage, saveToStorage } from '@/util/storage'

enum Steps {
  Orders,
  Credit,
  Expenses,
  Details,
}

const steps = [
  {
    label: 'Orders',
    icon: <OrderIcon />,
  },
  {
    label: 'Credit Cards',
    icon: <CreditCardIcon />,
  },
  {
    label: 'Expenses',
    icon: <ExpenseIcon />,
  },
  {
    label: 'Details',
    icon: <ReceiptIcon />,
  },
]

function getMenuFromStorage(
  filter: (item: Kitchen.Menu.Item) => boolean,
): Kitchen.Checkout.Order[] {
  const items = getFromStorage<Kitchen.Menu.Item[]>('Checkout.Menu', [])

  return items.filter(filter).map((i) => ({ quantity: 0, menuItem: i }))
}

function processPayload(payload: Kitchen.Checkout.Payload): Kitchen.Checkout.Payload {
  return {
    ...payload,
    orders: payload.orders.filter((o) => o.quantity),
  }
}

interface CheckoutViewProps {
  serverMenuItems: Kitchen.Menu.ServerItem[]
}
export default function CheckoutView({ serverMenuItems }: CheckoutViewProps): React.JSX.Element {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeStep, setActiveStep] = useState(Steps.Orders)
  const [loading, setLoading] = useState(false)
  const [isCreated, setIsCreated] = useState(false)
  const [payload, setPayload] = useState<Kitchen.Checkout.Payload>({
    creditCardSales: 0,
    deposit: 0,
    drinkChips: 0,
    sales: 0,
    expenses: 0,
    orders: [],
  })
  const menuOptions = useMemo(
    () => serverMenuItems.map(serverToMenuItem).sort((a, b) => a.name.localeCompare(b.name)),
    [serverMenuItems],
  )
  const [rememberMenu, setRememberMenu] = useState(false)

  function handleStepChange(step: number): void {
    setActiveStep(step)
  }
  function handleMenuChange(items: Kitchen.Menu.Item[]): void {
    const newOrders: Kitchen.Checkout.Order[] = items.map((item) => {
      const detail = payload.orders.find((d) => d.menuItem.id === item.id)

      return {
        quantity: detail?.quantity ?? 0,
        menuItem: item,
      }
    })

    newOrders.sort((a, b) => a.menuItem.name.localeCompare(b.menuItem.name))

    calculatePayload({ orders: newOrders })

    if (rememberMenu) saveToStorage('Checkout.Menu', items)
  }
  function handleOrderChange(orders: Kitchen.Checkout.Order[]): void {
    calculatePayload({ orders })
  }
  function handleRememberMenuChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { checked } = event.target

    saveToStorage('Checkout.RememberMenu', checked)

    if (!checked) {
      removeFromStorage('Checkout.Menu')
    } else if (payload.orders.length) {
      saveToStorage(
        'Checkout.Menu',
        payload.orders.map((m) => m.menuItem),
      )
    }

    setRememberMenu(checked)
  }
  function handleCreditCardChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const value = event.target.value

    calculatePayload({ creditCardSales: typeof value === 'number' ? Math.max(value, 0) : 0 })
  }
  function handleExpenseChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const value = event.target.value

    calculatePayload({ expenses: typeof value === 'number' ? Math.max(value, 0) : 0 })
  }

  function calculatePayload(partialPayload: Partial<Kitchen.Checkout.Payload>): void {
    const newPayload = { ...payload, ...partialPayload }
    const { sales, drinkChips } = getCalculatePayloadValues(newPayload)

    updatePayload({ ...newPayload, sales, drinkChips })
  }
  function updatePayload(partialPayload: Partial<Kitchen.Checkout.Payload>): void {
    const newPayload = { ...payload, ...partialPayload }
    const deposit = newPayload.sales - newPayload.drinkChips - newPayload.expenses

    setPayload({ ...newPayload, deposit })
  }

  async function handleCompleteCheckout(): Promise<void> {
    setLoading(true)

    const response = await createKitchenCheckout(processPayload(payload))

    if (!response) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to process checkout.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully processed checkout.`, severity: 'success' },
      })

      dispatchEvent(event)
      setIsCreated(true)
    }

    setLoading(false)
  }

  useEffect(() => {
    const remember = getFromStorage<boolean>('Checkout.RememberMenu', false)

    if (remember) {
      setRememberMenu(true)
      const validIds = serverMenuItems.map((i) => i.id)
      setPayload((prev) => ({
        ...prev,
        orders: getMenuFromStorage((item) => validIds.includes(item.id)).sort((a, b) =>
          a.menuItem.name.localeCompare(b.menuItem.name),
        ),
      }))
    }
  }, [serverMenuItems])

  return (
    <Box sx={{ pb: { xs: '56px', sm: 0 } }}>
      {isSmall ? (
        <MobileCheckoutStepper
          activeStep={activeStep}
          totalSteps={steps.length}
          onStepChange={handleStepChange}
          onStepperComplete={handleCompleteCheckout}
          loading={loading}
          isCreated={isCreated}
        >
          {activeStep === Steps.Orders && (
            <OrderStep
              menuOptions={menuOptions}
              menuOrders={payload.orders}
              rememberMenu={rememberMenu}
              onMenuChange={handleMenuChange}
              onOrderChange={handleOrderChange}
              onRememberMeChange={handleRememberMenuChange}
            />
          )}
          {activeStep === Steps.Credit && (
            <CreditCardStep value={payload.creditCardSales} onChange={handleCreditCardChange} />
          )}
          {activeStep === Steps.Expenses && (
            <ExpenseStep value={payload.expenses} onChange={handleExpenseChange} />
          )}
          {activeStep === Steps.Details && <DetailStep data={payload} isCreated={isCreated} />}
        </MobileCheckoutStepper>
      ) : (
        <CheckoutStepper
          activeStep={activeStep}
          totalSteps={steps.length}
          onStepChange={handleStepChange}
          onStepperComplete={handleCompleteCheckout}
          loading={loading}
          isCreated={isCreated}
        >
          {activeStep === Steps.Orders && (
            <OrderStep
              menuOptions={menuOptions}
              menuOrders={payload.orders}
              rememberMenu={rememberMenu}
              onMenuChange={handleMenuChange}
              onOrderChange={handleOrderChange}
              onRememberMeChange={handleRememberMenuChange}
            />
          )}
          {activeStep === Steps.Credit && (
            <CreditCardStep value={payload.creditCardSales} onChange={handleCreditCardChange} />
          )}
          {activeStep === Steps.Expenses && (
            <ExpenseStep value={payload.expenses} onChange={handleExpenseChange} />
          )}
          {activeStep === Steps.Details && <DetailStep data={payload} isCreated={isCreated} />}
        </CheckoutStepper>
      )}
    </Box>
  )
}

interface CheckoutStepperProps {
  activeStep: number
  children: React.ReactNode
  invalidStep?: boolean
  isCreated?: boolean
  loading?: boolean
  onStepChange?: (step: number) => void
  onStepperComplete?: () => void
  totalSteps: number
}
function MobileCheckoutStepper({
  activeStep,
  children,
  invalidStep,
  isCreated,
  loading,
  onStepChange,
  onStepperComplete,
  totalSteps,
}: CheckoutStepperProps): React.JSX.Element {
  const isLastStep = activeStep === totalSteps - 1

  function handleNext(): void {
    if (onStepChange) onStepChange(activeStep + 1)
  }

  function handleBack(): void {
    if (onStepChange) onStepChange(activeStep - 1)
  }

  function handleComplete(): void {
    if (onStepperComplete) onStepperComplete()
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper
        square
        sx={{
          position: 'fixed',
          top: { xs: 56, sm: 64 },
          left: 0,
          right: 0,
          p: 1,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Typography variant='h6' align='center'>
          {steps[activeStep].label}
        </Typography>
      </Paper>

      <Paper sx={{ width: '100%', p: 1, mt: '56px' }}>{children}</Paper>
      {!isCreated && (
        <MobileStepper
          variant='progress'
          steps={totalSteps}
          activeStep={activeStep}
          LinearProgressProps={{ color: 'secondary' }}
          nextButton={
            <LoadingButton
              size='small'
              onClick={isLastStep ? handleComplete : handleNext}
              loading={loading}
              disabled={invalidStep}
            >
              {isLastStep ? 'Submit' : 'Next'}
              {!isLastStep && <KeyboardArrowRight />}
            </LoadingButton>
          }
          backButton={
            <Button size='small' onClick={handleBack} disabled={activeStep === 0 || loading}>
              <KeyboardArrowLeft />
              Back
            </Button>
          }
        />
      )}
    </Box>
  )
}
function CheckoutStepper({
  activeStep,
  children,
  invalidStep,
  isCreated,
  loading,
  onStepChange,
  onStepperComplete,
  totalSteps,
}: CheckoutStepperProps): React.JSX.Element {
  const isLastStep = activeStep === totalSteps - 1

  function handleNext(): void {
    if (onStepChange) onStepChange(activeStep + 1)
  }

  function handleBack(): void {
    if (onStepChange) onStepChange(activeStep - 1)
  }

  function handleComplete(): void {
    if (onStepperComplete) onStepperComplete()
  }
  return (
    <Paper sx={{ p: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              icon={step.icon}
              sx={{
                '& .MuiSvgIcon-root': {
                  color: (theme) =>
                    index === activeStep
                      ? theme.vars.palette.primary.main
                      : index < activeStep
                        ? theme.vars.palette.success.main
                        : undefined,
                },
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Divider sx={{ mt: 1 }} />
      <Box sx={{ py: 2 }}>{children}</Box>
      {!isCreated && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleBack} disabled={activeStep === 0 || loading} color='inherit'>
            <KeyboardArrowLeft />
            Back
          </Button>
          <LoadingButton
            onClick={isLastStep ? handleComplete : handleNext}
            loading={loading}
            disabled={invalidStep}
            color='primary'
          >
            {isLastStep ? 'Submit' : 'Next'}
            {!isLastStep && <KeyboardArrowRight />}
          </LoadingButton>
        </Box>
      )}
    </Paper>
  )
}
