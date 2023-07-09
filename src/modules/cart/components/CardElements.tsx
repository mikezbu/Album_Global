import { Grid } from '@mui/material'
import React, { PureComponent } from 'react'

import {
  StripeCardCVCElement,
  StripeCardExpiryElement,
  StripeCardNumberElement,
} from 'src/modules/cart/components/StripeElements'

export interface ICardElements {
  setFormComplete: any
  stripe: any
}

class CardElements extends PureComponent<ICardElements> {
  public state = {
    creditCardNumberComplete: false,
    expirationDateComplete: false,
    cvcComplete: false,
    cardNumberError: false,
    expiredError: false,
    cvcError: false,
  }

  onElementChange =
    (field: string, errorField: string) =>
    ({ complete, error = { message: null } }) => {
      this.setState({ [field]: complete, [errorField]: error.message })
      const expectedState = { ...this.state }
      expectedState[field] = complete
      this.props.setFormComplete(
        expectedState.creditCardNumberComplete &&
          expectedState.cvcComplete &&
          expectedState.expirationDateComplete
      )
    }

  render() {
    const { cardNumberError, expiredError, cvcError } = this.state

    return (
      <Grid container spacing={2} style={{ marginBottom: '1em' }}>
        <Grid item xs={12} sm={12}>
          <StripeCardNumberElement
            error={Boolean(cardNumberError)}
            labelErrorMessage={cardNumberError}
            onChange={this.onElementChange('creditCardNumberComplete', 'cardNumberError')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StripeCardExpiryElement
            error={Boolean(cvcError)}
            labelErrorMessage={cvcError}
            onChange={this.onElementChange('cvcComplete', 'cvcError')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StripeCardCVCElement
            error={Boolean(expiredError)}
            labelErrorMessage={expiredError}
            onChange={this.onElementChange('expirationDateComplete', 'expiredError')}
          />
        </Grid>
      </Grid>
    )
  }
}

export default CardElements
