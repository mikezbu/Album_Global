import { styled } from '@mui/material/styles'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import React from 'react'

import { getStore } from 'src/common/store'
import CheckoutConfirmation from 'src/modules/cart/components/CheckoutConfirmation'
import SignUpForm from 'src/modules/sign-up/component/SignUpForm'

const PREFIX = 'index'

const classes = {
  container: `${PREFIX}-container`,
}

const Root = styled('div')(() => ({
  [`&.${classes.container}`]: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    overflowY: 'scroll',
    WebkitOverflowScrolling: 'touch',
  },
}))

const Index = inject(
  'cartStore',
  'userStore'
)(
  observer(
    class Index extends React.Component {
      public componentDidMount() {
        getStore().appState.hideDrawer()
      }

      public componentWillUnmount() {
        getStore().appState.showDrawer()
      }

      public render() {
        return (
          <div className="flex w-full justify-center pb-28">
            <Head>
              <title key="title">Payment Confirmation</title>
            </Head>
            {getStore().authenticationStore.authenticated ? (
              <CheckoutConfirmation />
            ) : (
              <div className="px-4 py-8 sm:py-24">
                <SignUpForm />
              </div>
            )}
          </div>
        )
      }
    }
  )
)

export default Index
