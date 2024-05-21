'use client'

import { useEffect, useMemo, useState } from 'react'

import { CheckoutDialog } from '@c/CheckoutDialog'
import CheckoutList from '@c/CheckoutList'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'

import { DIALOG_TYPES } from '@/util/constants'
import { serverToCheckoutItem } from '@/util/functions'

interface CheckoutViewProps {
  serverCheckouts: Kitchen.Checkout.ServerItem[]
}
export default function CheckoutViewView({
  serverCheckouts,
}: CheckoutViewProps): React.JSX.Element {
  const [checkouts, setCheckouts] = useState<Kitchen.Checkout.Item[]>(
    serverCheckouts.map(serverToCheckoutItem),
  )
  const router = useRouter()
  const [toEdit, setToEdit] = useState<Kitchen.Checkout.Item>()
  const [toDelete, setToDelete] = useState<Kitchen.Checkout.Item[]>()
  const { type, items, open } = useMemo(() => {
    let type = DIALOG_TYPES.DELETE
    let items: Kitchen.Checkout.Item[] = []

    if (toEdit) {
      type = DIALOG_TYPES.EDIT
      items = [toEdit]
    }

    if (toDelete) {
      type = DIALOG_TYPES.DELETE
      items = toDelete
    }

    return { type, items, open: !!toEdit || !!toDelete }
  }, [toEdit, toDelete])

  function handleDeleteClick(items: Kitchen.Checkout.Item[]): void {
    setToDelete(items)
  }
  function handleEditClick(items: Kitchen.Checkout.Item): void {
    setToEdit(items)
  }

  function handleDeleted(deletedItems: Kitchen.Checkout.Item[]): void {
    const ids = deletedItems.map((i) => i.id)
    setCheckouts(checkouts.filter((item) => !ids.includes(item.id)))
  }
  function handleEdited(editedItem: Kitchen.Checkout.Item): void {
    setCheckouts(checkouts.map((item) => (item.id === editedItem.id ? editedItem : item)))
  }
  function handleClose(): void {
    setToDelete(undefined)
    setToEdit(undefined)
  }

  useEffect(() => {
    router.prefetch('/kitchen/checkout-form')
  }, [router])

  return (
    <Box>
      <CheckoutList
        title='Checkouts'
        checkouts={checkouts}
        onCreate={() => {
          router.push('/kitchen/checkout-form')
        }}
        onDelete={handleDeleteClick}
        onEdit={handleEditClick}
      />
      <CheckoutDialog
        open={open}
        type={type}
        items={items}
        onClose={handleClose}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
      />
    </Box>
  )
}
