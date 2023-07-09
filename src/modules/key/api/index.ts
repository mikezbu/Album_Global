import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/key'

export function getKeys(callback: (response: any) => void) {
  return get(path, callback, false)
}

export function updateKey(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function createKey(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteKey(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}
