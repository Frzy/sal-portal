'use client'

import { Fragment, useMemo } from 'react'

import QohGameList from '@c/QohGameList'

import { serverToQoHGameItem } from '@/util/functions'

interface QohGamesViewProps {
  games: QoH.Game.ServerItem[]
}
export default function QohGamesView({ games: initGames }: QohGamesViewProps): React.JSX.Element {
  const games = useMemo(() => initGames.map(serverToQoHGameItem), [initGames])

  return (
    <Fragment>
      <QohGameList games={games} />
    </Fragment>
  )
}
