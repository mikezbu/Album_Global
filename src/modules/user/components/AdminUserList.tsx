import { Divider } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { UserStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import AdminUserTable from 'src/modules/user/components/AdminUserTable'

interface IAdminUserList {
  userStore?: UserStore
  initialPageSize: number
}

const AdminUserList = inject('userStore')(
  observer(
    class AdminUserList extends React.Component<IAdminUserList> {
      private readonly _userStore: UserStore

      constructor(props: IAdminUserList) {
        super(props)

        this._userStore = props.userStore
      }

      public componentDidMount() {
        this.fetchUsers()
      }

      public render() {
        return (
          <div className="flex-grow">
            <div className="pb-4 text-xl font-medium text-primary-light">Manage Users</div>
            <Divider style={{ marginBottom: '2em' }} />

            {this._userStore.loading ? (
              <SkeletonLoader count={24} type="table" />
            ) : (
              <AdminUserTable
                data={this._userStore.users}
                rowsPerPage={this._userStore.pageSize}
                totalCount={this._userStore.totalCount}
                setRowsPerPage={this.setPageSize}
                setPageNumber={this.setPageNumber}
                setSort={this.setSort}
                pageNumber={this._userStore.pageNumber}
                sortColumn={this._userStore.sortColumn}
                sortDirection={this._userStore.sortDirection}
              />
            )}
          </div>
        )
      }

      private fetchUsers = () => {
        this._userStore.resetPagination()
        this._userStore.setSortColumn('firstName')
        this._userStore.setSortDirection('asc')
        this._userStore.setPageSize(this.props.initialPageSize)
        this._userStore.fetchAllUsersAsAdmin()
      }

      private setPageSize = (pageSize: number) => {
        this._userStore.setPageSize(pageSize)
        this._userStore.fetchAllUsersAsAdmin()
      }

      private setPageNumber = (pageNumber: number) => {
        this._userStore.setPageNumber(pageNumber)
        this._userStore.fetchAllUsersAsAdmin()
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._userStore.setSortDirection(sortDirection)
        this._userStore.setSortColumn(sortColumn)
        this._userStore.fetchAllUsersAsAdmin()
      }
    }
  )
)

export default AdminUserList
