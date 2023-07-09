import { inject, observer } from 'mobx-react'
import { WithRouterProps } from 'next/dist/client/with-router'
import Head from 'next/head'
import { withRouter } from 'next/router'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { AppState, GenreStore, TrackStore } from 'src/common/store'
import { CartItemType } from 'src/modules/cart/store'
import { IContext } from 'src/pages/_app'
import { getGenreByName } from 'src/modules/genre/api'
import AddToCart from 'src/modules/cart/components/AddToCart'
import { TrackModel } from 'src/modules/track/store'
import TrackTable from 'src/modules/track/components/TrackTable'
import { Order } from 'src/common/store/util/Paginator'
import ImagePreview from 'src/common/components/image/ImagePreview'

interface IIndexProps extends WithRouterProps {
  genreStore: GenreStore
  appState: AppState
  trackStore: TrackStore
}

const Index = inject(
  'appState',
  'genreStore',
  'trackStore'
)(
  observer(
    class Index extends React.Component<IIndexProps> {
      public static async getInitialProps(ctx: IContext) {
        if (ctx.query.genreName) {
          await getGenreByName(ctx.query.genreName, ctx.store.genreStore.fetchGenreCallback)
        }
      }

      public state = {
        openAddToCartModal: false,
        itemToAddToCart: TrackModel,
        openShareModal: false,
        type: CartItemType.NA,
      }

      private readonly _genreStore: GenreStore
      private readonly _trackStore: TrackStore
      private readonly _appState: AppState

      constructor(props: IIndexProps) {
        super(props)

        this._genreStore = props.genreStore
        this._appState = props.appState
        this._trackStore = props.trackStore

        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(this.onNext)
        this._appState.setOnPrevious(this.onPrevious)
      }

      public componentDidUpdate() {
        if (
          this.props.router.query.genreName &&
          this.props.router.query.genreName !== '' &&
          this._genreStore.genre &&
          this._genreStore.genre.name !== '' &&
          (this.props.router.query.genreName as string) !== this._genreStore.genre.name
        ) {
          this._trackStore.resetPagination()
          this._trackStore.fetchTracksByGenreId(this._genreStore.genre.id)
        }
      }

      public componentDidMount(): void {
        this._trackStore.resetPagination()
        this._trackStore.fetchTracksByGenreId(this._genreStore.genre.id)
      }

      public render() {
        const { genre } = this._genreStore

        return (
          <div className="flex w-full flex-col pb-28">
            {this._genreStore.genre.name && (
              <Head>
                <title key="title">#{this._genreStore.genre.name}</title>
              </Head>
            )}
            {this._genreStore.loading ? (
              <>
                <div className="flex bg-background-dark px-8 py-4">
                  <SkeletonLoader count={1} type="table" />
                </div>
                <div className="px-6 py-8">
                  <SkeletonLoader count={12} type="table" />
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-4 bg-background-dark p-4">
                  <ImagePreview
                    id={genre.id}
                    src={genre.artworkUrl}
                    className="h-[100px] w-[100px]"
                  />
                  <div className="flex flex-col">
                    <div className="text-base font-semibold">{genre.name}</div>
                    <div className="text-sm text-slate-200">{genre.description}</div>
                  </div>
                </div>
                <div className="px-6 py-8">
                  <TrackTable
                    isTrackPlaying={this._appState.isTrackPlaying}
                    playbackControl={this.playbackControl}
                    onTrackSelect={this.onTrackSelect}
                    selectedTrackId={this._trackStore.selectedTrackId}
                    data={this._trackStore.tracks}
                    loading={this._trackStore.loading}
                    rowsPerPage={this._trackStore.pageSize}
                    totalCount={this._trackStore.totalCount}
                    setRowsPerPage={this.setPageSize}
                    setPageNumber={this.setPageNumber}
                    setSort={this.setSort}
                    hiddenColumns={['options', 'playCount']}
                    pageNumber={this._trackStore.pageNumber}
                    sortColumn={this._trackStore.sortColumn}
                    sortDirection={this._trackStore.sortDirection}
                    onPriceClick={this.onTrackPriceClick}
                  />
                </div>
              </>
            )}
            <AddToCart
              openAddToCartModal={this.state.openAddToCartModal}
              onClose={this.onCloseAddToCartModal}
              type={this.state.type}
              itemToAdd={this.state.itemToAddToCart}
            />
          </div>
        )
      }

      private setPageSize = (pageSize: number) => {
        this._trackStore.setPageSize(pageSize)
        if (this._genreStore.genre.id) {
          this._trackStore.fetchTracksByGenreId(this._genreStore.genre.id)
        }
      }

      private setPageNumber = (pageNumber: number) => {
        this._trackStore.setPageNumber(pageNumber)
        if (this._genreStore.genre.id) {
          this._trackStore.fetchTracksByGenreId(this._genreStore.genre.id)
        }
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._trackStore.setSortDirection(sortDirection)
        this._trackStore.setSortColumn(sortColumn)
        if (this._genreStore.genre.id) {
          this._trackStore.fetchTracksByGenreId(this._genreStore.genre.id)
        }
      }

      private onCloseAddToCartModal = () => {
        this.setState({ openAddToCartModal: false })
      }

      private onTrackSelect = (id: number) => {
        this.onStop()
        this._trackStore.selectTrackById(id)

        if (this._trackStore.selectedTrack) {
          this._appState.setTrack(this._trackStore.selectedTrack)
          this.onPlay()
        }
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
        this._trackStore.selectNextTrack()
        this._appState.setTrack(this._trackStore.selectedTrack)
        if (!this._trackStore.selectedTrack) {
          this.onStop()
        } else {
          this.onPlay()
        }
      }

      private onPrevious = () => {
        this._trackStore.selectPreviousTrack()
        this._appState.setTrack(this._trackStore.selectedTrack)
        if (!this._trackStore.selectedTrack) {
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

      private onTrackPriceClick = (id: number) => {
        this.setState({
          openAddToCartModal: true,
          type: CartItemType.Track,
          itemToAddToCart: this._trackStore.tracks.get(id),
        })
      }
    }
  )
)

export default withRouter(Index)
