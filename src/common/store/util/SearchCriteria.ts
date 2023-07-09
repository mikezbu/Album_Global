import { action, observable, makeObservable } from 'mobx'

export enum Operation {
  NA = 0,
  Equals = 1,
  NotEquals = 2,
  In = 3,
  Like = 4,
  GreaterThan = 5,
  GreaterThanOrEqualTo = 6,
  LessThan = 7,
  LessThanOrEqualTo = 8,
}

export default class SearchCriteria {
  public filterKey = ''

  public filterOperation: Operation = Operation.NA

  public filterValue: any = null

  public resetSearchCriteria = () => {
    this.filterKey = ''
    this.filterOperation = Operation.NA
    this.filterValue = null
  }

  public setFilterKey = (filterKey: string) => {
    this.filterKey = filterKey
  }

  public setFilterOperation = (filterOperation: number) => {
    this.filterOperation = filterOperation
  }

  public setFilterValue = (filterValue: any) => {
    this.filterValue = filterValue
  }

  constructor() {
    makeObservable(this, {
      filterKey: observable,
      filterOperation: observable,
      filterValue: observable,
      resetSearchCriteria: action,
      setFilterKey: action,
      setFilterOperation: action,
      setFilterValue: action,
    })
  }
}
