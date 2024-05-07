import { Alert, AlertTitle, Paper, Typography } from '@mui/material'

export default function UnauthorizedAlert(): React.JSX.Element {
  return (
    <Paper>
      <Alert severity='error'>
        <AlertTitle>Unauthorized</AlertTitle>
        <Typography>
          You need to be logged in to view this page. If you have not been given or have forgotten
          your credentials please contact the system administrator.
        </Typography>
      </Alert>
    </Paper>
  )
}
