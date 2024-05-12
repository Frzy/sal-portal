import { Alert, AlertTitle, Paper, Typography } from '@mui/material'

export default function AdminAccessOnly(): React.JSX.Element {
  return (
    <Paper sx={{ p: 1 }}>
      <Alert severity='error'>
        <AlertTitle>Unauthorized</AlertTitle>
        <Typography>
          You do not have the access to view this page. If this is a mistake please contact the site
          administrator.
        </Typography>
      </Alert>
    </Paper>
  )
}
