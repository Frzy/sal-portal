import { Alert, AlertTitle, Paper, Typography } from '@mui/material'

import { getMenuItems } from '@/lib/menuItems'
import { getServerAuthSession } from '@/util/auth'
import MenuItemsView from '@/views/MenuItems'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user.isAdmin)
    return (
      <Paper>
        <Alert severity='error'>
          <AlertTitle>Unauthorized</AlertTitle>
          <Typography>
            You do not have the access to view this page. If this is a mistake please contact the
            site administrator.
          </Typography>
        </Alert>
      </Paper>
    )

  const menuItems = await getMenuItems()

  return <MenuItemsView menuItems={menuItems} />
}
