'use client'

import { useState } from 'react'

import { LoadingButton } from '@mui/lab'
import { Alert, Box, Paper, Stack, TextField, Typography } from '@mui/material'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginView(): React.JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  })
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target
    setFormValues({ ...formValues, [name]: value })
  }

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const res = await signIn('credentials', {
        redirect: false,
        username: formValues.username,
        password: formValues.password,
        callbackUrl,
      })

      if (!res?.error) {
        router.push(callbackUrl)
      } else {
        throw new Error('Invalid Username or Password')
      }
    } catch (error) {
      setError(error as Error)
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        backgroundColor: (theme) => theme.vars.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          position: {
            xs: 'absolute',
            md: 'block',
          },
          top: { xs: 8, md: 'unset' },
          bottom: { xs: 8, md: 'unset' },
          left: { xs: 8, md: 'unset' },
          right: { xs: 8, md: 'unset' },
          p: 2,
          maxWidth: { xs: 'unset', lg: 800 },
          display: 'flex',
          gap: 2,
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
        elevation={8}
      >
        <Box
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },
          }}
        >
          <Image
            alt='login banner'
            src='/images/SAL_Brand_Logo.png'
            width={200}
            height={221}
            priority
          />
        </Box>
        <Box component='form' onSubmit={onSubmit} sx={{ flexGrow: 1 }}>
          <Typography variant='h3' align='center' gutterBottom>
            SAL 91 Login
          </Typography>
          <Box
            sx={{
              display: {
                xs: 'flex',
                md: 'none',
              },
              justifyContent: 'center',
              mb: 8,
            }}
          >
            <Image
              alt='login banner'
              src='/images/SAL_Brand_Logo.png'
              width={200}
              height={221}
              priority
            />
          </Box>
          <Stack spacing={2}>
            {!!error && <Alert severity='error'>{error.message}</Alert>}
            <TextField
              required
              type='text'
              name='username'
              error={!!error}
              disabled={loading}
              value={formValues.username}
              onChange={handleChange}
              label='User Name'
              fullWidth
            />
            <TextField
              required
              type='password'
              name='password'
              error={!!error}
              disabled={loading}
              value={formValues.password}
              onChange={handleChange}
              label='Password'
              fullWidth
            />
            <LoadingButton
              type='submit'
              loading={loading}
              variant='outlined'
              disabled={!formValues.password || !formValues.username}
            >
              Login
            </LoadingButton>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
