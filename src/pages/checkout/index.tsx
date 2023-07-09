import { NoSsr } from '@mui/material'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import React from 'react'
import { loadStripe } from '@stripe/stripe-js'

import { Elements, ElementsConsumer } from '@stripe/react-stripe-js'
import Loading from 'src/common/components/layout/Loading'
import { getStore, UserStore } from 'src/common/store'
import { STRIPE_PUBLIC_KEY } from 'src/ApplicationConfiguration'
import Checkout from 'src/modules/cart/components/Checkout'

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY)

export interface IIndexProps {
  userStore?: UserStore
}

const Index = inject('userStore')(
  observer(
    class Index extends React.Component<IIndexProps> {
      public state = {
        stripe: null,
      }

      private readonly _userStore: UserStore

      constructor(props: Readonly<IIndexProps>) {
        super(props)
        this._userStore = props.userStore

        getStore().appState.hideDrawer()
      }

      public componentDidMount() {
        getStore().appState.hideDrawer()
      }

      public componentWillUnmount() {
        getStore().appState.showDrawer()
      }

      public render() {
        return (
          <div className="mb-16 flex w-full justify-center">
            <Head>
              <title key="title">Checkout</title>
            </Head>
            {this._userStore.loading ? (
              <Loading size={40} message="Loading your profile. Please wait" />
            ) : (
              <NoSsr>
                <Elements stripe={stripePromise}>
                  <ElementsConsumer>
                    {({ elements, stripe }) => <Checkout stripe={stripe} elements={elements} />}
                  </ElementsConsumer>
                </Elements>
              </NoSsr>
            )}
          </div>
        )
      }
    }
  )
)

export default Index
