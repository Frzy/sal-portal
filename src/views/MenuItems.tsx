'use client'

import { Fragment, useMemo, useRef, useState } from 'react'

import { type EnhancedListRef } from '@c/ListComponents/EnhancedList'
import { MenuItemDialog } from '@c/MenuItemDialog'
import MenuItemList from '@c/MenuItemList'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { DIALOG_TYPES } from '@/util/constants'

dayjs.extend(relativeTime)

interface MenuItemsViewProps {
  menuItems: Kitchen.ServerMenuItem[]
}
export default function MenuItemsView({
  menuItems: intiItems = [],
}: MenuItemsViewProps): React.JSX.Element {
  const [menuItems, setMenuItems] = useState<Kitchen.MenuItem[]>(
    intiItems.map((i) => ({
      ...i,
      created: dayjs(i.created),
      modified: dayjs(i.modified),
    })),
  )
  const [showCreate, setShowCreate] = useState(false)
  const [toEdit, setToEdit] = useState<Kitchen.MenuItem>()
  const [toDelete, setToDelete] = useState<Kitchen.MenuItem[]>()
  const { type, item, items, open } = useMemo(() => {
    let type = DIALOG_TYPES.CREATE
    let item: Kitchen.MenuItem | undefined
    let items: Kitchen.MenuItem[] = []

    if (toEdit) {
      type = DIALOG_TYPES.EDIT
      item = toEdit
    }
    if (toDelete) {
      type = DIALOG_TYPES.DELETE
      items = toDelete
    }

    return { type, item, items, open: showCreate || !!toEdit || !!toDelete }
  }, [toEdit, toDelete, showCreate])
  const listRef = useRef<EnhancedListRef>(null)

  function handleCreateClick(): void {
    setShowCreate(true)
  }
  function handleEditClick(item: Kitchen.MenuItem): void {
    setToEdit(item)
  }
  function handleDeleteClick(items: Kitchen.MenuItem[]): void {
    setToDelete(items)
  }

  function handleCreated(newItem: Kitchen.MenuItem): void {
    if (listRef.current) listRef.current.clearSelection()
    setMenuItems((prev) => [...prev, newItem])
  }
  function handleDeleted(deletedItems: Kitchen.MenuItem[]): void {
    const ids = deletedItems.map((i) => i.id)
    if (listRef.current) listRef.current.clearSelection()
    setMenuItems(menuItems.filter((item) => !ids.includes(item.id)))
  }
  function handleEdited(editedItem: Kitchen.MenuItem): void {
    if (listRef.current) listRef.current.clearSelection()
    setMenuItems(menuItems.map((item) => (item.id === editedItem.id ? editedItem : item)))
  }
  function handleClose(): void {
    setShowCreate(false)
    setToDelete(undefined)
    setToEdit(undefined)
  }

  return (
    <Fragment>
      <MenuItemList
        forwardedRef={listRef}
        title='Menu Items'
        menuItems={menuItems}
        onCreate={handleCreateClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
      <MenuItemDialog
        open={open}
        type={type}
        item={item}
        items={items}
        onCreated={handleCreated}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
        onClose={handleClose}
      />
    </Fragment>
  )
}
