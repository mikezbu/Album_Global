import { Button, Chip } from '@mui/material'
import { inject, observer } from 'mobx-react'
import { WithRouterProps } from 'next/dist/client/with-router'
import Head from 'next/head'
import { withRouter } from 'next/router'
import Router from 'next/router'
import React from 'react'

import ImagePreview from 'src/common/components/image/ImagePreview'
import ShareModal from 'src/common/components/ShareModal'
import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { AppState, getStore, TrackStore } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import AddToCart from 'src/modules/cart/components/AddToCart'
import { CartItemType } from 'src/modules/cart/store'
import { getTrack } from 'src/modules/track/api'
import CollectionTrackTable from 'src/modules/track/components/CollectionTrackTable'
import { TrackModel } from 'src/modules/track/store'
import { IContext } from 'src/pages/_app'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import TagModel from 'src/modules/tag/store/model/TagModel'
import TrendingTracks from 'src/modules/track/components/TrendingTracks'

const isServer = typeof window === 'undefined'

interface IIndex extends WithRouterProps {
  appState?: AppState
  trackStore: TrackStore
}

const Index = inject(
  'appState',
  'trackStore'
)(
  observer(
    class Index extends React.Component<IIndex> {
      public static async getInitialProps(ctx: IContext) {
        if (ctx.query.trackId) {
          ctx.store.trackStore.setLoading(true)
          await getTrack(ctx.query.trackId, ctx.store.trackStore.fetchTrackCallback)
        }
      }

      public state = {
        isSamplePlaying: false,
        selectedSample: null,
        openAddToCartModal: false,
        trackToAddToCart: TrackModel,
        openShareModal: false,
      }

      private readonly _appState: AppState
      private readonly _trackStore: TrackStore

      constructor(props: IIndex) {
        super(props)

        this._appState = props.appState
        this._trackStore = props.trackStore
      }

      public componentDidMount() {
        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(this.onNext)
        this._appState.setOnPrevious(this.onPrevious)
        this._appState.setIncrementAndUpdatePlayCount(this.incrementAndUpdatePlayCount)
      }

      public render() {
        const { track } = this._trackStore

        return (
          <div className="flex h-full w-full flex-col">
            <Head>
              <title key="title">{track?.title}</title>
              <meta key="og:url" property="og:url" content={`${APP_URL}/tracks/${track?.id}`} />
              <meta key="og:title" property="og:title" content={track?.title} />
              <meta key="og:description" property="og:description" content={track?.artist.name} />
              <meta key="og:type" property="og:type" content="music.song" />
              <meta key="og:image" property="og:image" content={track?.artworkUrl} />
              <meta key="og:audio:secure_url" property="og:audio:secure_url" content={track?.url} />
              <meta key="og:audio:type" property="og:audio:type" content="audio/mp3" />
              <meta key="music:song" property="music:song" content={track?.title} />
              <meta
                key="music:duration"
                property="music:duration"
                content={track?.duration?.toString()}
              />
            </Head>
            {this._trackStore.loading ? (
              <>
                <div className="flex flex-col items-center bg-background-dark p-2 sm:flex-row sm:justify-items-start sm:p-4">
                  <SkeletonLoader count={1} type="track" />
                </div>
                <div className="p-4 pb-8">
                  <SkeletonLoader count={12} type="table" />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col bg-background-dark p-6">
                  <div className="flex flex-col items-center sm:flex-row sm:justify-items-start">
                    <div className="mr-0 flex flex-col items-center sm:mr-4">
                      <ImagePreview
                        id={track?.id}
                        src={track?.artworkUrl}
                        className="h-[200px] w-[200px]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-between p-4 sm:items-start sm:pt-0">
                      <div className="text-lg font-semibold">{track?.title}</div>
                      <div
                        onClick={() => this.onArtistClick(track?.artist.urlAlias)}
                        className="mb-2 cursor-pointer text-base opacity-80 hover:text-primary-main"
                      >
                        {track?.artistName}
                      </div>

                      {track?.instruments?.length > 0 && (
                        <div className="hidden items-center gap-1 pt-1 sm:flex">
                          <div className="mr-2 text-sm">Instruments:</div>
                          {track?.instruments.map((instrument: InstrumentModel) => (
                            <Chip
                              key={instrument.id}
                              label={instrument.name}
                              size="small"
                              className="hover:bg-slate-900/ cursor-pointer bg-slate-700/[.6] text-sm"
                              onClick={() => {
                                Router.push(
                                  '/instrument/[instrumentName]',
                                  `/instrument/${instrument.name}`
                                )
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {track?.genres?.length > 0 && (
                        <div className="hidden items-center gap-1 pt-1 sm:flex">
                          <div className="mr-2 text-sm">Genre:</div>
                          {track?.genres.map((genre: GenreModel) => (
                            <Chip
                              key={genre.id}
                              label={genre.name}
                              size="small"
                              className="hover:bg-slate-900/ cursor-pointer bg-slate-700/[.6] text-sm"
                              onClick={() => {
                                Router.push('/genre/[genreName]', `/genre/${genre.name}`)
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {track?.key && track?.key.name !== '' && (
                        <div className="hidden items-center pt-1 sm:flex">
                          <div className="mr-2 text-sm">Key:</div>
                          <Chip
                            label={track?.key.name}
                            size="small"
                            className="mr-1 bg-slate-700/[.6]  text-sm"
                          />
                        </div>
                      )}

                      <div className="w-full max-w-[150px] pt-4">
                        {getStore().cartStore.cart.tracks.has(track?.id) ? (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            size="small"
                            disabled
                          >
                            In Cart
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={this.onTrackPriceClick}
                          >
                            {track?.price.formattedPrice}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-wrap gap-1 pt-4">
                    {track?.instruments?.length > 0 && (
                      <div className="flex items-center gap-1 pt-1 sm:hidden">
                        <div className="mr-2 text-sm">Instruments:</div>
                        {track?.instruments.map((instrument: InstrumentModel) => (
                          <Chip
                            key={instrument.id}
                            label={instrument.name}
                            size="small"
                            className="hover:bg-slate-900/ cursor-pointer bg-slate-700/[.6] text-sm"
                            onClick={() => {
                              Router.push(
                                '/instrument/[instrumentName]',
                                `/instrument/${instrument.name}`
                              )
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {track?.genres?.length > 0 && (
                      <div className="flex items-center gap-1 pt-1 sm:hidden">
                        <div className="mr-2 text-sm">Genre:</div>
                        {track?.genres.map((genre: GenreModel) => (
                          <Chip
                            key={genre.id}
                            label={genre.name}
                            size="small"
                            className="hover:bg-slate-900/ cursor-pointer bg-slate-700/[.6] text-sm"
                            onClick={() => {
                              Router.push('/genre/[genreName]', `/genre/${genre.name}`)
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {track?.key && track?.key.name !== '' && (
                      <div className="flex items-center gap-1 pt-1 sm:hidden">
                        <div className="mr-2 text-sm">Key:</div>
                        <Chip
                          label={track?.key.name}
                          size="small"
                          className="mr-1 bg-slate-700/[.6] text-sm"
                        />
                      </div>
                    )}

                    {track?.tags?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <div className="mr-2 text-sm">Tags:</div>
                        {track?.tags.map((tag: TagModel) => (
                          <Chip
                            key={tag.id}
                            label={'#' + tag.name}
                            size="small"
                            className="hover:bg-slate-900/ cursor-pointer bg-slate-700/[.6] text-sm"
                            onClick={() => {
                              Router.push('/tag/[tagName]', `/tag/${tag.name}`)
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 pb-8">
                  <CollectionTrackTable
                    isTrackPlaying={this._appState.isTrackPlaying}
                    playbackControl={this.playbackControl}
                    onTrackSelect={this.onTrackSelect}
                    selectedTrackId={this._trackStore.selectedTrackId}
                    data={this._trackStore.getTrackAsAnObserveableMap(this._trackStore.track)}
                    onPriceClick={this.onTrackPriceClick}
                    hiddenColumns={['delete', 'price', 'playCount', 'options', 'status']}
                  />
                </div>
                <div className="my-6 p-6 text-xl font-medium">
                  Explore more tracks by {track.artistName}
                  <TrendingTracks artistId={track.artist.id} numberOfTrendingTracks={4} />
                </div>
                <AddToCart
                  openAddToCartModal={this.state.openAddToCartModal}
                  onClose={this.onCloseAddToCartModal}
                  type={CartItemType.Track}
                  itemToAdd={this.state.trackToAddToCart}
                />
                <ShareModal
                  open={this.state.openShareModal}
                  onClose={this.onShareModalClose}
                  url={!isServer ? window.location.href : ''}
                  id={track?.id}
                  imgUrl={track?.artworkUrl}
                  header={track?.title}
                  subheader={track?.artistName}
                />
              </>
            )}
          </div>
        )
      }

      private incrementAndUpdatePlayCount = () => {
        this._trackStore.incrementAndUpdatePlayCount(this._appState.track?.id)
      }

      private onCloseAddToCartModal = () => {
        this.setState({ openAddToCartModal: false })
      }

      private onArtistClick = (urlArtist: string) => {
        Router.push('/artists/[slug]', `/artists/${urlArtist}`)
      }

      private onTrackSelect = () => {
        this.onStop()
        this._trackStore.setSelectedTrack(this._trackStore.track)

        if (this._trackStore.selectedTrack) {
          this._appState.setTrack(this._trackStore.track)
          this.onPlay()
        }
      }

      private onTrackPriceClick = () => {
        this.setState({
          openAddToCartModal: true,
          trackToAddToCart: this._trackStore.track,
        })
      }

      private onPlay = () => {
        this._appState.setIsTrackPlaying(true)
      }

      private onStop = () => {
        this._appState.setIsTrackPlaying(false)
      }

      private onPause = () => {
        this._appState.setIsTrackPlaying(false)
      }

      private onNext = () => {
        this.onStop()
      }

      private onPrevious = () => {
        this.onStop()
      }

      private playbackControl = (state: number) => {
        if (state === 0) {
          this.onStop()
        }

        if (state === 1) {
          this.onPause()
        }

        if (state === 2) {
          this.onPlay()
        }
      }

      private onOpenShareModal = () => {
        this.setState({ openShareModal: true })
      }

      private onShareModalClose = () => {
        this.setState({ openShareModal: false })
      }
    }
  )
)

export default withRouter(Index)
