import { TablePagination, Typography } from '@mui/material'
import { ObservableMap, values } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'

import { Order } from 'src/common/store/util/Paginator'
import { TrackModel } from 'src/modules/track/store'
import SkeletonLoader from 'src/common/components/SkeletonLoader'
import TrackCard from './TrackCard'
import { AppState } from 'src/common/store'

export interface ITrackColumn {
  id: number
  play: number
  artwork: number
  title: string
  'artist.name': string
  'genres.name': string
  'instruments.name': string
  'key.name': string
  duration: string
  playCount: string
  'price.amount': string
  options: string
}

export enum ActionType {
  Edit = 1,
  PlayPause = 2,
}

interface ITrackGrid {
  appState?: AppState
  onTrackSelect: (id: number) => void
  playbackControl: (state: number) => void
  onOpenShareModal: (id: number) => void
  onPriceClick?: (trackId: number) => void
  data: ObservableMap<number, TrackModel>
  showPagination?: boolean
  hiddenColumns?: (keyof ITrackColumn)[]
  loading: boolean
  self?: boolean
  rowsPerPage: number
  totalCount: number
  pageNumber: number
  sortDirection: Order
  sortColumn: string
  setRowsPerPage: (pageSize: number) => void
  setPageNumber: (pageNumber: number) => void
  setSort: (sortDirection: Order, sortColumn: string) => void
  disableSorting?: boolean
  actionType?: ActionType
}

const TrackGrid: React.FunctionComponent<ITrackGrid> = inject('appState')(
  observer((props: ITrackGrid) => {
    const handleClick = (id: number) => {
      props.onTrackSelect(id)
    }

    const handleChangePage = (_event: unknown, newPage: number) => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      props.setPageNumber(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      props.setRowsPerPage(+event.target.value)
    }

    if (props.loading) {
      return (
        <div className="relative w-full">
          <div className="flex w-full flex-wrap justify-center gap-6 py-4 after:flex-auto sm:justify-start sm:after:content-['']">
            <SkeletonLoader count={props.rowsPerPage} type="card" />
          </div>
        </div>
      )
    }

    if (props.data.size === 0) {
      return (
        <div className="relative w-full">
          <Typography variant="h6" align="center">
            No tracks found
          </Typography>
        </div>
      )
    }

    return (
      <div className="relative w-full">
        <div className="flex w-full flex-wrap justify-center gap-6 py-4 after:flex-auto sm:justify-start sm:after:content-['']">
          {values(props.data).map((track: TrackModel) => (
            <TrackCard
              key={track.id}
              track={track}
              actionType={ActionType.PlayPause}
              handleClick={handleClick}
              playbackControl={props.playbackControl}
              onOpenShareModal={props.onOpenShareModal}
              onPriceClick={props.onPriceClick}
              isSelected={track.id === props.appState.track?.id}
              showStatus={props.self}
            />
          ))}
        </div>
        {props.showPagination && (
          <TablePagination
            rowsPerPageOptions={[24, 48, 96]}
            component="div"
            count={props.totalCount}
            rowsPerPage={props.rowsPerPage}
            page={props.pageNumber}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            labelRowsPerPage="Tracks Per Page"
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </div>
    )
  })
)

TrackGrid.defaultProps = {
  showPagination: true,
  disableSorting: false,
  actionType: ActionType.PlayPause,
}

export default TrackGrid
