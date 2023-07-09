import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import Loading from 'src/common/components/layout/Loading'
import { GenreStore } from 'src/common/store'
import GenreModel from '../store/model/GenreModel'
import GenreCard from './GenreCard'

interface IGenreExplore {
  genreStore?: GenreStore
}

const GenreExplore: React.FunctionComponent<IGenreExplore> = inject('genreStore')(
  observer((props: IGenreExplore) => {
    useEffect(() => {
      if (!props.genreStore.loaded) {
        props.genreStore.fetchGenres()
      }
    }, [props.genreStore])

    if (props.genreStore.loading) {
      return (
        <div className="relative">
          <Loading position="absolute" />
        </div>
      )
    }
    return (
      <div className="py-4">
        <div className="pb-4 text-xl font-medium text-primary-light">Moods and Genres</div>
        <div className="flex w-full flex-wrap justify-center gap-6 py-4 after:flex-auto sm:justify-start sm:after:content-['']">
          {values(props.genreStore.genres).map((genre: GenreModel) => {
            return <GenreCard key={genre.id} genre={genre} />
          })}
        </div>
      </div>
    )
  })
)

export default GenreExplore
