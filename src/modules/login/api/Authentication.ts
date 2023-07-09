import Axios from 'axios'

import { API_URL, CLIENT_CREDENTIALS } from 'src/ApplicationConfiguration'
import { makeQueryString } from 'src/util/request/RequestUtils'

export function login(body: any, callback: (response: any) => void) {
  return Axios.post(`${API_URL}/neutron/v1/oauth/token`, makeQueryString(body), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${CLIENT_CREDENTIALS}`,
      Accept: 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
  })
    .then(callback)
    .catch(callback)
}

export function reAuthenticate(body: any, callback: (response: any) => void) {
  return Axios.post(`${API_URL}/neutron/v1/oauth/token`, makeQueryString(body), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${CLIENT_CREDENTIALS}`,
      Accept: 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
  })
    .then(callback)
    .catch(callback)
}

export function checkToken(accessToken: any, callback: (response: any) => void) {
  return Axios.post(`${API_URL}/neutron/v1/oauth/check_token`, `token=${accessToken}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${CLIENT_CREDENTIALS}`,
      Accept: 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
  })
    .then(callback)
    .catch(callback)
}
