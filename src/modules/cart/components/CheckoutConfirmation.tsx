import { Box, Button, Divider, Paper, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import { CartStore } from 'src/common/store'

const PREFIX = 'CheckoutConfirmation'

const classes = {
  container: `${PREFIX}-container`,
  cartSummary: `${PREFIX}-cartSummary`,
  linkButton: `${PREFIX}-linkButton`,
}

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.container}`]: {
    width: '100%',
    height: '100%',
    padding: '2em',
    maxWidth: '750px',
  },

  [`& .${classes.cartSummary}`]: {
    padding: '2em',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.linkButton}`]: {
    cursor: 'pointer',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.dark,
    },
  },
}))

export interface ICheckoutConfirmationProps {
  cartStore?: CartStore
}

const CheckoutConfirmation = inject('cartStore')(
  observer(
    class CheckoutConfirmation extends React.Component<ICheckoutConfirmationProps> {
      private readonly _cartStore: CartStore

      constructor(props: Readonly<ICheckoutConfirmationProps>) {
        super(props)

        this._cartStore = props.cartStore
      }

      public componentDidMount() {
        if (!this._cartStore.paymentSuccess) {
          Router.push('/')
        } else {
          this._cartStore.resetAll()
        }
      }

      public componentWillUnmount() {
        this._cartStore.setPaymentSuccess(false)
      }

      public render() {
        return (
          <Root className={classes.container}>
            <Paper className={classes.cartSummary}>
              <Typography component="div" gutterBottom>
                <Box fontWeight="fontWeightMedium">Thanks, {this._cartStore.billingFirstName}!</Box>
              </Typography>
              <Divider style={{ marginBottom: '1em' }} />

              <Typography component="div" gutterBottom>
                <Box fontWeight="fontWeightLight">
                  Your purchase has been successfully completed. A payment confirmation was sent to
                  the email you provided. You can now download the purchased tracks by going to your
                  library
                </Box>
              </Typography>

              <Button
                color="primary"
                style={{ marginTop: '2em' }}
                variant="contained"
                onClick={() => Router.push('/library')}
              >
                Library
              </Button>
            </Paper>
          </Root>
        )
      }
    }
  )
)

export default CheckoutConfirmation
