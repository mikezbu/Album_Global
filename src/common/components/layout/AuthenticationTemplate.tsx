import Router from 'next/router'
import React from 'react'
import { PropsWithChildren } from 'react'

import Footer from 'src/common/components/layout/Footer'
import BlankLayout from './BlankLayout'

export type IAuthTemplateProps = PropsWithChildren & {
  hero?: JSX.Element
}

class AuthenticationTemplate extends React.Component<IAuthTemplateProps> {
  public static defaultProps = {
    hero: null,
  }

  public goHome = () => {
    Router.push('/')
  }

  public render() {
    const { children } = this.props

    return (
      <BlankLayout>
        <div className="flex h-screen w-full flex-col overflow-auto">
          <div
            className="h-full max-h-16 w-full cursor-pointer pt-4 pl-4 sm:max-h-20"
            onClick={this.goHome}
          >
            <img src="/logo/dark/logo.png" width="auto" height="100%" alt="logo" />
          </div>
          <div className="flex h-full flex-col items-stretch justify-between">
            <div className="flex justify-center">{children}</div>
            <Footer />
          </div>
        </div>
      </BlankLayout>
    )
  }
}

export default AuthenticationTemplate
