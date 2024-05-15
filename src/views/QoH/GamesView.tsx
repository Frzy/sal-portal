'use client'

// import { useMemo, useState } from 'react'

// import { QohDialog } from '@c/QoHGameDialog'
// import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material'

// import { DIALOG_TYPES } from '@/util/constants'
// import { serverToQoHGameItem } from '@/util/functions'

interface QohGamesViewProps {
  games: QoH.Game.ServerItem[]
}
export default function QohGamesView({ games: initGames }: QohGamesViewProps): React.JSX.Element {
  // const [games, setGames] = useState(initGames.map(serverToQoHGameItem))
  // const [toEdit, setToEdit] = useState<QoH.Game.Item>()
  // const [toDelete, setToDelete] = useState<QoH.Game.Item[]>()
  // const { type, items, open } = useMemo(() => {
  //   let type = DIALOG_TYPES.CREATE

  //   let items: QoH.Game.Item[] | undefined

  //   if (toEdit) {
  //     type = DIALOG_TYPES.EDIT
  //     items = [toEdit]
  //   }
  //   if (toDelete) {
  //     type = DIALOG_TYPES.DELETE
  //     items = toDelete
  //   }

  //   return { type, items, open: !!toEdit || !!toDelete }
  // }, [toEdit, toDelete])

  // function handleEditClick(item: QoH.Game.Item): void {
  //   setToEdit(item)
  // }
  // function handleDeleteClick(items: QoH.Game.Item[]): void {
  //   setToDelete(items)
  // }

  // function handleDeleted(deletedItems: QoH.Game.Item[]): void {
  //   const ids = deletedItems.map((i) => i.id)
  //   setGames(games.filter((item) => !ids.includes(item.id)))
  // }
  // function handleEdited(editedItem: QoH.Game.Item): void {
  //   setGames(games.map((item) => (item.id === editedItem.id ? editedItem : item)))
  // }
  // function handleClose(): void {
  //   setToDelete(undefined)
  //   setToEdit(undefined)
  // }

  // return (
  //   <Box>
  //     <Paper sx={{ p: 2 }}>
  //       <Stack spacing={1}>
  //         <Typography variant='h4'>Queen of Heart Games</Typography>
  //         {!games.length && (
  //           <Alert severity='info'>
  //             <Typography gutterBottom>
  //               No queen of hearts games found. Use the button below to create one.
  //             </Typography>

  //             <Button
  //               href={`/qoh/games/create?callbackUrl=${encodeURIComponent('/qoh/games')}`}
  //               fullWidth
  //             >
  //               Create Game
  //             </Button>
  //           </Alert>
  //         )}
  //       </Stack>
  //     </Paper>
  //     <QohDialog
  //       open={open}
  //       items={items}
  //       type={type}
  //       onDeleted={handleDeleted}
  //       onEdited={handleEdited}
  //       onClose={handleClose}
  //     />
  //   </Box>
  // )

  return <h1>Under Construction</h1>
}
