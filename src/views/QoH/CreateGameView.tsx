'use client'

import { useState } from 'react'

import GeneralStep from '@c/QohGameSteps/GeneralStep'
import PayoutsStep from '@c/QohGameSteps/PayoutStep'
import SeedStep from '@c/QohGameSteps/SeedStep'
import SummaryStep from '@c/QohGameSteps/SummaryStep'
import ResponsiveStepper, { type Step } from '@c/Stepper'
import BankIcon from '@mui/icons-material/AccountBalance'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box } from '@mui/material'
import dayjs from 'dayjs'

import PlayingCardsIcon from '@/icons/PlayingCards'
import PottedPlantIcon from '@/icons/PottedPlant'
import { createQohGame } from '@/util/requests'

enum Steps {
  General,
  Seed,
  Payouts,
  Summary,
}

const steps: Step[] = [
  {
    label: 'General',
    icon: <SettingsIcon />,
  },
  {
    label: 'Seed',
    icon: <PottedPlantIcon />,
  },
  {
    label: 'Payouts',
    icon: <BankIcon />,
  },
  {
    label: 'Summary',
    icon: <PlayingCardsIcon />,
  },
]

export default function QohCreateGameView(): React.JSX.Element {
  const [activeStep, setActiveStep] = useState(Steps.Payouts)
  const [loading, setLoading] = useState(false)
  const [isCreated, setIsCreated] = useState(false)
  const [payload, setPayload] = useState<QoH.Game.UiPayload>({
    createSeed: true,
    jackpotPercent: 0.7,
    maxGameReset: 2,
    maxSeed: 1000,
    initialJackpot: 0,

    resetNumber: 0,
    resetOnTwoJokers: true,

    seedPercent: 0.1,
    startDate: dayjs(),
    ticketPrice: 1,
  })

  function handleStepChange(step: number): void {
    setActiveStep(step)
  }

  function updatePayload(partialPayload: Partial<QoH.Game.UiPayload>): void {
    const newPayload = { ...payload, ...partialPayload }

    setPayload({ ...newPayload })
  }

  async function handleComplete(): Promise<void> {
    setLoading(true)

    const response = await createQohGame({
      ...payload,
      startDate: payload.startDate.format(),
      endDate: payload.endDate ? payload.endDate.format() : undefined,
      lastResetDate: payload.lastResetDate ? payload.lastResetDate.format() : undefined,
    })

    if (!response) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to create queen of hearts game.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully created queen of hearts game.`, severity: 'success' },
      })

      dispatchEvent(event)
      setIsCreated(true)
    }

    setLoading(false)
  }

  return (
    <Box sx={{ pb: { xs: '56px', sm: 0 } }}>
      <ResponsiveStepper
        activeStep={activeStep}
        steps={steps}
        onStepChange={handleStepChange}
        onStepperComplete={handleComplete}
        loading={loading}
        isComplete={isCreated}
      >
        {activeStep === Steps.General && <GeneralStep game={payload} onChange={updatePayload} />}
        {activeStep === Steps.Seed && <SeedStep game={payload} onChange={updatePayload} />}
        {activeStep === Steps.Payouts && <PayoutsStep game={payload} onChange={updatePayload} />}
        {activeStep === Steps.Summary && <SummaryStep />}
      </ResponsiveStepper>
    </Box>
  )
}
