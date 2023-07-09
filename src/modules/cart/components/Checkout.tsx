import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import LockIcon from '@mui/icons-material/Lock'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React, { ChangeEvent } from 'react'
import { Stripe } from '@stripe/stripe-js'
import Bugsnag from '@bugsnag/js'

import Loading from 'src/common/components/layout/Loading'
import { CartStore, getStore, UserStore } from 'src/common/store'
import CardElements from 'src/modules/cart/components/CardElements'
import { CartItemType } from 'src/modules/cart/store'
import Authentication from 'src/modules/login/component/Authentication'
import SignUpForm from 'src/modules/sign-up/component/SignUpForm'

const PREFIX = 'Checkout'

const classes = {
  container: `${PREFIX}-container`,
  emptyCart: `${PREFIX}-emptyCart`,
  cartSummary: `${PREFIX}-cartSummary`,
  accountPaper: `${PREFIX}-accountPaper`,
  cartDetails: `${PREFIX}-cartDetails`,
  grid: `${PREFIX}-grid`,
  centered: `${PREFIX}-centered`,
  itemHeader: `${PREFIX}-itemHeader`,
  linkButton: `${PREFIX}-linkButton`,
  removeFromCartButton: `${PREFIX}-removeFromCartButton`,
  item: `${PREFIX}-item`,
}

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: '2em',
  maxWidth: '1000px',

  [`& .${classes.emptyCart}`]: {
    maxWidth: '200px',
    height: '100%',
    width: '100%',
  },

  [`& .${classes.cartSummary}`]: {
    padding: '2em',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.accountPaper}`]: {
    position: 'relative',
    padding: '1em',
    backgroundColor: 'grey',
  },

  [`& .${classes.cartDetails}`]: {
    padding: '2em',
    position: 'relative',
    minHeight: '200px',
  },

  [`& .${classes.grid}`]: {
    marginBottom: '1em',
  },

  [`& .${classes.centered}`]: {
    display: 'flex',
    justifyContent: 'center',
  },

  [`& .${classes.itemHeader}`]: {
    display: 'flex',
  },

  [`& .${classes.linkButton}`]: {
    cursor: 'pointer',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.dark,
    },
  },

  [`& .${classes.removeFromCartButton}`]: {
    padding: 0,
    paddingRight: '1em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',

    '&:hover': {
      color: theme.palette.error.main,
    },
  },

  [`& .${classes.item}`]: {
    padding: '1em',
    borderRadius: '0.23em',
    marginBottom: '0.5em',
  },
}))

export interface ICheckoutProps {
  cartStore?: CartStore
  userStore?: UserStore
  elements?: any
  stripe?: Stripe
}

const Checkout = inject(
  'cartStore',
  'userStore'
)(
  observer(
    class Checkout extends React.Component<ICheckoutProps> {
      public state = {
        hasError: false,
        errorMsg: '',
        disabled: true,
        billingFirstNameCompleted: false,
        billingLastNameCompleted: false,
        emailCompleted: false,
        paymentCompleted: false,
        signupRequired: true,
        guestCheckout: false,
        login: false,
        signUp: false,
        firstCheck: true,
      }

      actionForm = undefined

      private readonly _cartStore: CartStore
      private readonly _userStore: UserStore

      constructor(props: Readonly<ICheckoutProps>) {
        super(props)

        this._cartStore = props.cartStore
        this._userStore = props.userStore

        this.actionForm = React.createRef()
      }

      public componentDidMount() {
        // Reload the cart before showing summary
        this._cartStore.reInitializeCart()
      }

      public componentDidUpdate() {
        if (getStore().authenticationStore.authenticated && this.state.firstCheck) {
          this._cartStore.reInitializeCart()
          this._cartStore.setBillingFirstName(this._userStore.user.firstName)
          this._cartStore.setBillingLastName(this._userStore.user.lastName)
          this._cartStore.setEmail(this._userStore.user.email)

          let billingFirstNameCompleted = false
          let billingLastNameCompleted = false
          let emailCompleted = false

          if (this._cartStore.billingFirstName && this._cartStore.billingFirstName.length > 0) {
            billingFirstNameCompleted = true
          }

          if (this._cartStore.billingLastName && this._cartStore.billingLastName.length > 0) {
            billingLastNameCompleted = true
          }

          if (this._cartStore.email && this._cartStore.email.length > 0) {
            emailCompleted = true
          }

          const isFormReady =
            billingFirstNameCompleted &&
            billingLastNameCompleted &&
            emailCompleted &&
            !this._cartStore.paymentRequired

          this.setState({
            billingFirstNameCompleted,
            billingLastNameCompleted,
            emailCompleted,
            firstCheck: false,
            signupRequired: false,
            login: false,
            signUp: false,
            disabled: !isFormReady,
          })
        }

        if (this._cartStore.paymentSuccess) {
          Router.push('/checkout/confirmation')
        }
      }

      public render() {
        if (this._cartStore.loading || this._cartStore.initializingCheckout) {
          return <Loading size={40} />
        }

        if (this._cartStore.cart.totalItemCount === 0) {
          return (
            <Root>
              <Paper className={[classes.cartSummary, 'h-60 justify-around'].join(' ')}>
                <Typography variant="h6" gutterBottom align="center">
                  <Box fontWeight="fontWeightMedium">Your cart is empty</Box>
                </Typography>

                <Button
                  style={{ marginTop: '2em' }}
                  variant="contained"
                  onClick={() => Router.push('/')}
                  color="primary"
                >
                  Home
                </Button>
              </Paper>
            </Root>
          )
        }

        return (
          <Root>
            {this._cartStore.paymentInProgress && (
              <Loading size={40} message="Proccessing your payment. Please wait" />
            )}
            <Grid container spacing={5} direction="column">
              <Grid item xs>
                <Paper className={classes.cartSummary}>
                  <Typography variant="h6" gutterBottom align="center">
                    Cart Summary
                  </Typography>
                  <Divider style={{ marginBottom: '1em' }} />
                  {values(this._cartStore.cart.tracks).map(track => (
                    <Grid container key={track.id} alignItems="center" className={classes.item}>
                      <Grid item xs>
                        <div className={classes.itemHeader}>
                          <div
                            className={classes.removeFromCartButton}
                            onClick={this.handleRemove(track.id, CartItemType.Track)}
                          >
                            <DeleteIcon />
                          </div>
                          <Box component="div" display="flex" flexDirection="column">
                            <Box fontWeight="fontWeightLight">{track.title}</Box>
                            <Box fontWeight="fontWeightLight">{track.artistName}</Box>
                          </Box>
                        </div>
                      </Grid>
                      <Grid item>
                        <Typography component="div" gutterBottom>
                          <Box fontWeight="fontWeightRegular">{track.price.formattedPrice}</Box>
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                  {values(this._cartStore.cart.collections).map(collection => (
                    <Grid
                      container
                      key={collection.id}
                      alignItems="center"
                      className={classes.item}
                    >
                      <Grid item xs>
                        <div className={classes.itemHeader}>
                          <div
                            className={classes.removeFromCartButton}
                            onClick={this.handleRemove(collection.id, CartItemType.Collection)}
                          >
                            <DeleteIcon />
                          </div>
                          <Box component="div" display="flex" flexDirection="column">
                            <Box fontWeight="fontWeightLight">{collection.name}</Box>
                            <Box fontWeight="fontWeightLight" color="primary">
                              {collection.artists[0].name}
                            </Box>
                          </Box>
                        </div>
                      </Grid>
                      <Grid item>
                        <Typography component="div" gutterBottom>
                          <Box fontWeight="fontWeightRegular">
                            {collection.price.formattedPrice}
                          </Box>
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                  <Divider style={{ marginTop: '3em' }} />
                  <Grid container style={{ marginTop: '1em' }}>
                    <Grid item xs>
                      <Typography component="div">
                        <Box fontWeight="fontWeightMedium">Total</Box>
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography component="div">
                        <Box fontWeight="fontWeightBold">{this._cartStore.cart.cartTotal}</Box>
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              {this.state.signupRequired && !getStore().authenticationStore.authenticated && (
                <Grid item xs>
                  <Paper>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      padding="2em"
                      flexDirection="column"
                      width="100%"
                    >
                      <Box component="div" marginBottom="2em" width="100%">
                        <Typography variant="h6" gutterBottom align="center">
                          Checkout
                        </Typography>
                        <Divider />
                      </Box>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={12} md={5}>
                          <Button
                            color="primary"
                            variant="outlined"
                            fullWidth
                            onClick={this.loginClick}
                            style={{ marginBottom: '1em' }}
                          >
                            Login
                          </Button>
                          <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            onClick={this.signUpClick}
                          >
                            Create an account
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={12} md={2}>
                          <Box component="div">
                            <Typography variant="subtitle1" gutterBottom align="center">
                              OR
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={12} md={5}>
                          <Button
                            color="primary"
                            variant="outlined"
                            fullWidth
                            onClick={this.guestCheckoutClick}
                            style={{ marginBottom: '1em' }}
                          >
                            Continue as guest
                          </Button>
                          <Alert severity="info" variant="outlined">
                            You will be able to create an account later
                          </Alert>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
              )}
              <Grid item xs>
                <div ref={this.actionForm}>
                  {this.state.login && !getStore().authenticationStore.authenticated && (
                    <Paper className={classes.cartDetails}>
                      <Authentication />
                    </Paper>
                  )}
                  {this.state.signUp && !getStore().authenticationStore.authenticated && (
                    <Paper className={classes.cartDetails}>
                      <Typography variant="h6" gutterBottom align="center">
                        Create an account
                      </Typography>
                      <Divider style={{ marginBottom: '1em' }} />
                      <SignUpForm modal={false} formElementsOnly />
                    </Paper>
                  )}
                  {(this.state.guestCheckout || getStore().authenticationStore.authenticated) && (
                    <Paper className={classes.cartDetails}>
                      <Typography variant="h6" gutterBottom align="center">
                        Payment Information
                      </Typography>
                      <Divider style={{ marginBottom: '1em' }} />
                      {this.state.hasError && (
                        <Box component="div" marginBottom="1em">
                          <Alert severity="error" variant="outlined">
                            <AlertTitle>Payment Error</AlertTitle>
                            {this.state.errorMsg}
                          </Alert>
                        </Box>
                      )}
                      {this._cartStore.error && (
                        <Box component="div" marginBottom="1em">
                          <Alert severity="error" variant="outlined">
                            <AlertTitle>Error while processing payment</AlertTitle>
                            {this._cartStore.errorMsg}
                          </Alert>
                        </Box>
                      )}
                      {this._cartStore.paymentRequired && (
                        <Box component="div" marginBottom="1em">
                          <Alert
                            icon={<LockIcon fontSize="inherit" />}
                            severity="success"
                            variant="outlined"
                          >
                            Your payment information is sent over securely on an encrypted
                            connection.
                          </Alert>
                        </Box>
                      )}
                      <Grid container spacing={2} className={classes.grid}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id="firstName"
                            fullWidth
                            variant="filled"
                            required
                            type="text"
                            label="First Name"
                            autoComplete="given-name"
                            onChange={this.handleInputChange('billingFirstName')}
                            value={this._cartStore.billingFirstName}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id="lastName"
                            fullWidth
                            variant="filled"
                            required
                            type="text"
                            label="Last Name"
                            autoComplete="family-name"
                            onChange={this.handleInputChange('billingLastName')}
                            value={this._cartStore.billingLastName}
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <TextField
                            id="email"
                            fullWidth
                            variant="filled"
                            required
                            type="email"
                            label="Email"
                            autoComplete="email"
                            onChange={this.handleInputChange('email')}
                            value={this._cartStore.email}
                          />
                        </Grid>
                      </Grid>
                      {this._cartStore.paymentRequired && this._cartStore.paymentLoaded && (
                        <CardElements
                          setFormComplete={this.setPaymentCompleted}
                          stripe={this.props.stripe}
                        />
                      )}

                      {/* <FormControlLabel
                  control={
                    <Checkbox
                      checked={this._cartStore.saveCard}
                      onChange={this.handleSaveCardCheckbox}
                      color="primary"
                    />
                  }
                  label="Save card?"
                /> */}
                      <Button
                        style={{ marginTop: '3em' }}
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={this.checkout}
                        disabled={this.state.disabled}
                      >
                        Complete Purchase
                      </Button>
                    </Paper>
                  )}
                </div>
              </Grid>
            </Grid>
          </Root>
        )
      }

      private isFormReady = (): boolean => {
        return (
          this.state.billingFirstNameCompleted &&
          this.state.billingLastNameCompleted &&
          this.state.emailCompleted &&
          (this.state.paymentCompleted || !this._cartStore.paymentRequired)
        )
      }

      private loginClick = () => {
        this.setState({ login: true, signUp: false, guestCheckout: false, firstCheck: false })

        setTimeout(() => {
          if (this.actionForm.current) {
            this.actionForm.current.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }

      private signUpClick = () => {
        this.setState({ login: false, signUp: true, guestCheckout: false, firstCheck: false })
        setTimeout(() => {
          if (this.actionForm.current) {
            this.actionForm.current.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }

      private guestCheckoutClick = () => {
        this.setState({ guestCheckout: true, login: false, signUp: false })
        setTimeout(() => {
          if (this.actionForm.current) {
            this.actionForm.current.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }

      private setPaymentCompleted = (paymentCompleted: boolean) => {
        this.setState({ paymentCompleted })
        this.setState({ disabled: !this.isFormReady() })
      }

      private handleRemove = (id: number, cartItemType: CartItemType) => () => {
        if (cartItemType === CartItemType.Track) {
          this._cartStore.removeTrack(id)
        } else if (cartItemType === CartItemType.Collection) {
          this._cartStore.removeCollection(id)
        }
      }

      private handleSaveCardCheckbox = (_e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        this._cartStore.toggleSaveCard(checked)
      }

      private handleInputChange = (property: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._cartStore.updateProperty(property, e.target.value)
        this.setState({ [`${property}Completed`]: true, disabled: !this.isFormReady() })
      }

      private checkout = ev => {
        ev.preventDefault()

        if (this._cartStore.paymentRequired) {
          if (this.props.stripe && this.props.elements) {
            this._cartStore.setPaymentInProgress(true)

            this.setState({ disabled: true, hasError: false, errorMsg: '' })
            this.props.stripe
              .confirmCardPayment(this._cartStore.stripeClientSecret, {
                payment_method: {
                  card: this.props.elements.getElement('cardNumber'),
                  billing_details: {
                    name: `${this._cartStore.billingFirstName} ${this._cartStore.billingLastName}`,
                    email: this._cartStore.email,
                  },
                },
              })
              .then(payload => {
                if (payload.error) {
                  this.setState({
                    hasError: true,
                    errorMsg: payload.error.message,
                    disabled: false,
                  })
                  this._cartStore.setPaymentInProgress(false)
                } else {
                  this._cartStore.checkout()
                }
              })
          } else {
            Bugsnag.notify("Attempted to checkout before stripe hasn't loaded yet!")
          }
        } else {
          this._cartStore.setPaymentInProgress(true)
          this._cartStore.checkout()
        }
      }
    }
  )
)

export default Checkout
