import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import React from 'react'

import Loading from 'src/common/components/layout/Loading'
import TabViewContainer from 'src/common/components/tabs/TabViewContainer'
import withAuth from 'src/common/components/withAuth'
import { UserStore } from 'src/common/store'
import GeneralInformation from 'src/modules/account/GeneralInformation'
import PasswordAndSecurity from 'src/modules/account/PasswordAndSecurity'

export interface IIndexProps {
  userStore: UserStore
}

const Index = inject('userStore')(
  observer(
    class Index extends React.Component<IIndexProps> {
      public state = {
        value: 0,
      }

      private readonly _userStore: UserStore

      constructor(props: Readonly<IIndexProps>) {
        super(props)
        this._userStore = props.userStore
        this._userStore.getUserForUpdate()
      }

      public render() {
        if (this._userStore.loading) {
          return <Loading />
        }

        const tabOptions = [
          { id: 0, label: 'General Information', view: <GeneralInformation /> },
          { id: 1, label: 'Password & Security', view: <PasswordAndSecurity /> },
        ]

        return (
          <div className="flex w-full py-2 sm:py-4">
            <Head>
              <title key="title">Account Settings</title>
            </Head>
            <TabViewContainer options={tabOptions} />
          </div>
        )
      }
    }
  )
)

export default withAuth(Index)
