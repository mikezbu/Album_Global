import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/tag'

export function getTagByName(name: string, callback: (response: any) => void) {
  return get(`${path}?name=${encodeURIComponent(name)}`, callback, false)
}

export function getTag(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}

export function getTags(
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

export function updateTag(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function createTag(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteTag(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}
