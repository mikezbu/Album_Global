import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/collection'

export function getCollection(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}

export function getCollections(
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

export function searchCollections(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  body: any,
  callback: (response: any) => void
) {
  return post(
    `${path}/search?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}`,
    body,
    callback,
    false
  )
}

export function getCollectionsByType(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  type: number,
  callback: (response: any) => void
) {
  return get(
    `${path}?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}&type=${type}`,
    callback,
    false
  )
}

export function getCollectionsByArtistIdAndType(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  artistId: number,
  type: number,
  callback: (response: any) => void
) {
  return get(
    `${path}?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}&artistId=${artistId}&type=${type}`,
    callback
  )
}

export function updateCollection(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function createCollection(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteCollection(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}
