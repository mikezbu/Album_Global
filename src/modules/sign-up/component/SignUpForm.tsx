import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  Divider,
  Fade,
  FadeProps,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React, { ChangeEvent } from 'react'
import moment from 'moment'

import Loading from 'src/common/components/layout/Loading'
import { AppState, AuthenticationStore, SignupStore } from 'src/common/store'
import { ROOT_URL } from 'src/ApplicationConfiguration'

// eslint-disable-next-line react/display-name
const Transition = React.forwardRef<unknown, FadeProps>((props, ref) => {
  return <Fade in timeout={200} ref={ref} {...props} />
})

export interface ISignUpFormProps {
  authenticationStore?: AuthenticationStore
  signupStore?: SignupStore
  appState?: AppState
  modal?: boolean
  formElementsOnly?: boolean
  onCreateCallback?: () => void
}

const SignUpForm = inject(
  'appState',
  'authenticationStore',
  'signupStore'
)(
  observer(
    class SignUpForm extends React.Component<ISignUpFormProps> {
      private readonly _authenticationStore: AuthenticationStore
      private _signupStore: SignupStore
      private _appState: AppState

      constructor(props: Readonly<ISignUpFormProps>) {
        super(props)

        this._authenticationStore = props.authenticationStore
        this._signupStore = props.signupStore
        this._appState = props.appState
      }

      public render() {
        const { error, errorMsg, accountCreated } = this._signupStore

        const success = (
          <div className="w-full max-w-lg">
            {this._authenticationStore.authenticationInProgress && (
              <Loading size={40} message="Logging you in ..." />
            )}
            <Typography variant="h4" align="center" gutterBottom className="font-bold">
              Thank you, {this._signupStore.firstName}
            </Typography>

            <Typography variant="subtitle1" align="center">
              Your account has been successfully created.
            </Typography>
            <Button
              aria-label="Log In"
              variant="contained"
              color="primary"
              onClick={this.handleContinue}
              className="mt-24"
              fullWidth
            >
              Continue
            </Button>
          </div>
        )

        const form = (
          <>
            {this._signupStore.accountCreationInProgress && (
              <Loading size={40} position="absolute" />
            )}
            <div className="py-3 px-3">
              <Grid container spacing={4}>
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{errorMsg}</Alert>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="firstName"
                    fullWidth
                    required
                    type="text"
                    label="First name"
                    autoComplete="given-name"
                    error={this._signupStore.firstNameError}
                    onChange={this.handleInputChange('firstName')}
                    value={this._signupStore.firstName}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="lastName"
                    fullWidth
                    required
                    type="text"
                    label="Last name"
                    autoComplete="family-name"
                    error={this._signupStore.lastNameError}
                    onChange={this.handleInputChange('lastName')}
                    value={this._signupStore.lastName}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={12} lg={12}>
                  <TextField
                    id="email"
                    fullWidth
                    required
                    type="email"
                    label="Email"
                    autoComplete="email"
                    error={this._signupStore.emailError}
                    onChange={this.handleInputChange('email')}
                    value={this._signupStore.email}
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    id="newPassword"
                    fullWidth
                    required
                    type="password"
                    autoComplete="new-password"
                    label="New Password"
                    error={this._signupStore.passwordError}
                    onChange={this.handleInputChange('password')}
                    value={this._signupStore.password}
                    variant="filled"
                    helperText={this.getPasswordErrorMsg()}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="newPasswordConfirmation"
                    fullWidth
                    required
                    type="password"
                    autoComplete="new-password"
                    label="Repeat Password"
                    error={this._signupStore.passwordConfirmationError}
                    onChange={this.handleInputChange('passwordConfirmation')}
                    value={this._signupStore.passwordConfirmation}
                    variant="filled"
                  />
                </Grid>
              </Grid>
              <div className="flex items-center justify-center pt-6">
                <Button variant="contained" color="primary" fullWidth onClick={this.handleCreate}>
                  Create Account
                </Button>
              </div>
              <div className="mt-7 text-center text-sm">
                By an creating account, you agree to the{' '}
                <Link
                  href={`${ROOT_URL}/terms-of-use`}
                  target="_blank"
                  className="no-underline hover:underline"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </>
        )

        let renderComponent = (
          <div className="w-full max-w-lg">
            <div className="mb-5 flex items-center justify-between px-3 text-2xl font-bold sm:text-3xl">
              Create an account <LockIcon fontSize="inherit" className="ml-7" />
            </div>
            <Divider style={{ marginBottom: '0.5em' }} />

            {form}
            <Box display="flex" marginTop="2em" justifyContent="center">
              <Button aria-label="Sign Up" color="primary" size="small" onClick={this.handleLogin}>
                Already have an account?
              </Button>
            </Box>
          </div>
        )

        if (accountCreated) {
          renderComponent = success
        }

        if (this.props.formElementsOnly && !accountCreated) {
          return form
        }

        if (this.props.formElementsOnly && accountCreated) {
          return (
            <>
              {this._authenticationStore.authenticationInProgress && (
                <Loading size={40} position="absolute" message="Logging you in ..." />
              )}
              <Typography variant="h4" align="center" gutterBottom className="font-bold">
                Thank you, {this._signupStore.firstName}
              </Typography>

              <Typography variant="subtitle1" align="center">
                Your account has been successfully created.
              </Typography>
              <Box display="flex" justifyContent="center">
                <Button
                  aria-label="Log In"
                  variant="contained"
                  color="primary"
                  onClick={this.handleContinue}
                  className="mt-24"
                >
                  Continue
                </Button>
              </Box>
            </>
          )
        }

        if (this.props.modal) {
          return (
            <Dialog
              onClose={this.handleFormModalClose}
              aria-labelledby="Sign Up Modal"
              open={this._appState.openSignUpModal}
              TransitionComponent={Transition}
              PaperProps={{
                className: 'w-full p-8 m-2 max-w-lg bg-none',
              }}
            >
              {renderComponent}
            </Dialog>
          )
        }

        return renderComponent
      }

      private handleFormModalClose = () => {
        this._signupStore.reset()
        this._signupStore.resetErrors()
        this._appState.setOpenSignupModal(false)
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._signupStore.setValue(name, e.currentTarget.value)
      }

      private handleCreate = () => {
        if (!this._signupStore.submissionHasErrors()) {
          this._signupStore.setValue('timezone', moment.tz.guess())
          this._signupStore.signup()
        }
      }

      private handleLogin = () => {
        this._signupStore.reset()
        this._signupStore.resetErrors()

        if (this.props.modal) {
          this._appState.setOpenSignupModal(false)
          this._appState.setOpenLoginModal(true)
        } else {
          Router.push('/login')
        }
      }

      private handleContinue = async () => {
        this._authenticationStore.setValue('email', this._signupStore.email)
        this._authenticationStore.setValue('password', this._signupStore.password)

        await this._authenticationStore.login()

        this._signupStore.reset()
        this._signupStore.resetErrors()

        if (this.props.modal) {
          this._appState.setOpenSignupModal(false)
          this._appState.setOpenLoginModal(false)
        } else if (!this.props.formElementsOnly) {
          Router.push(this._authenticationStore.redirectUrl)
        }
      }

      private getPasswordErrorMsg = () => {
        if (this._signupStore.passwordError && this._signupStore.passwordsDoNotMatch) {
          return 'Passwords do not match'
        }

        if (this._signupStore.passwordError && this._signupStore.passwordNotLongEnough) {
          return 'Password not long enough'
        }

        return ''
      }
    }
  )
)

export default SignUpForm
