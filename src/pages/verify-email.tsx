import { Button, Divider, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import Head from 'next/head'
import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import Loading from 'src/common/components/layout/Loading'
import { UserStore } from 'src/common/store'

export interface IVerifyEmailProps {
  userStore: UserStore
  token: string
}

const VerifyEmail = inject('userStore')(
  observer(
    class VerifyEmail extends React.Component<IVerifyEmailProps> {
      public static Layout = AuthenticationTemplate
      public static async getInitialProps({ query }) {
        const { token } = query

        return { token }
      }

      constructor(props: Readonly<IVerifyEmailProps>) {
        super(props)
      }

      public componentDidMount() {
        if (this.props.token) {
          this.props.userStore.verifyEmail(this.props.token)
        } else {
          Router.push('/')
        }
      }

      public handleLoginClick = () => {
        Router.push('/login')
      }

      public handleHomeClick = () => {
        Router.push('/')
      }

      public render() {
        const { emailVerified, error, errorMessage } = this.props.userStore

        if (this.props.userStore.updating) {
          return <Loading size={40} />
        }

        return (
          <div className="w-full max-w-lg">
            <Head>
              <title>Verify Email</title>
            </Head>
            {emailVerified && (
              <>
                <Typography variant="h5" align="center" className="mb-6 pt-6 font-bold">
                  Thank you for verifying your email
                </Typography>
                <Divider style={{ marginBottom: '0.5em' }} />
                <div className="flex items-center justify-center">
                  <Button
                    aria-label="Log In"
                    variant="contained"
                    className="mt-6"
                    onClick={this.handleLoginClick}
                  >
                    LOG IN
                  </Button>
                </div>
              </>
            )}
            {error && (
              <>
                <Typography variant="h5" color="primary" align="center" className="pt-6 font-bold">
                  {errorMessage}
                </Typography>
                <Typography
                  aria-label="Log In"
                  variant="subtitle1"
                  gutterBottom
                  align="center"
                  className="pointer mt-6 hover:text-primary-dark"
                  onClick={this.handleHomeClick}
                >
                  Home
                </Typography>
              </>
            )}
          </div>
        )
      }
    }
  )
)

export default VerifyEmail
