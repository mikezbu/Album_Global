import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { ExploreSamplesStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import SamplePlayer from 'src/modules/sample/components/SamplePlayer'
import SampleTable from 'src/modules/sample/components/SampleTable'

const PREFIX = 'index'

const classes = {
  container: `${PREFIX}-container`,
  header: `${PREFIX}-header`,
}

const Root = styled('div')(() => ({
  [`&.${classes.container}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: '2em 3em 8em 3em',

    '@media screen and (max-width: 600px)': {
      padding: '1em 1em 4em 1em',
    },
  },

  [`& .${classes.header}`]: {
    marginBottom: '1em',
  },
}))

interface IIndex {
  exploreSamplesStore: ExploreSamplesStore
}

const Index = inject('exploreSamplesStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public state = {
        isSamplePlaying: false,
        selectedSample: null,
      }

      private readonly _exploreSamplesStore: ExploreSamplesStore

      constructor(props: IIndex) {
        super(props)

        this._exploreSamplesStore = props.exploreSamplesStore
        this._exploreSamplesStore.resetPagination()
        this._exploreSamplesStore.fetchSamples()
      }

      public render() {
        return (
          <Root className={classes.container}>
            <Head>
              <title key="title">Samples</title>
            </Head>
            <Typography variant="h6" className={classes.header}>
              Samples
            </Typography>
            {this._exploreSamplesStore.loading ? (
              <SkeletonLoader count={12} type="table" />
            ) : (
              <SampleTable
                isSamplePlaying={this.state.isSamplePlaying}
                playbackControl={this.playbackControl}
                onSampleSelect={this.onSampleSelect}
                selectedSampleId={this._exploreSamplesStore.selectedSampleId}
                data={this._exploreSamplesStore.samples}
                paging={this._exploreSamplesStore.paging}
                rowsPerPage={this._exploreSamplesStore.pageSize}
                totalCount={this._exploreSamplesStore.totalCount}
                setRowsPerPage={this.setPageSize}
                setPageNumber={this.setPageNumber}
                setSort={this.setSort}
                pageNumber={this._exploreSamplesStore.pageNumber}
                sortColumn={this._exploreSamplesStore.sortColumn}
                sortDirection={this._exploreSamplesStore.sortDirection}
                hiddenColumns={['playCount']}
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
          </Root>
        )
      }

      private incrementPlayCount = (sampleId: number) => {
        this._exploreSamplesStore.incrementAndUpdatePlayCount(sampleId)
      }

      private onSampleSelect = (id: number) => {
        this.onStop()
        this._exploreSamplesStore.selectSampleById(id)

        if (this._exploreSamplesStore.selectedSample) {
          this.setState({ selectedSample: this._exploreSamplesStore.selectedSample })
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
        this._exploreSamplesStore.setPageSize(pageSize)
        this._exploreSamplesStore.fetchSamples(true)
      }

      private setPageNumber = (pageNumber: number) => {
        this._exploreSamplesStore.setPageNumber(pageNumber)
        this._exploreSamplesStore.fetchSamples(true)
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._exploreSamplesStore.setSortDirection(sortDirection)
        this._exploreSamplesStore.setSortColumn(sortColumn)
        this._exploreSamplesStore.fetchSamples(true)
      }
    }
  )
)

export default Index
