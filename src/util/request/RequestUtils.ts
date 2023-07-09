/**
 *
 * @param {object} response
 *
 * If the response status was a success, returns true
 */
const isSuccessResponse = (response: any) =>
  response &&
  response.message !== 'ERR_CONNECTION_REFUSED' &&
  response.status >= 200 &&
  response.status < 300

const makeQueryString = (params: any): string => {
  if (params) {
    const query = Object.keys(params)
      .filter(k => !!params[k])
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&')

    return query
  }

  return ''
}

export { isSuccessResponse, makeQueryString }
