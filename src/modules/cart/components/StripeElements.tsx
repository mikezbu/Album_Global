import TextField from '@mui/material/TextField'
import React from 'react'
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js'

import StripeInput from 'src/modules/cart/components/StripeInput'

export function StripeCardNumberElement(props) {
  const { labelErrorMessage, error, ...other } = props

  return (
    <TextField
      fullWidth
      variant="filled"
      error={error}
      label="Credit Card Number"
      required
      helperText={error && labelErrorMessage}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        inputProps: {
          component: CardNumberElement,
          placeholder: '',
        },
        inputComponent: StripeInput,
      }}
      {...other}
    />
  )
}

export function StripeCardExpiryElement(props) {
  const { labelErrorMessage, error, ...other } = props

  return (
    <TextField
      fullWidth
      variant="filled"
      error={error}
      label="Expiry Date (MM/YY)"
      required
      helperText={error && labelErrorMessage}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        inputProps: {
          component: CardExpiryElement,
          placeholder: '',
        },
        inputComponent: StripeInput,
      }}
      {...other}
    />
  )
}

export function StripeCardCVCElement(props) {
  const { labelErrorMessage, error, ...other } = props

  return (
    <TextField
      fullWidth
      variant="filled"
      error={error}
      label="CVC"
      required
      helperText={error && labelErrorMessage}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        inputProps: {
          component: CardCvcElement,
        },
        inputComponent: StripeInput,
      }}
      {...other}
    />
  )
}
