import Head from 'next/head'
import React from 'react'

import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import CreatePassword from 'src/modules/account/CreatePassword'

export default function CreatePasswordPage() {
  return (
    <>
      <Head>
        <title>Create Password</title>
      </Head>
      <CreatePassword />
    </>
  )
}
CreatePasswordPage.Layout = AuthenticationTemplate
