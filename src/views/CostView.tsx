'use client'

import { Fragment, useMemo, useState } from 'react'

import CostList from '@c/CostList'
import { KitchenCostDialog } from '@c/KitchenCostDialog'

import { DIALOG_TYPES } from '@/util/constants'
import { serverToCostItem } from '@/util/functions'

interface CostViewProps {
  costItems: Kitchen.Cost.ServerItem[]
}
export default function CostView({
  costItems: initCostItems = [],
}: CostViewProps): React.JSX.Element {
  const [costItems, setCostItems] = useState<Kitchen.Cost.Item[]>(
    initCostItems.map(serverToCostItem),
  )
  const [showCreate, setShowCreate] = useState(false)
  const [toEdit, setToEdit] = useState<Kitchen.Cost.Item>()
  const [toDelete, setToDelete] = useState<Kitchen.Cost.Item[]>()
  const { type, item, items, open } = useMemo(() => {
    let type = DIALOG_TYPES.CREATE
    let item: Kitchen.Cost.Item | undefined
    let items: Kitchen.Cost.Item[] | undefined

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
  function handleEditClick(item: Kitchen.Cost.Item): void {
    setToEdit(item)
  }
  function handleDeleteClick(items: Kitchen.Cost.Item[]): void {
    setToDelete(items)
  }

  function handleCreated(newItem: Kitchen.Cost.Item): void {
    setCostItems((prev) => [...prev, newItem])
  }
  function handleDeleted(deletedItems: Kitchen.Cost.Item[]): void {
    const ids = deletedItems.map((i) => i.id)
    setCostItems(costItems.filter((item) => !ids.includes(item.id)))
  }
  function handleEdited(editedItem: Kitchen.Cost.Item): void {
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
