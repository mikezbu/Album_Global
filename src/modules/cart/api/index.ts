import { get, post, put } from 'src/util/request/RequestHelper'

const path = '/cart'

export function getCartById(id: number, authenticated: boolean, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, authenticated)
}

export function initializeCheckout(
  id: number,
  authenticated: boolean,
  callback: (response: any) => void
) {
  return put(`${path}/${id}/initialize-checkout`, {}, callback, authenticated)
}

export function getCartByRequestorId(callback: (response: any) => void) {
  return get(`${path}/requestor`, callback)
}

export function checkout(
  id: number,
  body: any,
  authenticated: boolean,
  callback: (response: any) => void
) {
  return put(`${path}/${id}/checkout`, body, callback, authenticated)
}

export function updateCart(
  id: number,
  body: any,
  authenticated: boolean,
  callback: (response: any) => void
) {
  return put(`${path}/${id}`, body, callback, authenticated)
}

export function createCart(body: any, authenticated: boolean, callback: (response: any) => void) {
  return post(`${path}`, body, callback, authenticated)
}
