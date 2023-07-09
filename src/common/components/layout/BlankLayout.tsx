import Head from 'next/head'
import React, { PropsWithChildren } from 'react'

import { APP_URL, ROOT_URL } from 'src/ApplicationConfiguration'

class BlankLayout extends React.Component<PropsWithChildren> {
  public render() {
    return (
      <>
        <Head key="head">
          <title key="title">Bevios</title>
          <meta key="og:url" property="og:url" content={APP_URL} />
          <meta key="og:title" property="og:title" content="Bevios" />
          <meta
            key="og:description"
            property="og:description"
            content="The place to look for sound."
          />
          <meta key="og:image" property="og:image" content={`${ROOT_URL}/images/homepage.png`} />
        </Head>
        <div
          id="main-container"
          className="relative flex h-full w-full min-w-[320px] flex-col overflow-auto bg-background-main"
        >
          {this.props.children}
        </div>
      </>
    )
  }
}

export default BlankLayout
