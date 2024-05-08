'use client'

import { Fragment, useMemo, useRef, useState } from 'react'

import { type EnhancedListRef } from '@c/ListComponents/EnhancedList'
import { MenuItemDialog } from '@c/MenuItemDialog'
import MenuItemList from '@c/MenuItemList'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { serverToMenuItem } from '@/lib/menuItems'
import { DIALOG_TYPES } from '@/util/constants'

dayjs.extend(relativeTime)

interface MenuItemsViewProps {
  menuItems: Kitchen.Menu.ServerItem[]
}
export default function MenuItemsView({
  menuItems: intiItems = [],
}: MenuItemsViewProps): React.JSX.Element {
  const [menuItems, setMenuItems] = useState<Kitchen.Menu.Item[]>(intiItems.map(serverToMenuItem))
  const [showCreate, setShowCreate] = useState(false)
  const [toEdit, setToEdit] = useState<Kitchen.Menu.Item>()
  const [toDelete, setToDelete] = useState<Kitchen.Menu.Item[]>()
  const { type, item, items, open } = useMemo(() => {
    let type = DIALOG_TYPES.CREATE
    let item: Kitchen.Menu.Item | undefined
    let items: Kitchen.Menu.Item[] = []

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
  function handleEditClick(item: Kitchen.Menu.Item): void {
    setToEdit(item)
  }
  function handleDeleteClick(items: Kitchen.Menu.Item[]): void {
    setToDelete(items)
  }

  function handleCreated(newItem: Kitchen.Menu.Item): void {
    if (listRef.current) listRef.current.clearSelection()
    setMenuItems((prev) => [...prev, newItem])
  }
  function handleDeleted(deletedItems: Kitchen.Menu.Item[]): void {
    const ids = deletedItems.map((i) => i.id)
    if (listRef.current) listRef.current.clearSelection()
    setMenuItems(menuItems.filter((item) => !ids.includes(item.id)))
  }
  function handleEdited(editedItem: Kitchen.Menu.Item): void {
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
