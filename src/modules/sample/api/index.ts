import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/sample'

export function getSample(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}

export function getSamples(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  callback: (response: any) => void
) {
  return get(
    `${path}?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}`,
    callback,
    false
  )
}

export function getSamplesByArtistId(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  artistId: number,
  callback: (response: any) => void
) {
  return get(
    `${path}?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}&artistId=${artistId}`,
    callback,
    false
  )
}

export function updateSample(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function updateSamplePlayCount(id: number, callback: (response: any) => void) {
  return put(`${path}/${id}/play-count`, {}, callback, false)
}

export function createSample(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteSample(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}
