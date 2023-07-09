import Head from 'next/head'
import React from 'react'

import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import LoginForm from 'src/modules/login/component/LoginForm'

export default function Login() {
  return (
    <>
      <Head>
        <title key="title">Login</title>
      </Head>
      <div className="px-4 py-8 sm:py-24">
        <LoginForm />
      </div>
    </>
  )
}
Login.Layout = AuthenticationTemplate
