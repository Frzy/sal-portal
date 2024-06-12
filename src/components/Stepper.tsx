'use client'

import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Divider,
  MobileStepper as MuiMobileStepper,
  Step as MuiStep,
  Paper,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

export interface Step {
  label: string
  icon?: React.ReactNode
}

interface StepperProps {
  activeStep: number
  children: React.ReactNode
  disableNext?: boolean
  isComplete?: boolean
  loading?: boolean
  onStepChange?: (step: number) => void
  onStepperComplete?: () => void
  steps: Step[]
  title?: string
}

interface ResponsiveStepperProps extends StepperProps {
  children: React.ReactNode
}
export default function ResponsiveStepper({
  children,
  ...props
}: ResponsiveStepperProps): React.JSX.Element {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

  return isSmall ? (
    <MobileStepper {...props}>{children}</MobileStepper>
  ) : (
    <DesktopStepper {...props}>{children}</DesktopStepper>
  )
}

export function MobileStepper({
  activeStep,
  children,
  disableNext,
  isComplete,
  loading,
  onStepChange,
  onStepperComplete,
  steps,
}: StepperProps): React.JSX.Element {
  const isLastStep = activeStep === steps.length - 1

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
      {!isComplete && (
        <MuiMobileStepper
          variant='progress'
          steps={steps.length}
          activeStep={activeStep}
          LinearProgressProps={{ color: 'secondary' }}
          nextButton={
            <LoadingButton
              size='small'
              onClick={isLastStep ? handleComplete : handleNext}
              loading={loading}
              disabled={disableNext}
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
export function DesktopStepper({
  activeStep,
  children,
  disableNext,
  isComplete,
  loading,
  onStepChange,
  onStepperComplete,
  steps,
}: StepperProps): React.JSX.Element {
  const isLastStep = activeStep === steps.length - 1

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
          <MuiStep key={step.label}>
            <StepLabel
              icon={step.icon}
              sx={{
                '& .MuiSvgIcon-root': {
                  color: (theme) =>
                    isComplete
                      ? theme.vars.palette.success.main
                      : index === activeStep
                        ? theme.vars.palette.primary.main
                        : index < activeStep
                          ? theme.vars.palette.success.main
                          : undefined,
                },
              }}
            >
              {step.label}
            </StepLabel>
          </MuiStep>
        ))}
      </Stepper>
      <Divider sx={{ mt: 1 }} />
      <Box sx={{ py: 2 }}>{children}</Box>
      {!isComplete && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleBack} disabled={activeStep === 0 || loading} color='inherit'>
            <KeyboardArrowLeft />
            Back
          </Button>
          <LoadingButton
            onClick={isLastStep ? handleComplete : handleNext}
            loading={loading}
            disabled={disableNext}
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
