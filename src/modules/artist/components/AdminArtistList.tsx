import { Divider } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { ArtistStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import AdminArtistTable from './AdminArtistTable'

interface IAdminArtistList {
  artistStore?: ArtistStore
  initialPageSize: number
}

const AdminArtistList = inject('artistStore')(
  observer(
    class AdminArtistList extends React.Component<IAdminArtistList> {
      private readonly _artistStore: ArtistStore

      constructor(props: IAdminArtistList) {
        super(props)

        this._artistStore = props.artistStore
      }

      public componentDidMount() {
        this.fetchTransactions()
      }

      public render() {
        return (
          <div>
            <div className="pb-4 text-xl font-medium text-primary-light">Manage Artists</div>
            <Divider style={{ marginBottom: '2em' }} />
            {this._artistStore.loading ? (
              <SkeletonLoader count={24} type="table" />
            ) : (
              <AdminArtistTable
                data={this._artistStore.artists}
                updateVerified={this.updateVerified}
                updateProfileLocked={this.updateProfileLocked}
                rowsPerPage={this._artistStore.pageSize}
                totalCount={this._artistStore.totalCount}
                setRowsPerPage={this.setPageSize}
                setPageNumber={this.setPageNumber}
                setSort={this.setSort}
                pageNumber={this._artistStore.pageNumber}
                sortColumn={this._artistStore.sortColumn}
                sortDirection={this._artistStore.sortDirection}
              />
            )}
          </div>
        )
      }

      private updateVerified = (artistId: number, verified: boolean) => {
        this._artistStore.updateVerified(artistId, verified)
      }

      private updateProfileLocked = (artistId: number, profileLocked: boolean) => {
        this._artistStore.updateProfileLocked(artistId, profileLocked)
      }

      private fetchTransactions = () => {
        this._artistStore.resetPagination()
        this._artistStore.setSortColumn('name')
        this._artistStore.setSortDirection('asc')
        this._artistStore.setPageSize(this.props.initialPageSize)
        this._artistStore.fetchAllArtistsAsAdmin()
      }

      private setPageSize = (pageSize: number) => {
        this._artistStore.setPageSize(pageSize)
        this._artistStore.fetchAllArtistsAsAdmin()
      }

      private setPageNumber = (pageNumber: number) => {
        this._artistStore.setPageNumber(pageNumber)
        this._artistStore.fetchAllArtistsAsAdmin()
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._artistStore.setSortDirection(sortDirection)
        this._artistStore.setSortColumn(sortColumn)
        this._artistStore.fetchAllArtistsAsAdmin()
      }
    }
  )
)

export default AdminArtistList
