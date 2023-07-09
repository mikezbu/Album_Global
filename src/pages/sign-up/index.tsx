import Head from 'next/head'
import React from 'react'

import AuthenticationTemplate from 'src/common/components/layout/AuthenticationTemplate'
import SignUpForm from 'src/modules/sign-up/component/SignUpForm'

export default function SignUp() {
  return (
    <>
      <Head>
        <title key="title">Create an account</title>
      </Head>
      <div className="px-4 py-8 sm:py-24">
        <SignUpForm />
      </div>
    </>
  )
}

SignUp.Layout = AuthenticationTemplate
