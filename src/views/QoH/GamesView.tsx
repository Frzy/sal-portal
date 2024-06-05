'use client'

import { Fragment, useEffect, useRef, useState } from 'react'

import { type EnhancedListRef } from '@c/ListComponents/EnhancedList'
import { QohGameDialog } from '@c/QoHGameDialog'
import QohGameList from '@c/QohGameList'
import { useRouter } from 'next/navigation'

import { DIALOG_TYPES } from '@/util/constants'
import { serverToQoHGameItem } from '@/util/functions'

interface QohGamesViewProps {
  games: QoH.Game.ServerItem[]
}
export default function QohGamesView({ games: initGames }: QohGamesViewProps): React.JSX.Element {
  const router = useRouter()
  const [games, setGames] = useState(initGames.map(serverToQoHGameItem))
  const [crud, setCrud] = useState<DialogProperties<QoH.Game.Item>>({ type: DIALOG_TYPES.VIEW })
  const listRef = useRef<EnhancedListRef | null>(null)

  function handleEdited(editedItem: QoH.Game.Item): void {
    setGames(games.map((item) => (item.id === editedItem.id ? editedItem : item)))
    if (listRef.current) listRef.current.clearSelection()
  }
  function handleDeleted(items: QoH.Game.Item[]): void {
    const ids = items.map((i) => i.id)
    setGames(games.filter((item) => !ids.includes(item.id)))

    if (listRef.current) listRef.current.clearSelection()
  }
  function handleClose(): void {
    setCrud({ type: DIALOG_TYPES.VIEW })
  }
  useEffect(() => {
    const url = new URL('/qoh/games/create', window.location.origin)

    url.searchParams.set('callbackUrl', '/qoh/games')

    router.prefetch(url.toString())
  }, [router])
  return (
    <Fragment>
      <QohGameList
        games={games}
        title='Queen of Hearts Games'
        onCreate={() => {
          const url = new URL('/qoh/games/create', window.location.origin)
          url.searchParams.set('callbackUrl', '/qoh/games')
          router.push(url.toString())
        }}
        onDelete={(items) => {
          setCrud({ type: DIALOG_TYPES.DELETE, items })
        }}
        onEdit={(item) => {
          setCrud({ type: DIALOG_TYPES.EDIT, items: [item] })
        }}
        listRef={listRef}
      />
      <QohGameDialog
        open={crud.type !== DIALOG_TYPES.VIEW}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
        onClose={handleClose}
        {...crud}
      />
    </Fragment>
  )
}
