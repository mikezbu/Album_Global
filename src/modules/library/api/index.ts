import { get } from 'src/util/request/RequestHelper'

const path = '/library'

export function getLibrary(
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

export function getLibraryById(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback)
}

export function generateDownloadLink(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}/generate-download-link`, callback)
}
