import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/genre'

export function getGenreByName(name: string, callback: (response: any) => void) {
  return get(`${path}?name=${encodeURIComponent(name)}`, callback, false)
}

export function getGenre(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}

export function getGenres(callback: (response: any) => void) {
  return get(path, callback, false)
}

export function updateGenre(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function createGenre(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteGenre(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}
