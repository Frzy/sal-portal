'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'

import { QohGameDialog } from '@c/QoHGameDialog'
import QohGameList from '@c/QohGameList'
import { useRouter } from 'next/navigation'

import { DIALOG_TYPES } from '@/util/constants'
import { serverToQoHGameItem } from '@/util/functions'

interface Crud<T> {
  type: DIALOG_TYPES
  items?: T[]
}

interface QohGamesViewProps {
  games: QoH.Game.ServerItem[]
}
export default function QohGamesView({ games: initGames }: QohGamesViewProps): React.JSX.Element {
  const router = useRouter()
  const games = useMemo(() => initGames.map(serverToQoHGameItem), [initGames])
  const [crud, setCrud] = useState<Crud<QoH.Game.Item>>({ type: DIALOG_TYPES.VIEW })

  async function handleDeleted(): Promise<void> {}
  function handleClose(): void {
    setCrud({ type: DIALOG_TYPES.VIEW })
  }
  useEffect(() => {
    router.prefetch('/qoh/games/create')
  }, [router])
  return (
    <Fragment>
      <QohGameList
        games={games}
        title='Queen of Hearts Games'
        onCreate={() => {
          router.push('/qoh/games/create')
        }}
        onDelete={(items) => {
          setCrud({ type: DIALOG_TYPES.DELETE, items })
        }}
        onEdit={(item) => {
          setCrud({ type: DIALOG_TYPES.EDIT, items: [item] })
        }}
      />
      <QohGameDialog
        open={crud.type !== DIALOG_TYPES.VIEW}
        onDeleted={handleDeleted}
        onClose={handleClose}
        {...crud}
      />
    </Fragment>
  )
}
