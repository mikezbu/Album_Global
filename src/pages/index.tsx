import { Button } from '@mui/material'
import Head from 'next/head'
import Router from 'next/router'
import React from 'react'

import FeaturedList from 'src/modules/artist/components/FeaturedList'
import GenreExplore from 'src/modules/genre/components/GenreExplore'
import TrendingTracks from 'src/modules/track/components/TrendingTracks'

class Index extends React.Component {
  public render() {
    return (
      <div className="flex w-full flex-col justify-center pb-28">
        <Head>
          <title key="title">Bevios</title>
        </Head>
        <FeaturedList />
        <div className="flex flex-col justify-center px-8 py-2">
          <TrendingTracks label="Trending Tracks" numberOfTrendingTracks={12} />
          <Button
            onClick={() => Router.push('/tracks/trending')}
            color="primary"
            variant="text"
            className="mt-4 mb-4 self-center"
          >
            Explore More
          </Button>

          <GenreExplore />
        </div>
      </div>
    )
  }
}

export default Index
