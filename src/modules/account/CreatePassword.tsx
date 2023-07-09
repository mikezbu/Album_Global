import { Alert, AlertTitle, Box, Button, Divider, Grid, TextField, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import { WithRouterProps } from 'next/dist/client/with-router'
import Router from 'next/router'
import { withRouter } from 'next/router'
import React from 'react'

import Loading from 'src/common/components/layout/Loading'
import { UserStore } from 'src/common/store'

export interface ICreatePasswordProps extends WithRouterProps {
  userStore?: UserStore
}

const CreatePassword = inject('userStore')(
  observer(
    class CreatePassword extends React.Component<ICreatePasswordProps> {
      private readonly _userStore: UserStore

      constructor(props: Readonly<ICreatePasswordProps>) {
        super(props)

        this._userStore = props.userStore

        if (this.props.router) {
          const { router } = this.props

          this._userStore.setPasswordCreateToken(router.query.token as string)
        }
      }

      public render() {
        if (this._userStore.passwordCreateSuccess) {
          Router.push('/login')
        }

        return (
          <div className="relative w-full max-w-lg">
            {this._userStore.updating && <Loading position="absolute" size={40} />}
            <Typography variant="h4" align="center" gutterBottom className="font-bold">
              Create Password
            </Typography>
            <Divider style={{ marginBottom: '0.5em' }} />
            <Box component="div" marginTop="1em" marginBottom="1em">
              <Alert severity="info" variant="outlined">
                <AlertTitle>Info</AlertTitle>
                Your password must match the following:
                <ul>
                  <li>minimum of 8 characters</li>
                  <li>at least 1 lowercase</li>
                  <li>at least 1 uppercase</li>
                </ul>
              </Alert>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField
                  id="newPassword"
                  fullWidth
                  variant="filled"
                  required
                  type="password"
                  autoComplete="new-password"
                  label="New Password"
                  error={this._userStore.newPasswordError}
                  onChange={this.handlePasswordInputChange('newPassword')}
                  value={this._userStore.newPassword}
                  helperText={this.getPasswordErrorMsg()}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  id="newPasswordConfirmation"
                  fullWidth
                  variant="filled"
                  required
                  type="password"
                  autoComplete="new-password"
                  label="Repeat New Password"
                  error={this._userStore.newPasswordConfirmationError}
                  onChange={this.handlePasswordInputChange('newPasswordConfirmation')}
                  value={this._userStore.newPasswordConfirmation}
                  helperText={this.getPasswordErrorMsg()}
                />
              </Grid>
              <Grid item xs={12} sm={12} className="flex flex-col">
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  color="primary"
                  disabled={!this._userStore.passwordFieldChanged}
                  onClick={this.handleCreatePasswordClick}
                  className="mt-2"
                >
                  Create Password
                </Button>
              </Grid>
            </Grid>

            <Box display="flex" marginTop="2em" justifyContent="center">
              <Button
                aria-label="Sign Up"
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

      private handlePasswordInputChange =
        (property: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
          this._userStore.updatePasswordValue(property, e.target.value)
        }

      private handleCreatePasswordClick = (): void => {
        this._userStore.createPassword()
      }

      private getPasswordErrorMsg = (): string => {
        if (this._userStore.newPasswordError && this._userStore.newPasswordsDoNotMatch) {
          return 'Passwords do not match'
        }

        if (this._userStore.newPasswordError && this._userStore.newPasswordNotLongEnough) {
          return 'Password not long enough'
        }

        return ''
      }

      private handleLoginClick = () => {
        Router.push('/login')
      }
    }
  )
)

export default withRouter(CreatePassword)
