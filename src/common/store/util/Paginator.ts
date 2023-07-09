import { action, observable, makeObservable } from 'mobx'
import SearchCriteria from './SearchCriteria'

export type Order = 'asc' | 'desc'

export default class Paginator extends SearchCriteria {
  public totalCount = 0

  public pageNumber = 0

  public pageSize = 24

  public sortDirection: Order = 'desc'

  public sortColumn = 'createdDate'

  public resetPagination = () => {
    this.pageNumber = 0
    this.pageSize = 24
    this.totalCount = 0
    this.sortColumn = 'createdDate'
  }

  public setTotalCount = (totalCount: number) => {
    this.totalCount = totalCount
  }

  public setPageNumber = (pageNumber: number) => {
    this.pageNumber = pageNumber
  }

  public setPageSize = (pageSize: number) => {
    this.pageSize = pageSize
  }

  public setSortDirection = (sortDirection: Order) => {
    this.sortDirection = sortDirection
  }

  public setSortColumn = (sortColumn: string) => {
    this.sortColumn = sortColumn
  }

  constructor() {
    super()

    makeObservable(this, {
      totalCount: observable,
      pageNumber: observable,
      pageSize: observable,
      sortDirection: observable,
      sortColumn: observable,
      resetPagination: action,
      setTotalCount: action,
      setPageNumber: action,
      setPageSize: action,
      setSortDirection: action,
      setSortColumn: action,
    })
  }
}
