import { useMemo, useRef } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material'

export interface HTMLNumericElement extends Omit<HTMLInputElement, 'value' | 'name'> {
  value: number | null | ''
  name?: string
}

interface ValidatedNumber {
  isNumber: boolean
  numberFormat: number | null
}

function verifyNumber(string: string): ValidatedNumber {
  const numericRepresentation = string.replace(/[,.]/g, '')
  const num = Number(numericRepresentation)
  const notNaN = !isNaN(num)
  return {
    isNumber: notNaN,
    numberFormat: notNaN ? num : null,
  }
}

export type NumberInputProps = Omit<TextFieldProps, 'onChange'> & {
  decimalChar?: string
  onChange?: (e: React.ChangeEvent<HTMLNumericElement>) => void
  precision?: number
  thousandChar?: string
  value?: number | string
}
export default function NumberInput({
  decimalChar = '.',
  name,
  onChange,
  precision = 2,
  thousandChar = ',',
  value,
  inputProps,
  ...props
}: NumberInputProps): React.JSX.Element {
  const defaultValue = value === null ? NaN : Number(value)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }),

    [precision],
  )

  if (!decimalChar) {
    throw new Error('Decimal char should not be an empty string!')
  }
  if (!thousandChar) {
    throw new Error('Thousand char should not be an empty string!')
  }

  function format(number: number): string {
    const result = formatter.format(number).replace(',', thousandChar).replaceAll('.', decimalChar)

    return result
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === ' ') e.preventDefault()

    if (e.ctrlKey || e.shiftKey || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Tab')
      return
    if (!verifyNumber(e.key).isNumber) e.preventDefault()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newEvent: React.ChangeEvent<HTMLNumericElement> = {
      ...e,
      currentTarget: {
        ...e.currentTarget,
        name,
        value: 0,
      },
      target: {
        ...e.target,
        name,
        value: 0,
      },
    }
    let numericRepresentation = e.target.value

    numericRepresentation = numericRepresentation.replaceAll(thousandChar, '')
    numericRepresentation = numericRepresentation.replace(decimalChar, '')

    if (numericRepresentation === '') {
      e.target.value = ''
      newEvent.target.value = null
      newEvent.currentTarget.value = null
      if (onChange) onChange(newEvent)
      return
    }

    const { isNumber, numberFormat } = verifyNumber(numericRepresentation)

    if (isNumber && numberFormat !== null) {
      const withPrecision = numberFormat / 10 ** precision

      const formattedNumber = format(withPrecision)

      newEvent.target.value = withPrecision
      newEvent.currentTarget.value = withPrecision

      e.target.value = formattedNumber

      if (onChange) onChange(newEvent)
    }
  }

  const hasValue = value !== undefined
  let inputDefaultValue
  let inputValue

  if (hasValue) {
    if (isNaN(defaultValue) || value === '') {
      inputValue = null
    } else {
      inputValue = format(defaultValue)
    }
  }

  if (!hasValue && !isNaN(defaultValue)) {
    inputDefaultValue = format(defaultValue)
  }

  return (
    <TextField
      defaultValue={inputDefaultValue}
      name={name}
      inputRef={inputRef}
      {...props}
      InputProps={{
        endAdornment: !!value && (
          <InputAdornment position='end'>
            <IconButton
              onClick={() => {
                if (inputRef.current) {
                  const input = inputRef.current
                  const newValue = '0'
                  const value = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')

                  if (value?.set) {
                    value.set.call(input, newValue)

                    input.dispatchEvent(new Event('input', { bubbles: true }))
                  }
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </InputAdornment>
        ),
        ...props.InputProps,
      }}
      inputProps={{
        ...inputProps,
        inputMode: 'numeric',
      }}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      value={inputValue}
    />
  )
}
