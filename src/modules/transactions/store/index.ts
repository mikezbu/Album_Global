import { action, observable, makeObservable } from 'mobx'

import Paginator from 'src/common/store/util/Paginator'
import { getTransaction, getTransactions } from 'src/modules/transactions/api'
import TransactionModel from 'src/modules/transactions/store/model/TransactionModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class TransactionStore extends Paginator {
  public transactions = observable.map<number, TransactionModel>()

  public selectedTransaction: TransactionModel = new TransactionModel()

  public loading = false

  constructor(initialData: TransactionStore = null) {
    super()

    makeObservable(this, {
      transactions: observable,
      selectedTransaction: observable,
      loading: observable,
      setSelectedTransaction: action,
      fetchTransaction: action,
      fetchTransactions: action,
      fetchTransactionCallback: action,
      fetchTransactionsCallback: action,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
      })
    }
  }

  public setSelectedTransaction = (id: number) => {
    if (this.transactions.has(id)) {
      this.selectedTransaction = this.transactions.get(id)
    } else {
      this.selectedTransaction = new TransactionModel()
    }
  }

  public fetchTransaction = (transactionId: number) => {
    this.loading = true
    this.selectedTransaction = new TransactionModel()
    getTransaction(transactionId, this.fetchTransactionCallback)
  }

  public fetchTransactions = () => {
    this.loading = true
    getTransactions(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchTransactionsCallback
    )
  }

  public fetchTransactionCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.selectedTransaction = new TransactionModel(response.data)
    }

    this.loading = false
  }

  public fetchTransactionsCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.transactions.clear()
      response.data.content.forEach((transaction: TransactionModel) => {
        this.transactions.set(transaction.id, new TransactionModel(transaction))
      })
      this.totalCount = response.data.totalElements
    }

    this.loading = false
  }
}
