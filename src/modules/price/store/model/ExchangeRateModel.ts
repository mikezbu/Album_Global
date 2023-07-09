import { observable, makeObservable } from 'mobx'

import { Currency } from 'src/modules/price/store/model/PriceModel'

export default class ExchangeRateModel {
  public id = 0

  public exchangeRate = 0

  public sourceCurrency: Currency = Currency.USD

  public targetCurrency: Currency = Currency.USD

  constructor(initialData: ExchangeRateModel = null) {
    makeObservable(this, {
      id: observable,
      exchangeRate: observable,
      sourceCurrency: observable,
      targetCurrency: observable,
    })

    if (initialData) {
      this.id = initialData.id
      this.exchangeRate = initialData.exchangeRate
      this.sourceCurrency = initialData.sourceCurrency
      this.targetCurrency = initialData.targetCurrency
    }
  }
}
