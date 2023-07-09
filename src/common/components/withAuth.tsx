import { NoSsr } from '@mui/material'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import Loading from 'src/common/components/layout/Loading'
import { AuthenticationStore } from 'src/common/store'
import { Role } from 'src/modules/login/store'

export default function withAuth(
  Children: React.ComponentType<any>,
  role = Role.User
): React.ComponentType {
  interface IAuthenticatedComponentProps {
    authenticationStore: AuthenticationStore
  }

  const AuthenticatedComponent = inject('authenticationStore')(
    observer(
      class AuthenticatedComponent extends React.Component<IAuthenticatedComponentProps> {
        private readonly _authenticationStore: AuthenticationStore

        constructor(props: Readonly<IAuthenticatedComponentProps>) {
          super(props)

          this._authenticationStore = props.authenticationStore

          if (typeof window !== 'undefined') {
            this._authenticationStore.checkTokenAccess()
          }
        }

        public componentDidMount() {
          const { authenticated, authenticationInProgress } = this._authenticationStore

          if (!authenticationInProgress && !authenticated) {
            this._authenticationStore.setRedirectUrl(Router.asPath)
            Router.push('/login')
          } else if (!authenticationInProgress && !this._authenticationStore.hasRole(role)) {
            Router.push('/')
          }
        }

        public componentDidUpdate() {
          const { authenticated, authenticationInProgress } = this._authenticationStore

          if (!authenticationInProgress && !authenticated) {
            this._authenticationStore.setRedirectUrl(Router.asPath)
            Router.push('/login')
          } else if (!authenticationInProgress && !this._authenticationStore.hasRole(role)) {
            Router.push('/')
          }
        }

        public render() {
          const { authenticated, authenticationInProgress } = this._authenticationStore

          if (authenticationInProgress) {
            return (
              <NoSsr>
                <Loading size={40} message="Authenticating... Please Wait" />
              </NoSsr>
            )
          }

          if (authenticated && this._authenticationStore.hasRole(role)) {
            return (
              <NoSsr>
                <Children {...this.props} />
              </NoSsr>
            )
          }

          return <></>
        }
      }
    )
  )

  return AuthenticatedComponent
}
