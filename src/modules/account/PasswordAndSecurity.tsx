import { Alert, AlertTitle, Box, Button, Divider, Grid, TextField, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import Loading from 'src/common/components/layout/Loading'
import withAuth from 'src/common/components/withAuth'
import { UserStore } from 'src/common/store'

const PREFIX = 'PasswordAndSecurity'

const classes = {
  container: `${PREFIX}-container`,
  padding: `${PREFIX}-padding`,
  actionContainer: `${PREFIX}-actionContainer`,
  saveButton: `${PREFIX}-saveButton`,
}

const Root = styled('div')(() => ({
  position: 'relative',
  width: '100%',
  padding: '2em',
  display: 'flex',
  flexDirection: 'column',

  [`& .${classes.padding}`]: {
    padding: '1em 0',
  },

  [`& .${classes.actionContainer}`]: {
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.saveButton}`]: {
    alignSelf: 'flex-end',
    marginTop: '1em',
  },
}))

export interface IPasswordAndSecurityProps {
  userStore?: UserStore
}

const PasswordAndSecurity = inject('userStore')(
  observer(
    class PasswordAndSecurity extends React.Component<IPasswordAndSecurityProps> {
      private readonly _userStore: UserStore

      constructor(props: Readonly<IPasswordAndSecurityProps>) {
        super(props)
        this._userStore = props.userStore
      }

      public render() {
        if (this._userStore.accountDeleted) {
          Router.push('/')
        }

        return (
          <Root className={classes.container}>
            {this._userStore.updating && <Loading position="absolute" size={40} />}
            <Typography variant="h6" gutterBottom>
              Change your password
            </Typography>
            <Divider />
            <Box component="div" marginTop="1em" marginBottom="1em">
              <Alert severity="info" variant="outlined">
                <AlertTitle>Info</AlertTitle>
                Your password must match the following:
                <ul>
                  <li>minimum of 8 characters</li>
                  <li>at least 1 lowercase</li>
                  <li>at least 1 uppercase</li>
                </ul>
                For security reasons, you will receive a verification email if your account password
                is changed.
              </Alert>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField
                  id="currentPassword"
                  fullWidth
                  variant="filled"
                  required
                  type="password"
                  autoComplete="current-password"
                  label="Current Password"
                  error={this._userStore.currentPasswordError}
                  onChange={this.handlePasswordInputChange('currentPassword')}
                  value={this._userStore.currentPassword}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={12} className={classes.actionContainer}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  disabled={!this._userStore.passwordFieldChanged}
                  onClick={this.handleChangePasswordClick}
                  className={classes.saveButton}
                >
                  Change Password
                </Button>
              </Grid>
            </Grid>
          </Root>
        )
      }

      private handlePasswordInputChange =
        (property: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
          this._userStore.updatePasswordValue(property, e.target.value)
        }

      private handleChangePasswordClick = (): void => {
        this._userStore.changePassword()
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
    }
  )
)

export default withAuth(PasswordAndSecurity)
