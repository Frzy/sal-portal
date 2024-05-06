'use client'

import * as React from 'react'

import {
  Alert,
  AlertTitle,
  Slide,
  type SlideProps,
  Snackbar,
  type SnackbarProps,
} from '@mui/material'

function Transition(props: SlideProps): JSX.Element {
  return <Slide {...props} direction='up' />
}

export default function Notifier({
  autoHideDuration = 3000,
  open: initOpen,
  onClose,
  ...props
}: SnackbarProps): JSX.Element {
  const [notification, setNotification] = React.useState<INotification>()
  const [open, setOpen] = React.useState(false)

  function handleOnClose(): void {
    setOpen(false)
  }

  React.useEffect(() => {
    function handleNotificationEvent(event: CustomEvent<INotification>): void {
      setNotification(event.detail)
      setOpen(true)
    }

    addEventListener('notify', handleNotificationEvent)

    return () => {
      removeEventListener('notify', handleNotificationEvent)
    }
  }, [])

  return (
    <Snackbar
      open={open}
      onClose={handleOnClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      {...props}
      TransitionComponent={Transition}
      TransitionProps={{
        onExited: () => {
          setNotification(undefined)
        },
      }}
    >
      <Alert
        elevation={6}
        severity={notification?.severity}
        onClose={handleOnClose}
        variant='filled'
      >
        {notification?.title && <AlertTitle>{notification.title}</AlertTitle>}
        {notification?.message}
      </Alert>
    </Snackbar>
  )
}
