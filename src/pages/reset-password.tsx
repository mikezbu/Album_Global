import { Button, Box, Divider, Grid, TextField, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import Router from 'next/router'
import React from 'react'

import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import { AuthenticationStore, UserStore } from 'src/common/store'

export interface IResetPasswordProps {
  authenticationStore: AuthenticationStore
  userStore: UserStore
  token: string
}

const ResetPassword = inject(
  'authenticationStore',
  'userStore'
)(
  observer(
    class ResetPassword extends React.Component<IResetPasswordProps> {
      public static Layout = AuthenticationTemplate
      public static async getInitialProps({ query }) {
        const { token } = query

        return { token }
      }

      private readonly _authenticationStore: AuthenticationStore

      constructor(props: Readonly<IResetPasswordProps>) {
        super(props)

        this._authenticationStore = props.authenticationStore
        this._authenticationStore.reset()

        if (this.props.token) {
          this._authenticationStore.setPasswordResetToken(props.token)
        }
      }

      public handleLoginClick = () => {
        Router.push('/login')
      }

      public handleResetPasswordClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()

        if (!this._authenticationStore.submissionHasErrors()) {
          this._authenticationStore.resetPassword()
        }
      }

      public handleInputChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        this._authenticationStore.setValue(name, e.target.value)
      }

      public getPasswordErrorMsg = () => {
        let errorMsg = ''
        if (
          this._authenticationStore.passwordError &&
          this._authenticationStore.passwordsDoNotMatch
        ) {
          errorMsg = 'Passwords do not match'
        } else if (
          this._authenticationStore.passwordError &&
          this._authenticationStore.passwordNotLongEnough
        ) {
          errorMsg = 'Password not long enough'
        }

        return errorMsg
      }

      public render() {
        const { errorMsg, error } = this._authenticationStore
        const { passwordResetSuccess } = this.props.userStore

        return (
          <div className="w-full max-w-lg">
            <Head>
              <title>Reset your password</title>
            </Head>
            <Typography variant="h4" align="center" gutterBottom className="font-bold">
              Reset Your Password
            </Typography>
            <Divider style={{ marginBottom: '0.5em' }} />
            {error && (
              <Typography variant="subtitle1" align="center" color="error">
                {errorMsg}
              </Typography>
            )}
            {passwordResetSuccess && (
              <Typography variant="subtitle1" align="center">
                Your password has been reset successfully
              </Typography>
            )}
            {passwordResetSuccess || (
              <React.Fragment>
                <Grid container>
                  <Grid item xs={12}>
                    <TextField
                      id="newPassword"
                      fullWidth
                      required
                      type="password"
                      autoComplete="new-password"
                      label="New Password"
                      error={this._authenticationStore.passwordError}
                      onChange={this.handleInputChange('password')}
                      value={this._authenticationStore.password}
                      helperText={this.getPasswordErrorMsg()}
                      variant="filled"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      id="newPasswordConfirmation"
                      fullWidth
                      required
                      type="password"
                      autoComplete="new-password"
                      label="Repeat Password"
                      error={this._authenticationStore.passwordConfirmationError}
                      onChange={this.handleInputChange('passwordConfirmation')}
                      value={this._authenticationStore.passwordConfirmation}
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
                >
                  Reset Password
                </Button>
              </React.Fragment>
            )}
            <Box display="flex" marginTop="2em" justifyContent="center">
              <Button
                aria-label="Sign Up"
                color="primary"
                size="small"
                onClick={this.handleLoginClick}
              >
                Login
              </Button>
            </Box>
          </div>
        )
      }
    }
  )
)

export default ResetPassword
