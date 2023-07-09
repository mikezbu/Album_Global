import { ThirtyFpsSelect } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { APP_URL } from 'src/ApplicationConfiguration'
import ShareModal from 'src/common/components/ShareModal'

import { AppState, TrendingTracksStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import { Operation } from 'src/common/store/util/SearchCriteria'
import AddToCart from 'src/modules/cart/components/AddToCart'
import { CartItemType } from 'src/modules/cart/store'
import { TrackModel } from 'src/modules/track/store'
import TrackGrid from './TrackGrid'

interface ITrendingTracks {
  trendingTracksStore?: TrendingTracksStore
  appState?: AppState
  numberOfTrendingTracks: number
  label?: string
  artistId?: number
  self?: boolean
}

const TrendingTracks = inject(
  'trendingTracksStore',
  'appState'
)(
  observer(
    class TrendingTracks extends React.Component<ITrendingTracks> {
      public state = {
        openAddToCartModal: false,
        trackToAddToCart: TrackModel,
        openId: 0,
        openShareModal: false,
      }

      private readonly _trendingTracksStore: TrendingTracksStore
      private readonly _appState: AppState

      constructor(props: ITrendingTracks) {
        super(props)

        this._trendingTracksStore = props.trendingTracksStore
        this._appState = props.appState
      }

      public componentDidMount() {
        this._trendingTracksStore.resetPagination()
        this._trendingTracksStore.setSortColumn('playCount')
        this._trendingTracksStore.setSortDirection('desc')
        this._trendingTracksStore.setPageSize(this.props.numberOfTrendingTracks)
        this.fetchTracks()
        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(this.onNext)
        this._appState.setOnPrevious(this.onPrevious)
        this._appState.setIncrementAndUpdatePlayCount(this.incrementAndUpdatePlayCount)
      }

      public componentDidUpdate(previousProps: ITrendingTracks) {
        if (
          (this.props.artistId && previousProps.artistId !== this.props.artistId) ||
          this.props.self !== previousProps.self
        ) {
          this._trendingTracksStore.resetPagination()
          this._trendingTracksStore.setSortColumn('playCount')
          this._trendingTracksStore.setSortDirection('desc')
          this._trendingTracksStore.setPageSize(this.props.numberOfTrendingTracks)
          this.fetchTracks()
          this._appState.setOnPlay(this.onPlay)
          this._appState.setOnPause(this.onPause)
          this._appState.setOnStop(this.onStop)
          this._appState.setOnNext(this.onNext)
          this._appState.setOnPrevious(this.onPrevious)
          this._appState.setIncrementAndUpdatePlayCount(this.incrementAndUpdatePlayCount)
        }
      }

      public render() {
        const { label, self } = this.props

        return (
          <div className="pt-4">
            {label && <div className="pb-4 text-xl font-medium text-primary-light">{label}</div>}
            <TrackGrid
              onTrackSelect={this.onTrackSelect}
              data={this._trendingTracksStore.tracks}
              loading={this._trendingTracksStore.loading}
              rowsPerPage={this._trendingTracksStore.pageSize}
              totalCount={this._trendingTracksStore.totalCount}
              setRowsPerPage={this.setPageSize}
              setPageNumber={this.setPageNumber}
              setSort={this.setSort}
              pageNumber={this._trendingTracksStore.pageNumber}
              sortColumn={this._trendingTracksStore.sortColumn}
              sortDirection={this._trendingTracksStore.sortDirection}
              showPagination={false}
              onPriceClick={this.onPriceClick}
              onOpenShareModal={this.onOpenShareModal}
              playbackControl={this.playbackControl}
              self={self}
            />
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
                  ? this._trendingTracksStore.tracks.get(this.state.openId).id
                  : undefined
              }
              imgUrl={
                this.state.openId > 0
                  ? this._trendingTracksStore.tracks.get(this.state.openId).artworkUrl
                  : ''
              }
              header={
                this.state.openId > 0
                  ? this._trendingTracksStore.tracks.get(this.state.openId).title
                  : ''
              }
              subheader={
                this.state.openId > 0
                  ? this._trendingTracksStore.tracks.get(this.state.openId).artistName
                  : ''
              }
            />
          </div>
        )
      }

      private fetchTracks = () => {
        const filterCriteria = {
          columns: [],
          joins: [],
        }

        filterCriteria.columns.push({
          key: 'artistId',
          operation: Operation.Equals,
          value: this.props.artistId,
        })

        if (this.props.artistId && !this.props.self) {
          this._trendingTracksStore.searchTracks(filterCriteria)
        } else if (this.props.artistId && this.props.self) {
          this._trendingTracksStore.searchTracksPrivate(filterCriteria)
        } else {
          this._trendingTracksStore.searchTracks()
        }
      }

      private onTrackSelect = (id: number) => {
        this.onStop()
        this._trendingTracksStore.selectTrackById(id)

        if (this._trendingTracksStore.selectedTrack) {
          this._appState.setTrack(this._trendingTracksStore.selectedTrack)
          this.onPlay()
        }
      }

      private onPriceClick = (id: number) => {
        this.setState({
          openAddToCartModal: true,
          trackToAddToCart: this._trendingTracksStore.tracks.get(id),
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

      private onNext = () => {
        this._trendingTracksStore.selectNextTrack()
        this._appState.setTrack(this._trendingTracksStore.selectedTrack)
        if (!this._trendingTracksStore.selectedTrack) {
          this.onStop()
        } else {
          this.onPlay()
        }
      }

      private onPrevious = () => {
        this._trendingTracksStore.selectPreviousTrack()
        this._appState.setTrack(this._trendingTracksStore.selectedTrack)
        if (!this._trendingTracksStore.selectedTrack) {
          this.onStop()
        } else {
          this.onPlay()
        }
      }

      private incrementAndUpdatePlayCount = () => {
        this._trendingTracksStore.incrementAndUpdatePlayCount(this._appState.track.id)
      }

      private setPageSize = (pageSize: number) => {
        this._trendingTracksStore.setPageSize(pageSize)
        this.fetchTracks()
      }

      private setPageNumber = (pageNumber: number) => {
        this._trendingTracksStore.setPageNumber(pageNumber)
        this.fetchTracks()
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._trendingTracksStore.setSortDirection(sortDirection)
        this._trendingTracksStore.setSortColumn(sortColumn)
        if (this.props.artistId) {
          const columns = []
          columns.push({
            key: 'artistId',
            operation: Operation.Equals,
            value: this.props.artistId,
          })
          this._trendingTracksStore.searchTracks({ columns })
        } else {
          this._trendingTracksStore.searchTracks({})
        }
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

export default TrendingTracks
