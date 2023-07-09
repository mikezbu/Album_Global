import { Alert, Box, Button, Divider, Grid, TextField, Typography } from '@mui/material'

import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React, { ChangeEvent } from 'react'

import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import { AuthenticationStore, UserStore } from 'src/common/store'

export interface IForgotPasswordProps {
  authenticationStore?: AuthenticationStore
  userStore?: UserStore
  formElementsOnly?: boolean
}

const ForgotPassword = inject(
  'authenticationStore',
  'userStore'
)(
  observer(
    class ForgotPassword extends React.Component<IForgotPasswordProps> {
      public static Layout = AuthenticationTemplate

      private readonly _authenticationStore: AuthenticationStore
      private readonly _userStore: UserStore

      constructor(props: Readonly<IForgotPasswordProps>) {
        super(props)

        this._authenticationStore = props.authenticationStore
        this._userStore = props.userStore
        this._userStore.reset()
        this._authenticationStore.reset()
      }

      public handleLoginClick = () => {
        Router.push('/login')
      }

      public handleResetPasswordClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        this._authenticationStore.forgotPassword()
      }

      public handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._authenticationStore.setValue(name, e.target.value)
      }

      public render() {
        const { error, errorMessage, passwordResetEmailSent } = this._userStore

        const form = (
          <>
            {error && (
              <Box component="div" marginTop="1em">
                <Alert severity="error">{errorMessage}</Alert>
              </Box>
            )}
            {passwordResetEmailSent && (
              <Box component="div" marginTop="1em">
                <Alert severity="success" variant="outlined">
                  Email sent successfully. Check your email and follow the instructions.
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
                    error={this._authenticationStore.emailError}
                    onChange={this.handleInputChange('email')}
                    value={this._authenticationStore.email}
                    variant="filled"
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                className="mt-6"
                onClick={this.handleResetPasswordClick}
                disabled={passwordResetEmailSent}
              >
                Reset Password
              </Button>
            </form>
          </>
        )

        if (this.props.formElementsOnly) {
          return form
        }

        return (
          <div className="w-full max-w-lg">
            <Typography variant="h4" gutterBottom align="center" className="font-bold">
              Forgot Password
            </Typography>
            <Divider style={{ marginBottom: '0.5em' }} />
            {form}
            <Box display="flex" marginTop="2em" justifyContent="center">
              <Button
                aria-label="Log In"
                color="primary"
                size="small"
                onClick={this.handleLoginClick}
              >
                Log In
              </Button>
            </Box>
          </div>
        )
      }
    }
  )
)

export default ForgotPassword
