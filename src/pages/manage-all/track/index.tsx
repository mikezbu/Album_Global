import { Divider } from '@mui/material'
import Head from 'next/head'
import React from 'react'

import withAuth from 'src/common/components/withAuth'
import { Role } from 'src/modules/login/store'
import TrackManagement from 'src/modules/track/components/TrackManagement'

const Index = () => (
  <div className="flex w-full flex-col pb-28">
    <Head>
      <title key="title">Manage All Tracks</title>
    </Head>

    <div className="p-6 pb-4 text-xl font-medium text-primary-light sm:p-8">Manage Tracks</div>
    <Divider style={{ marginBottom: '2em' }} />

    <TrackManagement isAdmin />
  </div>
)

export default withAuth(Index, Role.SuperAdmin)
