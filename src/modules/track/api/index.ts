import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/track'

export function getTrack(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}

export function searchTracks(
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

export function searchTracksPrivate(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  body: any,
  callback: (response: any) => void
) {
  return post(
    `${path}/private-search?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}`,
    body,
    callback
  )
}

export function updateTrack(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function updateTrackPlayCount(id: number, callback: (response: any) => void) {
  return put(`${path}/${id}/play-count`, {}, callback, false)
}

export function createTrack(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteTrack(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}

export function generateDownloadLink(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}/generate-download-link`, callback)
}
