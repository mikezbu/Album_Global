import { action, computed, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { getCurrencySymbol, numberWithCommas } from 'src/util/NumberFormatter'

export enum Currency {
  USD = 'USD',
  ETB = 'ETB',
  GBP = 'GBP',
  EUR = 'EUR',
}

export default class PriceModel {
  public amount = 0

  public amountForDisplay = 0

  public currency: Currency = Currency.USD

  constructor(initialData: PriceModel = null) {
    makeObservable(this, {
      amount: observable,
      amountForDisplay: observable,
      currency: observable,
      updatePrice: action,
      updateCurrency: action,
      asJson: computed,
      symbol: computed,
      formattedPrice: computed,
      localCurrencyPrice: computed,
    })

    if (initialData) {
      this.amount = initialData.amount
      this.amountForDisplay = initialData.amount / 100
      this.currency = initialData.currency
    }
  }

  public updatePrice = (amount: number) => {
    this.amount = amount * 100
    this.amountForDisplay = amount
  }

  public updateCurrency = (currency: Currency) => {
    this.currency = currency
  }

  public convertCurrency = (
    amount: number,
    sourceCurrency: Currency,
    targetCurrency: Currency
  ): number => {
    if (sourceCurrency === targetCurrency) {
      return amount
    }

    if (getStore().appState.exchangeRatesLoaded) {
      const exchangeRate = getStore().appState.exchangeRates.get(
        `${sourceCurrency}-${targetCurrency}`
      )

      if (exchangeRate) {
        return Math.round(amount * exchangeRate.exchangeRate)
      } else {
        return amount
      }
    } else {
      return amount
    }
  }

  get asJson() {
    return {
      amount: this.amount,
      currency: this.currency,
    }
  }

  get symbol(): string {
    return getCurrencySymbol(this.currency)
  }

  get formattedPrice(): string {
    if (this.amount === 0) return 'FREE'

    let amount = 0

    switch (getStore().appState.countryCode) {
      case 'ET':
        amount = this.convertCurrency(this.amount, this.currency, Currency.ETB)
        return `${getCurrencySymbol(Currency.ETB)} ${numberWithCommas(Math.round(amount / 100))}`
      case 'US':
        amount = this.convertCurrency(this.amount, this.currency, Currency.USD)
        return `${getCurrencySymbol(Currency.USD)} ${numberWithCommas(Math.round(amount / 100))}`
      case 'UK':
        amount = this.convertCurrency(this.amount, this.currency, Currency.GBP)
        return `${getCurrencySymbol(Currency.GBP)} ${numberWithCommas(Math.round(amount / 100))}`
      case 'EU':
        amount = this.convertCurrency(this.amount, this.currency, Currency.EUR)
        return `${getCurrencySymbol(Currency.EUR)} ${numberWithCommas(Math.round(amount / 100))}`
      default:
        amount = this.convertCurrency(this.amount, this.currency, Currency.USD)
        return `${getCurrencySymbol(Currency.USD)} ${numberWithCommas(Math.round(amount / 100))}`
    }
  }

  get localCurrencyPrice(): number {
    switch (getStore().appState.countryCode) {
      case 'ET':
        return this.convertCurrency(this.amountForDisplay, this.currency, Currency.ETB)
      case 'US':
        return this.convertCurrency(this.amountForDisplay, this.currency, Currency.USD)
      case 'UK':
        return this.convertCurrency(this.amountForDisplay, this.currency, Currency.GBP)
      case 'EU':
        return this.convertCurrency(this.amountForDisplay, this.currency, Currency.EUR)
      default:
        return this.convertCurrency(this.amountForDisplay, this.currency, Currency.USD)
    }
  }
}
