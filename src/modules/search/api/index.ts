import { post } from 'src/util/request/RequestHelper'

const path = '/search'

export function search(body: any, callback: (response: any) => void) {
  return post(path, body, callback, false)
}
