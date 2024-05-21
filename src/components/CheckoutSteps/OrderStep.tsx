import { useMemo } from 'react'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Typography,
} from '@mui/material'

import { formatCurrency } from '@/util/functions'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}
interface OrderStepProps {
  menuOptions?: Kitchen.Menu.Item[]
  menuOrders?: Kitchen.Checkout.Order[]
  rememberMenu?: boolean
  onMenuChange?: (items: Kitchen.Menu.Item[]) => void
  onOrderChange?: (details: Kitchen.Checkout.Order[]) => void
  onRememberMeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}
export default function OrderStep({
  menuOptions = [],
  menuOrders = [],
  rememberMenu,
  onMenuChange,
  onOrderChange,
  onRememberMeChange,
}: OrderStepProps): React.JSX.Element {
  const selectedItems = useMemo(() => menuOrders.map((o) => o.menuItem.id), [menuOrders])

  function handleChange(event: SelectChangeEvent<string[]>): void {
    const {
      target: { value },
    } = event

    const ids = typeof value === 'string' ? value.split(',') : value
    const items = menuOptions.filter((item) => ids.includes(item.id))

    if (onMenuChange) onMenuChange(items)
  }

  function handleDecreaseQuantity(detailIndex: number): void {
    if (onOrderChange) {
      const newDetails = [...menuOrders]
      newDetails[detailIndex].quantity = Math.max(newDetails[detailIndex].quantity - 1, 0)

      onOrderChange(newDetails)
    }
  }
  function handleIncreaseQuantity(detailIndex: number): void {
    if (onOrderChange) {
      const newDetails = [...menuOrders]
      newDetails[detailIndex].quantity += 1

      onOrderChange(newDetails)
    }
  }

  return (
    <Box>
      <Typography sx={{ pb: 2 }}>
        Please build a list of all items that were sold during the kitchen service.
      </Typography>
      <Typography sx={{ pb: 2 }}>
        Once an items has been added to the list, provide the number of times it was ordered .
      </Typography>
      <FormControl fullWidth>
        <Select
          multiple
          displayEmpty
          value={selectedItems}
          onChange={handleChange}
          input={<OutlinedInput />}
          renderValue={() => 'Pick Orders...'}
          MenuProps={MenuProps}
        >
          <MenuItem disabled value=''>
            <em>Pick Orders...</em>
          </MenuItem>
          {menuOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              <Checkbox checked={selectedItems.includes(option.id)} />
              <ListItemText primary={`${option.name} • ${formatCurrency(option.price)}`} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {!!menuOrders.length && (
        <Box sx={{ display: 'flex', px: 2, mt: 2 }}>
          <Typography sx={{ flexGrow: 1, fontSize: 24 }}>Items</Typography>
          <Typography sx={{ minWidth: { xs: 132, sm: 164 }, textAlign: 'center', fontSize: 24 }}>
            Orders
          </Typography>
        </Box>
      )}
      {!!menuOrders.length && <Divider sx={{ mt: 1 }} />}
      {!!menuOrders.length && (
        <List sx={{ p: 0 }}>
          {menuOrders.map((detail, index) => (
            <ListItem key={detail.menuItem.id}>
              <ListItemText
                primary={`${detail.menuItem.name} • ${formatCurrency(detail.menuItem.price)}`}
                secondary={detail.menuItem.description}
              />
              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 3 }, alignItems: 'center' }}>
                <IconButton
                  disabled={detail.quantity === 0}
                  onClick={() => {
                    handleDecreaseQuantity(index)
                  }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '2rem',
                    minWidth: 36,
                    textAlign: 'center',
                  }}
                >
                  {detail.quantity}
                </Typography>
                <IconButton
                  onClick={() => {
                    handleIncreaseQuantity(index)
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
      {!!menuOrders.length && (
        <FormControlLabel
          control={<Checkbox checked={rememberMenu} onChange={onRememberMeChange} />}
          label='Remember Menu'
        />
      )}
    </Box>
  )
}
