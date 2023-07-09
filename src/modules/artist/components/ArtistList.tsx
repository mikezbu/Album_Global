import Typography from '@mui/material/Typography'
import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { ExploreArtistsStore, getStore } from 'src/common/store'
import { pageContainer } from 'src/common/styles/SharedStyles'
import ArtistCard from 'src/modules/artist/components/ArtistCard'
import { ArtistModel } from 'src/modules/artist/store'
import ArtistCardAd from './ArtistCardAd'

interface IArtistList {
  exploreArtistsStore?: ExploreArtistsStore
  numberOfArtists: number
  label: string
  type: 'featured' | 'trending' | 'explore'
}

const ArtistList = inject('exploreArtistsStore')(
  observer(
    class ArtistList extends React.Component<IArtistList> {
      public state = {}

      private readonly _exploreArtistsStore: ExploreArtistsStore

      constructor(props: IArtistList) {
        super(props)

        this._exploreArtistsStore = props.exploreArtistsStore
        this._exploreArtistsStore.setPageSize(props.numberOfArtists)
        this._exploreArtistsStore.fetchArtists()
      }

      public render() {
        const { label } = this.props

        const artists = []

        this._exploreArtistsStore.artists.forEach((artist: ArtistModel) => {
          artists.push(<ArtistCard artist={artist} key={artist.id} />)
        })

        return (
          <>
            <div className="pb-4 text-xl font-medium text-primary-light">{label}</div>
            <div className="flex w-full flex-wrap justify-center gap-6 py-4 after:flex-auto sm:justify-start sm:after:content-['']">
              {this._exploreArtistsStore.loading ? (
                <SkeletonLoader count={24} type="artist" />
              ) : (
                <>
                  {artists}
                  {!getStore().authenticationStore.authenticationInProgress &&
                    !getStore().userStore.user.hasArtistProfile && <ArtistCardAd />}
                </>
              )}
            </div>
          </>
        )
      }
    }
  )
)

export default ArtistList
