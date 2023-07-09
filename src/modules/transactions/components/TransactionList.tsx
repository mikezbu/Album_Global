import { Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { TransactionStore } from 'src/common/store'
import { Order } from 'src/common/store/util/Paginator'
import InvoiceModal from 'src/modules/transactions/components/InvoiceModal'
import TransactionsTable from 'src/modules/transactions/components/TransactionsTable'

interface ITransactionList {
  transactionStore?: TransactionStore
  initialPageSize: number
}

const TransactionList = inject('transactionStore')(
  observer(
    class TransactionList extends React.Component<ITransactionList> {
      public state = {
        openInvoiceModal: false,
      }

      private readonly _transactionStore: TransactionStore

      constructor(props: ITransactionList) {
        super(props)

        this._transactionStore = props.transactionStore
      }

      public componentDidMount() {
        this.fetchTransactions()
      }

      public render() {
        return (
          <div className="print:hidden">
            <Typography variant="h6" className="pb-6">
              My Receipts
            </Typography>
            {this._transactionStore.loading ? (
              <SkeletonLoader count={24} type="table" />
            ) : (
              <TransactionsTable
                onTransactionSelect={this.onTransactionSelect}
                selectedTransactionId={this._transactionStore.selectedTransaction.id}
                data={this._transactionStore.transactions}
                rowsPerPage={this._transactionStore.pageSize}
                totalCount={this._transactionStore.totalCount}
                setRowsPerPage={this.setPageSize}
                setPageNumber={this.setPageNumber}
                setSort={this.setSort}
                pageNumber={this._transactionStore.pageNumber}
                sortColumn={this._transactionStore.sortColumn}
                sortDirection={this._transactionStore.sortDirection}
              />
            )}
            <InvoiceModal open={this.state.openInvoiceModal} onClose={this.closeInvoiceModal} />
          </div>
        )
      }

      private closeInvoiceModal = () => {
        this._transactionStore.setSelectedTransaction(-1)
        this.setState({ openInvoiceModal: false })
      }

      private fetchTransactions = () => {
        this._transactionStore.resetPagination()
        this._transactionStore.setSortColumn('purchaseDate')
        this._transactionStore.setSortDirection('desc')
        this._transactionStore.setPageSize(this.props.initialPageSize)
        this._transactionStore.fetchTransactions()
      }

      private onTransactionSelect = (id: number) => {
        this._transactionStore.setSelectedTransaction(id)
        this.setState({ openInvoiceModal: true })
      }

      private setPageSize = (pageSize: number) => {
        this._transactionStore.setPageSize(pageSize)
        this._transactionStore.fetchTransactions()
      }

      private setPageNumber = (pageNumber: number) => {
        this._transactionStore.setPageNumber(pageNumber)
        this._transactionStore.fetchTransactions()
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._transactionStore.setSortDirection(sortDirection)
        this._transactionStore.setSortColumn(sortColumn)
        this._transactionStore.fetchTransactions()
      }
    }
  )
)

export default TransactionList
