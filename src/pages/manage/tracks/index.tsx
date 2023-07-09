import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import React from 'react'
import Loading from 'src/common/components/layout/Loading'
import withAuth from 'src/common/components/withAuth'
import { UserStore } from 'src/common/store'

import TrackManagement from 'src/modules/track/components/TrackManagement'

interface IManageTrack {
  userStore?: UserStore
}

const ManageTrack = inject('userStore')(
  observer((props: IManageTrack) => {
    return (
      <>
        <Head>
          <title key="title">Manage Tracks</title>
        </Head>
        <div className="relative h-full w-full">
          {props.userStore.user.artistId === 0 ? (
            <Loading position="absolute" />
          ) : (
            <TrackManagement />
          )}
        </div>
      </>
    )
  })
)

export default withAuth(ManageTrack)
