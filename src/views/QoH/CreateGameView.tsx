'use client'

import { useEffect, useMemo, useState } from 'react'

import GeneralStep from '@c/QohGameSteps/GeneralStep'
import PayoutsStep from '@c/QohGameSteps/PayoutStep'
import SeedStep from '@c/QohGameSteps/SeedStep'
import SummaryStep from '@c/QohGameSteps/SummaryStep'
import ResponsiveStepper, { type Step } from '@c/Stepper'
import BankIcon from '@mui/icons-material/AccountBalance'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'

import PlayingCardsIcon from '@/icons/PlayingCards'
import PottedPlantIcon from '@/icons/PottedPlant'
import { serverToQoHGameItem } from '@/util/functions'
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

interface QohCreateGameViewProps {
  currentGame?: QoH.Game.ServerItem
}
export default function QohCreateGameView({
  currentGame,
}: QohCreateGameViewProps): React.JSX.Element {
  const router = useRouter()
  const activeGame = useMemo(
    () => (currentGame ? serverToQoHGameItem(currentGame) : undefined),
    [currentGame],
  )
  const [activeStep, setActiveStep] = useState(Steps.General)
  const [loading, setLoading] = useState(false)
  const [isCreated, setIsCreated] = useState(false)
  const [showActiveGameWarning, setShowActiveGameWarning] = useState(false)
  const [payload, setPayload] = useState<QoH.Game.UiPayload>({
    createSeed: true,
    name: 'Game #',
    jackpotPercent: 0.7,
    maxGameReset: 2,
    maxSeed: 1000,
    initialJackpot: 0,
    shuffle: 1,
    resetOnTwoJokers: true,
    seedPercent: 0.1,
    startDate: dayjs(),
    ticketPrice: 1,
    paidJackpot: 0,
  })

  function handleStepChange(step: number): void {
    setActiveStep(step)
  }

  function updatePayload(partialPayload: Partial<QoH.Game.UiPayload>): void {
    const newPayload = { ...payload, ...partialPayload }

    setPayload({ ...newPayload })
  }

  function handleComplete(): void {
    setLoading(true)
    if (activeGame) {
      setShowActiveGameWarning(true)
    } else {
      void createQoHGame()
    }
  }

  async function createQoHGame(): Promise<void> {
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
    }

    const urlParams = new URLSearchParams(window.location.search)
    const callbackUrl = urlParams.get('callbackUrl')

    if (callbackUrl) {
      router.push(callbackUrl)
    } else {
      setIsCreated(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const callbackUrl = urlParams.get('callbackUrl')

    if (callbackUrl) router.prefetch(callbackUrl)
  }, [router])

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
        {activeStep === Steps.General && (
          <GeneralStep game={payload} onChange={updatePayload} disabled={loading} />
        )}
        {activeStep === Steps.Seed && (
          <SeedStep game={payload} onChange={updatePayload} disabled={loading} />
        )}
        {activeStep === Steps.Payouts && (
          <PayoutsStep game={payload} onChange={updatePayload} disabled={loading} />
        )}
        {activeStep === Steps.Summary && <SummaryStep game={payload} />}
      </ResponsiveStepper>
      {activeGame && (
        <Dialog open={showActiveGameWarning}>
          <DialogTitle>Active Game Warning</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText>
                There is currently an ongoing Queen of Hearts game (
                <Typography component='span' sx={{ fontWeight: 'fontWeightBold' }}>
                  {activeGame.name}
                </Typography>
                ). Creating a new game will deactivate{' '}
                <Typography component='span' sx={{ fontWeight: 'fontWeightBold' }}>
                  {activeGame.name}
                </Typography>
                .
              </DialogContentText>
              <Alert severity='warning'>
                Closing a game can not be reactivated within the SAL portal. To reactivate a Queen
                of Hearts game please contact the portal administrator.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              color='inherit'
              onClick={() => {
                setLoading(false)
                setShowActiveGameWarning(false)
              }}
            >
              Cancel
            </Button>
            <Button
              color='error'
              onClick={() => {
                setShowActiveGameWarning(false)
                void createQoHGame()
              }}
            >
              Deactivate
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
