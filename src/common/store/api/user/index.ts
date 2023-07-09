import { destroy, get, post, put } from 'src/util/request/RequestHelper'

const path = '/user'

export function getAllUsers(
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

export function getUserFromRequestContext(callback: (response: any) => void) {
  return get(`${path}/me`, callback)
}

export function updateUser(id: number, body: any, callback: (response: any) => void) {
  return put(`${path}/${id}`, body, callback)
}

export function createUser(body: any, callback: (response: any) => void) {
  return post(`${path}/`, body, callback, false)
}

export function deleteUser(id: number, callback: (response: any) => void) {
  return destroy(`${path}/${id}`, callback)
}

export function verifyEmail(body: any, callback: (response: any) => void) {
  return put(`${path}/verify-email`, body, callback, false)
}

export function impersonateUser(id: number, callback: (response: any) => void) {
  return post(`${path}/${id}/impersonate`, {}, callback)
}

export function resendEmailVerification(id: number, callback: (response: any) => void) {
  return post(`${path}/${id}/resend-email-verification`, {}, callback)
}

export function forgotPassword(body: any, callback: (response: any) => void) {
  return post(`${path}/send-password-reset-email`, body, callback, false)
}

export function resetPassword(body: any, callback: (response: any) => void) {
  return post(`${path}/reset-password`, body, callback, false)
}

export function createPassword(body: any, callback: (response: any) => void) {
  return post(`${path}/create-password`, body, callback, false)
}

export function changePassword(id: number, body: any, callback: (response: any) => void) {
  return post(`${path}/${id}/change-password`, body, callback)
}
