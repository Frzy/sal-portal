'use client'

import { Fragment, useMemo, useState } from 'react'

import CostList from '@c/CostList'
import { KitchenCostDialog } from '@c/KitchenCostDialog'
import dayjs from 'dayjs'

import { DIALOG_TYPES } from '@/util/constants'

interface CostViewProps {
  costItems: Kitchen.ServerCostItem[]
}
export default function CostView({
  costItems: initCostItems = [],
}: CostViewProps): React.JSX.Element {
  const [costItems, setCostItems] = useState<Kitchen.CostItem[]>(
    initCostItems.map((c) => ({ ...c, created: dayjs(c.created), modified: dayjs(c.modified) })),
  )
  const [showCreate, setShowCreate] = useState(false)
  const [toEdit, setToEdit] = useState<Kitchen.CostItem>()
  const [toDelete, setToDelete] = useState<Kitchen.CostItem[]>()
  const { type, item, items, open } = useMemo(() => {
    let type = DIALOG_TYPES.CREATE
    let item: Kitchen.CostItem | undefined
    let items: Kitchen.CostItem[] | undefined

    if (toEdit) {
      type = DIALOG_TYPES.EDIT
      item = toEdit
    }
    if (toDelete) {
      type = DIALOG_TYPES.DELETE
      items = toDelete
    }

    return { type, items, item, open: showCreate || !!toEdit || !!toDelete }
  }, [toEdit, toDelete, showCreate])
  function handleCreateClick(): void {
    setShowCreate(true)
  }
  function handleEditClick(item: Kitchen.CostItem): void {
    setToEdit(item)
  }
  function handleDeleteClick(items: Kitchen.CostItem[]): void {
    setToDelete(items)
  }

  function handleCreated(newItem: Kitchen.CostItem): void {
    setCostItems((prev) => [...prev, newItem])
  }
  function handleDeleted(deletedItems: Kitchen.CostItem[]): void {
    const ids = deletedItems.map((i) => i.id)
    setCostItems(costItems.filter((item) => !ids.includes(item.id)))
  }
  function handleEdited(editedItem: Kitchen.CostItem): void {
    setCostItems(costItems.map((item) => (item.id === editedItem.id ? editedItem : item)))
  }
  function handleClose(): void {
    setShowCreate(false)
    setToDelete(undefined)
    setToEdit(undefined)
  }

  return (
    <Fragment>
      <CostList
        title='Costs'
        costItems={costItems}
        onCreate={handleCreateClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
      <KitchenCostDialog
        open={open}
        item={item}
        items={items}
        type={type}
        onCreated={handleCreated}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
        onClose={handleClose}
      />
    </Fragment>
  )
}
