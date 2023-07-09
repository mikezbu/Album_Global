import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/instrument'

export function getInstrumentByName(name: string, callback: (response: any) => void) {
  return get(`${path}?name=${encodeURIComponent(name)}`, callback, false)
}

export function getInstrument(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}

export function getInstruments(callback: (response: any) => void) {
  return get(path, callback, false)
}

export function updateInstrument(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function createInstrument(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteInstrument(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}
