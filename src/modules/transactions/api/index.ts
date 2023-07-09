import { get } from 'src/util/request/RequestHelper'

const path = '/transaction'

export function getTransactions(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  callback: (response: any) => void
) {
  return get(
    `${path}?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}`,
    callback
  )
}

export function getTransaction(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback)
}
