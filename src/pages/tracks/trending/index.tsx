import Head from 'next/head'
import React from 'react'
import TrendingTracks from 'src/modules/track/components/TrendingTracks'

class Index extends React.Component {
  public render() {
    return (
      <div className="flex flex-col p-8 pt-4 pb-28">
        <Head>
          <title key="title">Trending Tracks</title>
        </Head>
        <TrendingTracks label="Top 100 Trending Tracks" numberOfTrendingTracks={100} />
      </div>
    )
  }
}

export default Index
