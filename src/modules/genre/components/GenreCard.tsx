import { observer } from 'mobx-react'
import React from 'react'
import Router from 'next/router'

import GenreModel from 'src/modules/genre/store/model/GenreModel'
import ImagePreview from 'src/common/components/image/ImagePreview'

interface IGenreCard {
  genre: GenreModel
}

export const GenreCard: React.FunctionComponent<IGenreCard> = observer((props: IGenreCard) => {
  const onGenreClick = e => {
    Router.push('/genre/[genreName]', `/genre/${encodeURIComponent(props.genre.name)}`)
  }

  return (
    <div
      className="flex h-14 w-full min-w-[100px] max-w-[250px] cursor-pointer items-center overflow-hidden rounded-sm bg-background-dark p-2 hover:shadow-sm hover:shadow-background-light"
      onClick={onGenreClick}
    >
      <ImagePreview id={props.genre.id} src={props.genre.artworkUrl} className="mr-4 h-10 w-10" />
      <div className="text-sm font-semibold text-primary-light">{props.genre.name}</div>
    </div>
  )
})

export default GenreCard
