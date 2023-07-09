import Head from 'next/head'
import React from 'react'

import ArtistList from 'src/modules/artist/components/ArtistList'

const AristsPage = () => (
  <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
    <Head>
      <title key="title">Artists</title>
    </Head>

    <ArtistList numberOfArtists={100} label="Explore Artists" type="explore" />
  </div>
)

export default AristsPage
