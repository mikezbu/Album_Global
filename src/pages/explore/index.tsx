import { Button } from '@mui/material'
import Typography from '@mui/material/Typography'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import React from 'react'
import { APP_URL } from 'src/ApplicationConfiguration'
import ShareModal from 'src/common/components/ShareModal'

import { AppState, ExploreTracksStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import AddToCart from 'src/modules/cart/components/AddToCart'
import { CartItemType } from 'src/modules/cart/store'
import TrackFilter from 'src/modules/track/components/TrackFilter'
import TrackGrid from 'src/modules/track/components/TrackGrid'
import { TrackModel } from 'src/modules/track/store'

interface IIndex {
  exploreTracksStore?: ExploreTracksStore
  appState?: AppState
}

const Index = inject(
  'exploreTracksStore',
  'appState'
)(
  observer(
    class Index extends React.Component<IIndex> {
      public state = {
        openAddToCartModal: false,
        trackToAddToCart: TrackModel,
        openId: 0,
        openShareModal: false,
        forceResetFilter: false,
        searchCriteria: {},
      }

      private readonly _exploreTracksStore: ExploreTracksStore
      private readonly _appState: AppState

      constructor(props: IIndex) {
        super(props)

        this._exploreTracksStore = props.exploreTracksStore
        this._appState = props.appState
        this._exploreTracksStore.resetPagination()
        this._exploreTracksStore.setPageSize(24)
        this._exploreTracksStore.searchTracks()
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
        return (
          <div className="flex w-full flex-col pb-28">
            <Head>
              <title key="title">Tracks</title>
            </Head>
            <div className="flex items-start p-6 pb-8 sm:p-8 sm:pb-16 sm:pr-4">
              <div className="flex-1 pr-0 sm:pr-8">
                <div className="pb-4 text-xl font-medium text-primary-light">Explore Tracks</div>
                {!this._exploreTracksStore.loading && this._exploreTracksStore.tracks.size === 0 ? (
                  <div className="flex w-full flex-col items-center justify-center gap-6 py-4">
                    <Typography variant="h6" align="center">
                      No tracks found that match the criteria.
                    </Typography>
                    <Button onClick={() => this.setState({ forceResetFilter: true })}>
                      Reset Filter
                    </Button>
                  </div>
                ) : (
                  <TrackGrid
                    onTrackSelect={this.onTrackSelect}
                    data={this._exploreTracksStore.tracks}
                    loading={this._exploreTracksStore.loading}
                    rowsPerPage={this._exploreTracksStore.pageSize}
                    totalCount={this._exploreTracksStore.totalCount}
                    setRowsPerPage={this.setPageSize}
                    setPageNumber={this.setPageNumber}
                    setSort={this.setSort}
                    pageNumber={this._exploreTracksStore.pageNumber}
                    sortColumn={this._exploreTracksStore.sortColumn}
                    sortDirection={this._exploreTracksStore.sortDirection}
                    showPagination
                    onPriceClick={this.onPriceClick}
                    onOpenShareModal={this.onOpenShareModal}
                    playbackControl={this.playbackControl}
                  />
                )}
              </div>
              <TrackFilter
                onApplyFilter={this.applyFilter}
                onResetFilter={this.resetFilter}
                forceResetFilter={this.state.forceResetFilter}
              />
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
              url={`${APP_URL}/tracks/${this.state.openId}`}
              id={
                this.state.openId > 0
                  ? this._exploreTracksStore.tracks.get(this.state.openId).id
                  : undefined
              }
              imgUrl={
                this.state.openId > 0
                  ? this._exploreTracksStore.tracks.get(this.state.openId).artworkUrl
                  : ''
              }
              header={
                this.state.openId > 0
                  ? this._exploreTracksStore.tracks.get(this.state.openId).title
                  : ''
              }
              subheader={
                this.state.openId > 0
                  ? this._exploreTracksStore.tracks.get(this.state.openId).artistName
                  : ''
              }
            />
          </div>
        )
      }

      private applyFilter = (searchCriteria: any) => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        this.setState({ searchCriteria })
        this._exploreTracksStore.searchTracks(searchCriteria)
      }

      private resetFilter = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        this.setState({ forceResetFilter: false })
        this._exploreTracksStore.setPageNumber(0)
        this._exploreTracksStore.searchTracks(this.state.searchCriteria)
      }

      private onTrackSelect = (id: number) => {
        this.onStop()
        this._exploreTracksStore.selectTrackById(id)

        if (this._exploreTracksStore.selectedTrack) {
          this._appState.setTrack(this._exploreTracksStore.selectedTrack)
          this.onPlay()
        }
      }

      private onPriceClick = (id: number) => {
        this.setState({
          openAddToCartModal: true,
          trackToAddToCart: this._exploreTracksStore.tracks.get(id),
        })
      }

      private onCloseAddToCartModal = () => {
        this.setState({ openAddToCartModal: false })
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
        this._exploreTracksStore.selectNextTrack()
        this._appState.setTrack(this._exploreTracksStore.selectedTrack)
        if (!this._exploreTracksStore.selectedTrack) {
          this.onStop()
        } else {
          this.onPlay()
        }
      }

      private onPrevious = () => {
        this._exploreTracksStore.selectPreviousTrack()
        this._appState.setTrack(this._exploreTracksStore.selectedTrack)
        if (!this._exploreTracksStore.selectedTrack) {
          this.onStop()
        } else {
          this.onPlay()
        }
      }

      private incrementAndUpdatePlayCount = () => {
        this._exploreTracksStore.incrementAndUpdatePlayCount(this._appState.track.id)
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

      private setPageSize = (pageSize: number) => {
        this._exploreTracksStore.setPageSize(pageSize)
        this._exploreTracksStore.searchTracks(this.state.searchCriteria)
      }

      private setPageNumber = (pageNumber: number) => {
        this._exploreTracksStore.setPageNumber(pageNumber)
        this._exploreTracksStore.searchTracks(this.state.searchCriteria)
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._exploreTracksStore.setSortDirection(sortDirection)
        this._exploreTracksStore.setSortColumn(sortColumn)
        this._exploreTracksStore.searchTracks(this.state.searchCriteria)
      }

      private onOpenShareModal = (id: number) => {
        this.setState({
          openId: id,
          openShareModal: true,
        })
      }

      private onShareModalClose = () => {
        this.setState({
          openShareModal: false,
          openId: 0,
        })
      }
    }
  )
)

export default Index
