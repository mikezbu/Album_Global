import Head from 'next/head'
import React from 'react'

import withAuth from 'src/common/components/withAuth'
import { Role } from 'src/modules/login/store'
import AdminUserList from 'src/modules/user/components/AdminUserList'

class Index extends React.Component {
  public render() {
    return (
      <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
        <Head>
          <title key="title">Manage Users</title>
        </Head>
        <AdminUserList initialPageSize={24} />
      </div>
    )
  }
}

export default withAuth(Index, Role.SuperAdmin)
