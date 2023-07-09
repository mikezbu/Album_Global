import { Avatar, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'
import ImagePreview from 'src/common/components/image/ImagePreview'
import { generateRandomColor } from 'src/common/styles/SharedStyles'

import { ArtistModel } from 'src/modules/artist/store'

interface IArtistCard {
  artist: ArtistModel
}

export const ArtistCard: React.FunctionComponent<IArtistCard> = observer((props: IArtistCard) => {
  const { artist } = props

  function handleClick(urlAlias: string) {
    Router.push('/artists/[slug]', `/artists/${urlAlias}`)
  }

  return (
    <div
      className="relative flex w-full min-w-[75px] max-w-[200px] cursor-pointer flex-col overflow-hidden rounded-sm bg-background-dark hover:shadow-sm hover:shadow-background-light"
      onClick={() => handleClick(artist.urlAlias)}
    >
      {artist.heroImageUrl ? (
        <div
          className="h-0 bg-cover bg-center bg-no-repeat pt-16/9"
          style={{ backgroundImage: `url(${artist.heroImageUrl})` }}
        />
      ) : (
        <div className="h-0 pt-16/9" style={{ background: generateRandomColor(artist.id) }} />
      )}
      <div className="absolute top-1/4 flex w-full items-center justify-center">
        {artist.profileImageUrl.length > 0 ? (
          <Avatar
            alt={artist.name}
            src={artist.profileImageUrl}
            className="flex h-full max-h-[100px] min-h-[50px] w-full min-w-[50px] max-w-[100px]"
          />
        ) : (
          <Avatar
            alt={artist.name}
            className="relative flex min-h-[75px] min-w-[75px] sm:min-h-[100px] sm:min-w-[100px]"
          >
            <ImagePreview id={artist.id + 1} />
            <div className="absolute">{artist.nameInitial}</div>
          </Avatar>
        )}
      </div>
      <div className="mt-16 pb-6 text-center">
        <Typography variant="h6">{artist.name}</Typography>
        <Typography variant="caption" className="font-normal text-gray-300">
          {artist.location}
        </Typography>
      </div>
    </div>
  )
})

export default ArtistCard
