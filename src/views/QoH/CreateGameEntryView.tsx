'use client'

import { useMemo, useState } from 'react'

import CreateEntryDrawingStep from '@c/QoHEntrySteps/drawing'
import CreateEntrySalesStep from '@c/QoHEntrySteps/sales'
import CreateEntrySummaryStep from '@c/QoHEntrySteps/summary'
import ResponsiveStepper, { type Step } from '@c/Stepper'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box } from '@mui/material'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'

import PlayingCardsIcon from '@/icons/PlayingCards'
import { serverToQoHGameItem } from '@/util/functions'
import { createQohEntry } from '@/util/requests'

enum Steps {
  Sales,
  Payout,
  Summary,
}

const steps: Step[] = [
  {
    label: 'Ticket Sales',
    icon: <MoneyIcon />,
  },
  {
    label: 'Drawings',
    icon: <PlayingCardsIcon />,
  },
  {
    label: 'Summary',
    icon: <ReceiptIcon />,
  },
]

interface CreateQohGameEntryViewProps {
  game: QoH.Game.ServerItem
}
export default function CreateQohGameEntryView({
  game: initGame,
}: CreateQohGameEntryViewProps): React.JSX.Element {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(Steps.Sales)
  const [loading, setLoading] = useState(false)
  const game = useMemo(() => serverToQoHGameItem(initGame), [initGame])
  const [isCreated, setIsCreated] = useState(false)
  const [payload, setPayload] = useState<QoH.Entry.UiPayload>({
    drawDate: dayjs(),
    ticketSales: 0,
    payout: 0,
    shuffle: game.shuffle,
    cardPosition: 0,
    cardDrawn: '',
  })
  const breakdown = useMemo<QoH.Game.Item['totals']>(() => {
    const hasMaxSeed = game.createSeed && game.maxSeed > 0
    const seed =
      game.createSeed && (!hasMaxSeed || game.maxSeed > game.totals.seed)
        ? Math.floor(payload.ticketSales * game.seedPercent)
        : 0
    const availableFund = payload.ticketSales - payload.payout - seed
    const jackpot = Math.floor(availableFund * game.jackpotPercent)
    let profit = Math.ceil(availableFund * (1 - game.jackpotPercent))

    if (jackpot + profit !== availableFund) {
      profit += availableFund - (jackpot + profit)
    }

    return {
      availableFund,
      jackpot,
      payout: payload.payout,
      profit,
      sales: payload.ticketSales,
      seed,
    }
  }, [payload, game])
  const validStep = useMemo(() => {
    switch (activeStep) {
      case Steps.Sales: {
        return !!payload.ticketSales
      }
      case Steps.Payout: {
        return (
          !!payload.cardDrawn &&
          !!payload.cardPosition &&
          !(
            payload.cardPosition > 54 ||
            game.entries.some((e) => e.cardPosition === payload.cardPosition)
          )
        )
      }
      default:
        return true
    }
  }, [activeStep, payload, game])

  function handleStepChange(step: number): void {
    setActiveStep(step)
  }

  function handleSalesChange(sales: number): void {
    updatePayload({ ticketSales: sales })
  }

  function updatePayload(partialPayload: Partial<QoH.Entry.UiPayload>): void {
    setPayload((prev) => ({ ...prev, ...partialPayload }))
  }

  function handleComplete(): void {
    setLoading(true)
    void createQoHEntry()
  }

  async function createQoHEntry(): Promise<void> {
    setLoading(true)

    const response = await createQohEntry(game.id, payload)

    if (!response) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to create queen of hearts entry.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully created queen of hearts entry.`, severity: 'success' },
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

  return (
    <Box sx={{ pb: { xs: '56px', sm: 0 } }}>
      <ResponsiveStepper
        activeStep={activeStep}
        steps={steps}
        onStepChange={handleStepChange}
        onStepperComplete={handleComplete}
        loading={loading}
        isComplete={isCreated}
        disableNext={!validStep}
      >
        {activeStep === Steps.Sales && (
          <CreateEntrySalesStep
            game={game}
            sales={payload.ticketSales}
            breakdown={breakdown}
            onChange={handleSalesChange}
          />
        )}
        {activeStep === Steps.Payout && (
          <CreateEntryDrawingStep
            game={game}
            payload={payload}
            breakdown={breakdown}
            onChange={updatePayload}
          />
        )}
        {activeStep === Steps.Summary && (
          <CreateEntrySummaryStep game={game} payload={payload} breakdown={breakdown} />
        )}
      </ResponsiveStepper>
    </Box>
  )
}
