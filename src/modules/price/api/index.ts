import { get } from 'src/util/request/RequestHelper'

const path = '/exchange-rate'

export function getExchangeRates(callback: (response: any) => void) {
  return get(path, callback, false)
}

export function getExchangeRate(id: number, callback: (response: any) => void) {
  return get(`${path}/${id}`, callback, false)
}
