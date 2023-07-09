import {
  Alert,
  Box,
  Button,
  Dialog,
  Divider,
  Fade,
  FadeProps,
  Grid,
  TextField,
  Typography,
} from '@mui/material'

import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React, { ChangeEvent } from 'react'

import Loading from 'src/common/components/layout/Loading'
import { AppState, AuthenticationStore } from 'src/common/store'

// eslint-disable-next-line react/display-name
const Transition = React.forwardRef<unknown, FadeProps>((props, ref) => {
  return <Fade timeout={200} ref={ref} {...props} />
})

export interface ILoginFormProps {
  authenticationStore?: AuthenticationStore
  appState?: AppState
  modal?: boolean
  formElementsOnly?: boolean
}

const LoginForm = inject(
  'appState',
  'authenticationStore'
)(
  observer(
    class LoginForm extends React.Component<ILoginFormProps> {
      private readonly _authenticationStore: AuthenticationStore
      private readonly _appState: AppState

      constructor(props: Readonly<ILoginFormProps>) {
        super(props)

        this._appState = props.appState
        this._authenticationStore = props.authenticationStore
        this._authenticationStore.reset()
      }

      componentDidUpdate() {
        if (
          this._authenticationStore.authenticated &&
          !this.props.modal &&
          !this.props.formElementsOnly
        ) {
          this.handleClose()
          Router.push(this._authenticationStore.redirectUrl)
        }

        if (this._authenticationStore.authenticated && this.props.modal) {
          this.handleClose()
        }
      }

      public render() {
        const { errorMsg, disableLoginButton } = this._authenticationStore

        const form = (
          <>
            {this._authenticationStore.authenticationInProgress && (
              <Loading size={40} position="absolute" />
            )}
            {this._authenticationStore.error && (
              <Box component="div" marginTop="1em">
                <Alert severity="error" variant="outlined">
                  {errorMsg}
                </Alert>
              </Box>
            )}
            <form>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email"
                    autoComplete="email"
                    error={this._authenticationStore.error}
                    onChange={this.handleInputChange('email')}
                    value={this._authenticationStore.email}
                    color="primary"
                    margin="normal"
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type="password"
                    label="Password"
                    autoComplete="current-password"
                    error={this._authenticationStore.error}
                    onChange={this.handleInputChange('password')}
                    value={this._authenticationStore.password}
                    color="primary"
                    margin="normal"
                    variant="filled"
                  />
                </Grid>
              </Grid>
              <div className="mt-6 flex items-center justify-center">
                <Button
                  aria-label="Log In"
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                  className="mt-6"
                  disabled={disableLoginButton}
                  onClick={this.login}
                >
                  Log In
                </Button>
              </div>
            </form>
          </>
        )

        if (this.props.formElementsOnly) {
          return form
        }

        const fullComponent = (
          <div className="w-full max-w-lg">
            <div className="mb-5 flex items-center justify-between px-3 text-2xl font-bold sm:text-3xl">
              Login
            </div>
            <Divider style={{ marginBottom: '0.5em' }} />

            {form}
            <Box display="flex" marginTop="1em">
              <Button
                aria-label="Forgot password"
                color="primary"
                size="small"
                onClick={this.handleForgotPasswordClick}
              >
                Forgot password?
              </Button>
            </Box>
            <Box display="flex" marginTop="2em" justifyContent="center">
              <Button
                aria-label="Sign Up"
                color="primary"
                size="small"
                onClick={this.handleSignupClick}
              >
                Sign Up
              </Button>
            </Box>
          </div>
        )

        if (this.props.modal) {
          return (
            <Dialog
              onClose={this.handleClose}
              aria-labelledby="login-modal"
              open={this._appState.openLoginModal}
              TransitionComponent={Transition}
              PaperProps={{
                className: 'w-full p-8 m-2 max-w-lg bg-none',
              }}
            >
              {fullComponent}
            </Dialog>
          )
        }

        return fullComponent
      }

      private handleClose = () => {
        this._authenticationStore.reset()
        this._appState.setOpenLoginModal(false)
      }

      private handleSignupClick = () => {
        if (this.props.modal) {
          this._appState.setOpenLoginModal(false)
          this._appState.setOpenSignupModal(true)
        } else {
          Router.push('/sign-up')
        }
      }

      private handleForgotPasswordClick = () => {
        this.handleClose()
        Router.push('/forgot-password')
      }

      private login = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        this._authenticationStore.login()
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._authenticationStore.setValue(name, e.target.value)
      }
    }
  )
)

export default LoginForm
