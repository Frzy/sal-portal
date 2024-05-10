import { useMemo, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import RemoveIcon from '@mui/icons-material/Remove'
import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'

import { formatCurrency } from '@/util/functions'

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

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
  const menuItems = useMemo(() => {
    return menuOrders.map((d) => d.menuItem)
  }, [menuOrders])
  const [selectedItems, setSelectedItems] = useState<Kitchen.Menu.Item[] | null>(null)
  const [hideText, setHideText] = useState(false)

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
      <Autocomplete
        multiple
        options={menuOptions}
        disableCloseOnSelect
        value={selectedItems ?? menuItems}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onClose={() => {
          if (onMenuChange && selectedItems) {
            onMenuChange(selectedItems)
            setSelectedItems(null)
          }
        }}
        onChange={(event, values) => {
          setSelectedItems(values)
        }}
        renderOption={(props, option, { selected }) => {
          return (
            <li {...props} key={option.id}>
              <Checkbox icon={icon} checkedIcon={checkedIcon} sx={{ mr: 1 }} checked={selected} />
              {option.name} • {formatCurrency(option.price)}
            </li>
          )
        }}
        renderTags={(tagValue, getTagProps) => {
          if (hideText) return null

          return `${tagValue.length} Menu Items Selected`
        }}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Menu Items'
            onFocus={() => {
              setHideText(true)
            }}
            onBlur={() => {
              setHideText(false)
            }}
            placeholder={hideText ? 'Search...' : ''}
          />
        )}
      />
      {!!menuOrders.length && (
        <Box sx={{ display: 'flex', px: 2, mt: 2 }}>
          <Typography sx={{ flexGrow: 1, fontSize: 24 }}>Items</Typography>
          <Typography sx={{ minWidth: { xs: 132, sm: 164 }, textAlign: 'center', fontSize: 24 }}>
            Orders
          </Typography>
        </Box>
      )}
      <Divider sx={{ mt: 1 }} />
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
