import Head from 'next/head'
import React from 'react'

import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import ForgotPassword from 'src/modules/login/component/ForgotPassword'

export default function ForgotPasswordPage() {
  return (
    <>
      <Head>
        <title>Forgot Password</title>
      </Head>
      <ForgotPassword />
    </>
  )
}
ForgotPasswordPage.Layout = AuthenticationTemplate
