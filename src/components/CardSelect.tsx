import { useMemo } from 'react'

import {
  FormControl,
  type FormControlProps,
  InputLabel,
  ListItemIcon,
  ListSubheader,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SelectProps,
  Typography,
} from '@mui/material'

import Card from '@/icons/Card'
import { getAllCards } from '@/util/functions'

interface CardSelectProps extends Omit<FormControlProps, 'onChange'> {
  disabledCards?: string[]
  label?: string
  value?: string
  initialValue?: string
  cardSize?: number
  fontSize?: number
  onChange?: (value: string) => void
  selectProps?: Omit<SelectProps, 'onChange'>
}
export default function CardSelect({
  disabledCards = [],
  label = 'Card',
  onChange,
  value,
  initialValue = '',
  cardSize = 32,
  fontSize = 20,
  disabled,
  selectProps,
  ...props
}: CardSelectProps): React.JSX.Element {
  const { clubs, diamonds, hearts, spades, jokers } = useMemo(() => {
    const cards = getAllCards()
    const clubs: Card.Item[] = []
    const diamonds: Card.Item[] = []
    const hearts: Card.Item[] = []
    const spades: Card.Item[] = []
    const jokers: Card.Item[] = []

    cards.forEach((card) => {
      if (card.suit === 'clubs') clubs.push(card)
      if (card.suit === 'diamonds') diamonds.push(card)
      if (card.suit === 'hearts') hearts.push(card)
      if (card.suit === 'spades') spades.push(card)
      if (card.value === 'X') jokers.push(card)
    })

    return {
      clubs,
      diamonds,
      hearts,
      spades,
      jokers,
    }
  }, [])

  function handleChange(event: SelectChangeEvent): void {
    if (onChange) onChange(event.target.value)
  }

  return (
    <FormControl disabled={disabled} {...props}>
      <InputLabel htmlFor='playing-card-select'>{label}</InputLabel>
      <Select
        {...selectProps}
        id='playing-card-select'
        label={label}
        value={value ?? ''}
        // @ts-expect-error Not sure how else to do this
        onChange={handleChange}
        sx={{
          ...selectProps?.sx,
          '& .MuiSelect-select': value ? { display: 'flex', alignItems: 'center', p: '12px' } : {},
        }}
      >
        <MenuItem value=''>
          <em>None</em>
        </MenuItem>
        <ListSubheader>Clubs</ListSubheader>
        {clubs.map((card) => (
          <MenuItem
            key={card.id}
            value={card.id}
            disabled={card.id !== initialValue && disabledCards.includes(card.id)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Card
                suit={card.suit}
                value={card.value}
                sx={{ fontSize: cardSize }}
                disabled={disabled}
              />
            </ListItemIcon>
            <Typography sx={{ fontSize }}>{card.label}</Typography>
          </MenuItem>
        ))}

        <ListSubheader>Diamonds</ListSubheader>
        {diamonds.map((card) => (
          <MenuItem
            key={card.id}
            value={card.id}
            disabled={card.id !== initialValue && disabledCards.includes(card.id)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Card
                suit={card.suit}
                value={card.value}
                sx={{ fontSize: cardSize }}
                disabled={disabled}
              />
            </ListItemIcon>
            <Typography sx={{ fontSize }}>{card.label}</Typography>
          </MenuItem>
        ))}
        <ListSubheader>Hearts</ListSubheader>
        {hearts.map((card) => (
          <MenuItem
            key={card.id}
            value={card.id}
            disabled={card.id !== initialValue && disabledCards.includes(card.id)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Card
                suit={card.suit}
                value={card.value}
                sx={{ fontSize: cardSize }}
                disabled={disabled}
              />
            </ListItemIcon>
            <Typography sx={{ fontSize }}>{card.label}</Typography>
          </MenuItem>
        ))}
        <ListSubheader>Spades</ListSubheader>
        {spades.map((card) => (
          <MenuItem
            key={card.id}
            value={card.id}
            disabled={card.id !== initialValue && disabledCards.includes(card.id)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Card
                suit={card.suit}
                value={card.value}
                sx={{ fontSize: cardSize }}
                disabled={disabled}
              />
            </ListItemIcon>
            <Typography sx={{ fontSize }}>{card.label}</Typography>
          </MenuItem>
        ))}
        <ListSubheader>Jokers</ListSubheader>
        {jokers.map((card) => (
          <MenuItem
            key={card.id}
            value={card.id}
            disabled={card.id !== initialValue && disabledCards.includes(card.id)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Card
                suit={card.suit}
                value={card.value}
                sx={{ fontSize: cardSize }}
                disabled={disabled}
              />
            </ListItemIcon>
            <Typography sx={{ fontSize }}>{card.label}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
