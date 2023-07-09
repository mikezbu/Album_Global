import { Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { TrendingSampleStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import SamplePlayer from 'src/modules/sample/components/SamplePlayer'
import SampleTable, { ISampleColumn } from 'src/modules/sample/components/SampleTable'

interface ITrendingSamplesList {
  trendingSamplesStore?: TrendingSampleStore
  numberOfTrendingSamples: number
  hiddenColumns?: (keyof ISampleColumn)[]
  label: string
  artistId?: number
  hideOnEmpty?: boolean
}

const TrendingSamplesList = inject('trendingSamplesStore')(
  observer(
    class TrendingSamplesList extends React.Component<ITrendingSamplesList> {
      public state = {
        isSamplePlaying: false,
        selectedSample: null,
      }

      private readonly _trendingSamplesStore: TrendingSampleStore

      constructor(props: ITrendingSamplesList) {
        super(props)

        this._trendingSamplesStore = props.trendingSamplesStore
      }

      public componentDidMount() {
        this.fetchSamples()
      }

      public componentDidUpdate(previousProps: ITrendingSamplesList) {
        if (this.props.artistId && previousProps.artistId !== this.props.artistId) {
          this.fetchSamples()
        }
      }

      public render() {
        const { label, hideOnEmpty } = this.props
        if (
          hideOnEmpty &&
          (this._trendingSamplesStore.loading || this._trendingSamplesStore.samples.size === 0)
        ) {
          return <div></div>
        }

        return (
          <>
            <Typography variant="h6" className="pb-6">
              {label}
            </Typography>
            {this._trendingSamplesStore.loading ? (
              <SkeletonLoader count={10} type="table" />
            ) : (
              <SampleTable
                isSamplePlaying={this.state.isSamplePlaying}
                playbackControl={this.playbackControl}
                onSampleSelect={this.onSampleSelect}
                selectedSampleId={this._trendingSamplesStore.selectedSampleId}
                data={this._trendingSamplesStore.samples}
                paging={this._trendingSamplesStore.paging}
                rowsPerPage={this._trendingSamplesStore.pageSize}
                totalCount={this._trendingSamplesStore.totalCount}
                setRowsPerPage={this.setPageSize}
                setPageNumber={this.setPageNumber}
                setSort={this.setSort}
                hiddenColumns={this.props.hiddenColumns}
                pageNumber={this._trendingSamplesStore.pageNumber}
                sortColumn={this._trendingSamplesStore.sortColumn}
                sortDirection={this._trendingSamplesStore.sortDirection}
                showPagination={false}
              />
            )}
            <SamplePlayer
              isSamplePlaying={this.state.isSamplePlaying}
              sample={this.state.selectedSample}
              onEnded={this.onStop}
              onPause={this.onPause}
              onPlay={this.onPlay}
              incrementPlayCount={this.incrementPlayCount}
            />
          </>
        )
      }

      private fetchSamples = () => {
        this._trendingSamplesStore.resetPagination()
        this._trendingSamplesStore.setSortColumn('playCount')
        this._trendingSamplesStore.setSortDirection('desc')
        this._trendingSamplesStore.setPageSize(this.props.numberOfTrendingSamples)

        if (this.props.artistId) {
          this._trendingSamplesStore.fetchSamplesByArtistId(this.props.artistId)
        } else {
          this._trendingSamplesStore.fetchSamples()
        }
      }

      private onSampleSelect = (id: number) => {
        this.onStop()
        this._trendingSamplesStore.selectSampleById(id)

        if (this._trendingSamplesStore.selectedSample) {
          this.setState({ selectedSample: this._trendingSamplesStore.selectedSample })
          this.onPlay()
        }
      }

      private onPlay = () => {
        this.setState({ isSamplePlaying: true })
      }

      private onPause = () => {
        this.setState({ isSamplePlaying: false })
      }

      private onStop = () => {
        this.setState({ isSamplePlaying: false })
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
        this._trendingSamplesStore.setPageSize(pageSize)
        if (this.props.artistId) {
          this._trendingSamplesStore.fetchSamplesByArtistId(this.props.artistId, true)
        } else {
          this._trendingSamplesStore.fetchSamples(true)
        }
      }

      private setPageNumber = (pageNumber: number) => {
        this._trendingSamplesStore.setPageNumber(pageNumber)
        if (this.props.artistId) {
          this._trendingSamplesStore.fetchSamplesByArtistId(this.props.artistId, true)
        } else {
          this._trendingSamplesStore.fetchSamples(true)
        }
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._trendingSamplesStore.setSortDirection(sortDirection)
        this._trendingSamplesStore.setSortColumn(sortColumn)
        if (this.props.artistId) {
          this._trendingSamplesStore.fetchSamplesByArtistId(this.props.artistId, true)
        } else {
          this._trendingSamplesStore.fetchSamples(true)
        }
      }

      private incrementPlayCount = (sampleId: number) => {
        this._trendingSamplesStore.incrementAndUpdatePlayCount(sampleId)
      }
    }
  )
)

export default TrendingSamplesList
