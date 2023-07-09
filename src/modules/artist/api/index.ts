import {
  destroy,
  get,
  getPromise,
  post,
  postPromise,
  put,
  putPromise,
} from 'src/util/request/RequestHelper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const path = '/artist'

export function getArtist(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}

export function getAllVerifiedArtists(
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

export function getAllArtists(
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: string,
  callback: (response: any) => void
) {
  return get(
    `${path}/all?pageNumber=${pageNumber}&pageSize=${pageSize}&sortDirection=${sortDirection}&sortColumn=${sortColumn}`,
    callback
  )
}

export function findArtistByUserId(userId: number, callback: (response: any) => void) {
  return get(`${path}/find-by?userId=${userId}`, callback, false)
}

export function findArtistByUrlAlias(urlAlias: string, callback: (response: any) => void) {
  return get(`${path}/find-by?urlAlias=${urlAlias}`, callback, false)
}

export function searchArtistByUrlAliasOrName(query: string, callback: (response: any) => void) {
  return get(`${path}/search?query=${query}`, callback, false)
}

export function updateArtist(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function createArtist(body: any, callback: (response: any) => void) {
  return post(`${path}`, body, callback)
}

export function deleteArtist(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}

const getArtistPromise = (id: number) => {
  return getPromise(`${path}/${id}`, true)
}

export const useGetArtist = (id: number, enabled = true) => {
  return useQuery([`artist`, id], () => getArtistPromise(id), { enabled: enabled })
}

export const updateArtistPromise = ({ id, body }) => {
  return putPromise(`${path}/${id}`, body)
}

export const createArtistPromise = ({ body }) => {
  return postPromise(path, body)
}

export function useUpdateArtist() {
  const queryClient = useQueryClient()

  return useMutation(['artist'], updateArtistPromise, {
    onSuccess: data => {
      queryClient.setQueryData([`artist`, data?.data.id], data)
    },
  })
}

export function useCreateArtist() {
  const queryClient = useQueryClient()

  return useMutation(['artist'], createArtistPromise, {
    onSuccess: data => {
      queryClient.setQueryData([`artist`, data?.data.id], data)
    },
  })
}
