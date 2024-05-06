import { Alert, AlertTitle, Paper, Typography } from '@mui/material'

import { getCosts, getCostsBy } from '@/lib/costs'
import { getServerAuthSession } from '@/util/auth'
import CostView from '@/views/CostView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user)
    return (
      <Paper>
        <Alert severity='error'>
          <AlertTitle>Unauthorized</AlertTitle>
          <Typography>
            You need to be logged in to view this page. If you don&apos;t have or forgotten your
            credentials please contact the system administrator.
          </Typography>
        </Alert>
      </Paper>
    )

  const isAdmin = session.user.isAdmin
  const costs = isAdmin
    ? await getCosts()
    : await getCostsBy((c) => c.createdBy === session.user.username)

  return <CostView costItems={costs} />
}
