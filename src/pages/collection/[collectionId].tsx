import { Button, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import { WithRouterProps } from 'next/dist/client/with-router'
import Head from 'next/head'
import { withRouter } from 'next/router'
import Router from 'next/router'
import React from 'react'

import ImagePreview from 'src/common/components/image/ImagePreview'
import ShareModal from 'src/common/components/ShareModal'
import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { AppState, CollectionStore, getStore } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import AddToCart from 'src/modules/cart/components/AddToCart'
import { CartItemType } from 'src/modules/cart/store'
import { getCollection } from 'src/modules/collection/api'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
import CollectionTrackTable from 'src/modules/track/components/CollectionTrackTable'
import { IContext } from 'src/pages/_app'
import TrendingTracks from 'src/modules/track/components/TrendingTracks'

const isServer = typeof window === 'undefined'

interface IIndexProps extends WithRouterProps {
  collectionStore: CollectionStore
  appState: AppState
}

const Index = inject(
  'appState',
  'collectionStore'
)(
  observer(
    class Index extends React.Component<IIndexProps> {
      public static async getInitialProps(ctx: IContext) {
        if (ctx.query.collectionId) {
          await getCollection(
            ctx.query.collectionId,
            ctx.store.collectionStore.fetchCollectionCallback
          )
        }
      }

      public state = {
        openAddToCartModal: false,
        itemToAddToCart: CollectionModel,
        openShareModal: false,
        type: CartItemType.NA,
      }

      private readonly _collectionStore: CollectionStore
      private readonly _appState: AppState

      constructor(props: IIndexProps) {
        super(props)

        this._collectionStore = props.collectionStore
        this._appState = props.appState
      }

      public componentDidMount() {
        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(this.onNext)
        this._appState.setOnPrevious(this.onPrevious)
        this._appState.setIncrementAndUpdatePlayCount(this.incrementAndUpdatePlayCount)
      }

      public componentDidUpdate() {
        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(this.onNext)
        this._appState.setOnPrevious(this.onPrevious)
        this._appState.setIncrementAndUpdatePlayCount(this.incrementAndUpdatePlayCount)
      }

      public render() {
        const { collection } = this._collectionStore

        return (
          <div className="flex w-full flex-col pb-28">
            <Head>
              <title key="title">{collection.name}</title>
              <meta
                key="og:url"
                property="og:url"
                content={`${APP_URL}/collection/${collection.id}`}
              />
              <meta key="og:title" property="og:title" content={collection.name} />
              <meta
                key="og:description"
                property="og:description"
                content={collection.artists[0].name}
              />
              <meta key="og:image" property="og:image" content={collection.albumArtUrl} />
            </Head>
            {this._collectionStore.loading ? (
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
                        id={collection.id}
                        src={collection.albumArtUrl}
                        className="h-[200px] w-[200px]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-between p-4 sm:items-start sm:pt-0">
                      <div className="text-lg font-semibold">{collection.name}</div>

                      {collection.artists.length > 0 && (
                        <div
                          onClick={() => this.onArtistClick(collection.artists[0].urlAlias)}
                          className="mb-2 cursor-pointer text-base opacity-80 hover:text-primary-main"
                        >
                          {collection.artists[0].name}
                        </div>
                      )}
                      {collection.description && (
                        <div className="pb-3 text-sm">{collection.description}</div>
                      )}
                      <div className="pt-2 text-base opacity-80">
                        {collection.tracks.size} Track{collection.tracks.size > 1 ? 's' : ''}
                      </div>
                      <div className="w-full max-w-[150px] pt-3">
                        {getStore().cartStore.cart.tracks.has(collection.id) ? (
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
                            onClick={this.onPriceClick}
                          >
                            {collection.price.formattedPrice}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 pb-8">
                  <CollectionTrackTable
                    isTrackPlaying={this._appState.isTrackPlaying}
                    playbackControl={this.playbackControl}
                    onTrackSelect={this.onTrackSelect}
                    selectedTrackId={this._collectionStore.selectedTrackId}
                    data={this._collectionStore.collection.tracks}
                    onPriceClick={this.onTrackPriceClick}
                    hiddenColumns={['delete', 'options', 'playCount', 'status']}
                  />
                </div>
                {collection.artists && collection.artists.length > 0 && (
                  <div className="my-8 p-6 text-xl font-medium">
                    Explore more tracks by {collection.artists[0].name}
                    <TrendingTracks
                      artistId={collection.artists[0].id}
                      numberOfTrendingTracks={4}
                    />
                  </div>
                )}
                <AddToCart
                  openAddToCartModal={this.state.openAddToCartModal}
                  onClose={this.onCloseAddToCartModal}
                  type={this.state.type}
                  itemToAdd={this.state.itemToAddToCart}
                />
                <ShareModal
                  open={this.state.openShareModal}
                  onClose={this.onShareModalClose}
                  url={!isServer ? window.location.href : ''}
                  id={collection.id}
                  imgUrl={collection.albumArtUrl}
                  header={collection.name}
                  subheader={collection?.artists[0].name}
                />
              </>
            )}
          </div>
        )
      }

      private onTrackSelect = (id: number) => {
        this.onStop()
        this._collectionStore.selectTrackById(id)

        if (this._collectionStore.selectedTrack) {
          this._appState.setTrack(this._collectionStore.selectedTrack)
          this.onPlay()
        }
      }

      private incrementAndUpdatePlayCount = () => {
        this._collectionStore.incrementAndUpdateTrackPlayCount(this._appState.track.id)
      }

      private onPriceClick = () => {
        this.setState({
          openAddToCartModal: true,
          type: CartItemType.Collection,
          itemToAddToCart: this._collectionStore.collection,
        })
      }

      private onTrackPriceClick = (id: number) => {
        this.setState({
          openAddToCartModal: true,
          type: CartItemType.Track,
          itemToAddToCart: this._collectionStore.collection.tracks.get(id),
        })
      }

      private onCloseAddToCartModal = () => {
        this.setState({ openAddToCartModal: false })
      }

      private onArtistClick = (urlArtist: string) => {
        Router.push('/artists/[slug]', `/artists/${urlArtist}`)
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
        this._collectionStore.selectNextTrack()
        this._appState.setTrack(this._collectionStore.selectedTrack)
        if (!this._collectionStore.selectedTrack) {
          this.onStop()
        } else {
          this.onPlay()
        }
      }

      private onPrevious = () => {
        this._collectionStore.selectPreviousTrack()
        this._appState.setTrack(this._collectionStore.selectedTrack)
        if (!this._collectionStore.selectedTrack) {
          this.onStop()
        } else {
          this.onPlay()
        }
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
