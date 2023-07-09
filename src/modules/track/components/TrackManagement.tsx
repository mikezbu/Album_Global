import { inject, observer } from 'mobx-react'
import React from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { IconButton, TextField } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import Uploader from 'src/common/components/Uploader'
import { AppState, TrackStore, UserStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import { Operation } from 'src/common/store/util/SearchCriteria'
import EditableTrackTable from 'src/modules/track/components/EditableTrackTable'
interface ITrackManagement {
  trackStore?: TrackStore
  userStore?: UserStore
  appState?: AppState
  isAdmin?: boolean
}

const TrackManagement = inject(
  'trackStore',
  'userStore',
  'appState'
)(
  observer(
    class TrackManagement extends React.Component<ITrackManagement> {
      public state = {
        searchText: '',
        columns: [],
        joins: [],
      }

      private readonly _trackStore: TrackStore
      private readonly _userStore: UserStore
      private readonly _appState: AppState

      constructor(props: ITrackManagement) {
        super(props)

        this._trackStore = props.trackStore
        this._userStore = props.userStore
        this._appState = props.appState

        if (!this.props.isAdmin) {
          const columns = [
            {
              key: 'artistId',
              operation: Operation.Equals,
              value: this._userStore.user.artistId,
            },
          ]

          this.state = { ...this.state, columns }
        }
      }

      public componentDidMount() {
        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(this.onNext)
        this._appState.setOnPrevious(this.onPrevious)
        this._appState.setIncrementAndUpdatePlayCount(this.incrementAndUpdatePlayCount)
        this._trackStore.resetPagination()
        this._trackStore.setSortColumn('createdDate')
        this._trackStore.setSortDirection('desc')
        this._trackStore.setPageSize(24)
        this._trackStore.setPageNumber(0)

        this.fetchTracks()
      }

      public render() {
        return (
          <div className="flex h-full w-full flex-col px-5 pt-0 pb-8 sm:px-8">
            {!this.props.isAdmin && (
              <div className="flex flex-col py-4">
                <Uploader
                  onUpload={this.uploadAndCreateTrack}
                  acceptedFileTypes=".wav,.mp3"
                  multipleFileUpload
                  fileSizeLimitMB={200}
                  maxNumberOfFiles={15}
                  uploading={this._trackStore.creating}
                />
              </div>
            )}
            {this._trackStore.loading ? (
              <SkeletonLoader count={10} type="table" />
            ) : (
              <>
                <div className="flex w-full items-center pb-4">
                  <TextField
                    fullWidth
                    label="Search"
                    variant="outlined"
                    value={this.state.searchText}
                    onChange={this.onSearchInputChange}
                    onKeyUp={this.onKeyPress}
                    InputProps={{
                      endAdornment: (
                        <>
                          {this.state.searchText.length > 0 && (
                            <IconButton
                              aria-label="close"
                              className="mr-3"
                              onClick={this.resetSearch}
                              size="small"
                            >
                              <CloseIcon />
                            </IconButton>
                          )}
                          <IconButton onClick={this.searchTracks} color="primary">
                            <SearchIcon />
                          </IconButton>
                        </>
                      ),
                    }}
                  />
                </div>
                <EditableTrackTable
                  isTrackPlaying={this._appState.isTrackPlaying}
                  playbackControl={this.playbackControl}
                  onTrackSelect={this.onTrackSelect}
                  onDownloadClick={this.onDownloadClick}
                  setTrackToPlay={this.setTrackToPlay}
                  isAdmin={this.props.isAdmin}
                  selectedTrackId={this._trackStore.selectedTrackId}
                  data={this._trackStore.tracks}
                  rowsPerPage={this._trackStore.pageSize}
                  totalCount={this._trackStore.totalCount}
                  setRowsPerPage={this.setPageSize}
                  setPageNumber={this.setPageNumber}
                  setSort={this.setSort}
                  pageNumber={this._trackStore.pageNumber}
                  sortColumn={this._trackStore.sortColumn}
                  sortDirection={this._trackStore.sortDirection}
                />
              </>
            )}
          </div>
        )
      }

      private onKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
          this.searchTracks()
        }
      }

      private searchTracks = () => {
        if (this.state.searchText.length > 0) {
          const searchFilter = {
            key: 'title',
            operation: Operation.Like,
            value: this.state.searchText,
          }

          const newColumns = this.state.columns.filter(c => c.key !== 'title')
          newColumns.push(searchFilter)

          this.setState({ columns: newColumns }, () => {
            this.fetchTracks()
          })
        } else {
          this.resetSearch()
        }
      }

      private resetSearch = () => {
        this.setState({ columns: [], joins: [], searchText: '' }, () => {
          this.fetchTracks()
        })
      }

      private onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchText: e.target.value })
      }

      private onTrackSelect = (id: number) => {
        this._trackStore.setTrackToUpdateById(id)
      }

      private setTrackToPlay = (id: number) => {
        this._trackStore.selectTrackById(id)
        this._appState.setTrack(this._trackStore.tracks.get(id))
      }

      private onDownloadClick = (id: number) => {
        this._trackStore.getDownloadUrl(id)
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

      private incrementAndUpdatePlayCount = () => {
        // DO Nothing. We don't want to increment listens for the plays by the artist
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

      private uploadAndCreateTrack = async (filesToUpload: any) => {
        await this._trackStore.uploadFilesAndCreateTrack([filesToUpload])
      }

      private setPageSize = (pageSize: number) => {
        this._trackStore.setPageSize(pageSize)
        this.fetchTracks()
      }

      private setPageNumber = (pageNumber: number) => {
        this._trackStore.setPageNumber(pageNumber)
        this.fetchTracks()
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._trackStore.setSortDirection(sortDirection)
        this._trackStore.setSortColumn(sortColumn)
        this.fetchTracks()
      }

      private fetchTracks = () => {
        const filterCriteria = {
          columns: this.state.columns,
          joins: this.state.joins,
        }

        this._trackStore.searchTracksPrivate(filterCriteria)
      }
    }
  )
)

export default TrackManagement
