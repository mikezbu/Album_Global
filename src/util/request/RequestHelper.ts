/**
 * Axios based API Helper
 *
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

import { MessageVariant } from 'src/common/store/AppState'
import { getStore } from 'src/common/store/index'
import { API_URL, CLIENT_CREDENTIALS } from 'src/ApplicationConfiguration'
import { makeQueryString } from 'src/util/request/RequestUtils'

const isServer = typeof window === 'undefined'

interface IAuthResponse {
  refresh_token: string
  access_token: string
}

const catchError = (callback: (response: any) => void): ((response: any) => void) => {
  return function err(error) {
    if (error.message === 'ERR_INTERNET_DISCONNECTED') {
      getStore().appState.setMessage(
        'You are offline. Check your internet connection and try again'
      )
      getStore().appState.setMessageVariant(MessageVariant.Warning)
      getStore().appState.setShowMessage(true)

      return
    }

    if (error.message === 'ERR_TIMED_OUT' || error.message.indexOf('timeout') >= 0) {
      getStore().appState.setMessage('Request timed out. Refresh the page and try again')
      getStore().appState.setMessageVariant(MessageVariant.Warning)
      getStore().appState.setShowMessage(true)

      return
    }

    if (error.message === 'Network Error') {
      getStore().appState.setMessage(
        'Unable to reach our servers. Check your internet and try again'
      )
      getStore().appState.setMessageVariant(MessageVariant.Warning)
      getStore().appState.setShowMessage(true)

      return
    }

    callback(error.response)
  }
}

const baseUrl = (): string => {
  return API_URL + '/neutron/v1'
}

function getAccessToken(): string {
  return localStorage.getItem('access_token')
}

function getRefreshToken(): string {
  return localStorage.getItem('refresh_token')
}

const authenticatedHttpClient = axios.create({
  baseURL: baseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
})

const httpClient = axios.create({
  baseURL: baseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
})

/**
 * Request Interceptor for authenticated http client
 *
 * This adds the authorization token to any request made
 * to the backend by reading it from the localStorage
 */
authenticatedHttpClient.interceptors.request.use(
  config => {
    const requestConfig = config
    if (!isServer) {
      requestConfig.headers.Authorization = `Bearer ${getAccessToken()}`
    }

    return requestConfig
  },
  error => Promise.reject(error)
)

/**
 * Request response Interceptor for authenticated http client
 *
 * This intercepts the 401 response back from the backend and attempts
 * to refresh expired access_token and re-send the original request again
 * with the new token.
 */
authenticatedHttpClient.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    getStore().authenticationStore.setRefreshTokenAttempted(false)

    return response
  },
  (error: any) => {
    if (
      error.message !== 'Network Error' &&
      error.message !== 'ERR_INTERNET_DISCONNECTED' &&
      error.message !== 'ERR_TIMED_OUT' &&
      error.response.status === 401 &&
      !getStore().authenticationStore.authenticationInProgress &&
      !getStore().authenticationStore.refreshTokenAttempted &&
      !getStore().authenticationStore.reAuthenticationAttempted
    ) {
      getStore().authenticationStore.setRefreshTokenAttempted(true)

      return httpClient
        .post<string, AxiosResponse<IAuthResponse>>(
          '/oauth/token',
          makeQueryString({
            grant_type: 'refresh_token',
            refresh_token: getRefreshToken(),
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${CLIENT_CREDENTIALS}`,
              Accept: 'application/json',
            },
            withCredentials: true,
          }
        )
        .then(response => {
          localStorage.setItem('refresh_token', response.data.refresh_token)
          localStorage.setItem('access_token', response.data.access_token)

          const originalRequest = error.config
          originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`

          return authenticatedHttpClient(originalRequest)
        })
    }

    if (
      (error.message !== 'Network Error' &&
        error.message !== 'ERR_INTERNET_DISCONNECTED' &&
        error.message !== 'ERR_TIMED_OUT' &&
        getStore().authenticationStore.refreshTokenAttempted) ||
      getStore().authenticationStore.reAuthenticationAttempted
    ) {
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('access_token')

      getStore().authenticationStore.setAuthenticated(false)
    }

    return Promise.reject(error)
  }
)

/**
 *
 * @param {string} path
 * @param {function} callback
 * @param {boolean} authenticated
 */
const get = (path: string, callback: (response: any) => void, authenticated = true) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.get(path).then(callback).catch(catchError(callback))
}

/**
 *
 * @param {string} path
 * @param {function} callback
 * @param {boolean} authenticated
 */
const getPromise = (path: string, authenticated = true) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.get(path)
}

/**
 *
 * @param {string} path
 * @param {object} data
 * @param {function} callback
 * @param {boolean} authenticated
 */
const put = (
  path: string,
  data: any,
  callback: (response: any) => void,
  authenticated = true,
  config: AxiosRequestConfig = null
) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.put(path, data, config).then(callback).catch(catchError(callback))
}

/**
 *
 * @param {string} path
 * @param {object} data
 * @param {function} callback
 * @param {boolean} authenticated
 */
const putPromise = (
  path: string,
  data: any,
  authenticated = true,
  config: AxiosRequestConfig = null
) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.put(path, data, config)
}

/**
 *
 * @param {string} path
 * @param {object} data
 * @param {function} callback
 * @param {boolean} authenticated
 */
const post = (path: any, data: any, callback: (response: any) => void, authenticated = true) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.post(path, data).then(callback).catch(catchError(callback))
}
/**
 *
 * @param {string} path
 * @param {object} data
 * @param {function} callback
 * @param {boolean} authenticated
 */
const postPromise = (path: any, data: any, authenticated = true) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.post(path, data)
}

/**
 *
 * @param {string} path
 * @param {function} callback
 * @param {boolean} authenticated
 */
const destroy = (path: any, callback: (response: any) => void, authenticated = true) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.delete(path).then(callback).catch(catchError(callback))
}

/**
 *
 * @param {string} path
 * @param {function} callback
 * @param {boolean} authenticated
 */
const destroyPromise = (path: any, authenticated = true) => {
  const client = authenticated ? authenticatedHttpClient : httpClient

  return client.delete(path)
}

export { get, getPromise, put, putPromise, post, postPromise, destroy, destroyPromise }
