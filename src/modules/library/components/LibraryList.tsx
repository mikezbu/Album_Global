import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { AppState, getStore, LibraryStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import LibraryTable from 'src/modules/library/components/LibraryTable'
import InvoiceModal from 'src/modules/transactions/components/InvoiceModal'
interface ILibraryList {
  libraryStore?: LibraryStore
  appState?: AppState
  initialPageSize: number
}

const LibraryList = inject(
  'appState',
  'libraryStore'
)(
  observer(
    class LibraryList extends React.Component<ILibraryList> {
      private readonly _appState: AppState
      private readonly _libraryStore: LibraryStore
      public state = {
        openInvoiceModal: false,
        selectedTransactionId: 0,
      }

      constructor(props: ILibraryList) {
        super(props)

        this._appState = props.appState
        this._libraryStore = props.libraryStore
      }

      public componentDidMount() {
        this.fetchTransactions()
        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(null)
        this._appState.setOnPrevious(null)
        this._appState.setIncrementAndUpdatePlayCount(null)
      }

      public componentDidUpdate() {
        this._appState.setOnPlay(this.onPlay)
        this._appState.setOnPause(this.onPause)
        this._appState.setOnStop(this.onStop)
        this._appState.setOnNext(null)
        this._appState.setOnPrevious(null)
        this._appState.setIncrementAndUpdatePlayCount(null)
      }

      public render() {
        return (
          <div className="print:hidden">
            <div className="pb-6 text-xl font-medium text-primary-light">My Library</div>
            {this._libraryStore.loading ? (
              <SkeletonLoader count={24} type="table" />
            ) : (
              <LibraryTable
                isTrackPlaying={this._appState.isTrackPlaying}
                playbackControl={this.playbackControl}
                onTrackSelect={this.onTrackSelect}
                onLibrarySelect={this.onLibrarySelect}
                onViewInvoice={this.onViewInvoiceClick}
                selectedLibraryId={this._libraryStore.selectedLibrary.id}
                data={this._libraryStore.libraries}
                loading={this._libraryStore.loading}
                rowsPerPage={this._libraryStore.pageSize}
                totalCount={this._libraryStore.totalCount}
                setRowsPerPage={this.setPageSize}
                setPageNumber={this.setPageNumber}
                setSort={this.setSort}
                pageNumber={this._libraryStore.pageNumber}
                sortColumn={this._libraryStore.sortColumn}
                sortDirection={this._libraryStore.sortDirection}
              />
            )}
            <InvoiceModal open={this.state.openInvoiceModal} onClose={this.closeInvoiceModal} />
          </div>
        )
      }

      private onViewInvoiceClick = (transactionId: number) => {
        getStore().transactionStore.fetchTransaction(transactionId)
        this.setState({ selectedTransactionId: transactionId, openInvoiceModal: true })
      }

      private closeInvoiceModal = () => {
        this.setState({ openInvoiceModal: false })
      }

      private fetchTransactions = () => {
        this._libraryStore.resetPagination()
        this._libraryStore.setSortColumn('addedDate')
        this._libraryStore.setSortDirection('desc')
        this._libraryStore.setPageSize(this.props.initialPageSize)
        this._libraryStore.fetchLibrary()
      }

      private onLibrarySelect = (id: number) => {
        this._libraryStore.setSelectedLibrary(id)
        this._libraryStore.getDownloadUrl()
      }

      private setPageSize = (pageSize: number) => {
        this._libraryStore.setPageSize(pageSize)
        this._libraryStore.fetchLibrary()
      }

      private setPageNumber = (pageNumber: number) => {
        this._libraryStore.setPageNumber(pageNumber)
        this._libraryStore.fetchLibrary()
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._libraryStore.setSortDirection(sortDirection)
        this._libraryStore.setSortColumn(sortColumn)
        this._libraryStore.fetchLibrary()
      }

      private onTrackSelect = (id: number) => {
        this.onStop()
        this._libraryStore.selectTrackById(id)

        if (this._libraryStore.selectedTrack) {
          this._appState.setTrack(this._libraryStore.selectedTrack)
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
    }
  )
)

export default LibraryList
