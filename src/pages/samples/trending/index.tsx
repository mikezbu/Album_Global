import Head from 'next/head'
import React from 'react'

import TrendingSamplesList from 'src/modules/sample/components/TrendingSamplesList'
class Index extends React.Component {
  public render() {
    return (
      <div className="flex flex-col p-8 pt-4">
        <Head>
          <title key="title">Trending Samples</title>
        </Head>
        <TrendingSamplesList label="Top 100 Trending Samples" numberOfTrendingSamples={100} />
      </div>
    )
  }
}

export default Index
