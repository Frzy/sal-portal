'use client'

import { useMemo, useRef, useState } from 'react'

import { type EnhancedListRef } from '@c/ListComponents/EnhancedList'
import CostList from '@c/PullTabCostList'
import { PulltabCostDialog } from '@c/PulltabCostDialog'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'

import { DIALOG_TYPES } from '@/util/constants'
import { serverToPullTabCostItem } from '@/util/functions'

interface CostViewProps {
  costItems: PullTab.Cost.ServerItem[]
}
export default function CostView({
  costItems: initCostItems = [],
}: CostViewProps): React.JSX.Element {
  const router = useRouter()
  const [costItems, setCostItems] = useState<PullTab.Cost.Item[]>(
    initCostItems.map(serverToPullTabCostItem),
  )

  const [toEdit, setToEdit] = useState<PullTab.Cost.Item>()
  const [toDelete, setToDelete] = useState<PullTab.Cost.Item[]>()
  const { type, items, dialogOpen } = useMemo(() => {
    let type = DIALOG_TYPES.CREATE
    let items: PullTab.Cost.Item[] | undefined

    if (toEdit) {
      type = DIALOG_TYPES.EDIT
      items = [toEdit]
    }
    if (toDelete) {
      type = DIALOG_TYPES.DELETE
      items = toDelete
    }

    return { type, items, dialogOpen: !!toEdit || !!toDelete }
  }, [toEdit, toDelete])
  const listRef = useRef<EnhancedListRef | null>(null)

  function handleCreateClick(): void {
    const url = new URL('/pull-tabs/create/cost', window.location.origin)
    url.searchParams.set('callbackUrl', '/pull-tabs/costs')

    router.push(url.toString())
  }
  function handleEditClick(item: PullTab.Cost.Item): void {
    setToEdit(item)
  }
  function handleDeleteClick(items: PullTab.Cost.Item[]): void {
    setToDelete(items)
  }

  function handleDeleted(deletedItems: PullTab.Cost.Item[]): void {
    const ids = deletedItems.map((i) => i.id)
    setCostItems(costItems.filter((item) => !ids.includes(item.id)))

    if (listRef.current) listRef.current.clearSelection()
  }
  function handleEdited(editedItem: PullTab.Cost.Item): void {
    setCostItems(costItems.map((item) => (item.id === editedItem.id ? editedItem : item)))
  }

  function handleDialogClose(): void {
    setToDelete(undefined)
    setToEdit(undefined)
  }

  return (
    <Box sx={{ pb: '40px' }}>
      <CostList
        title='Costs'
        costItems={costItems}
        onCreate={handleCreateClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        listRef={listRef}
      />
      <PulltabCostDialog
        open={dialogOpen}
        items={items}
        type={type}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
        onClose={handleDialogClose}
      />
    </Box>
  )
}
