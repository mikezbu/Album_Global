import { Currency } from 'src/modules/price/store/model/PriceModel'

export const numberWithCommas = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const getCurrencySymbol = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case Currency.USD:
      return '$'
    case Currency.ETB:
      return 'Birr'
    case Currency.GBP:
      return '£'
    case Currency.EUR:
      return '€'
    default:
      return '$'
  }
}

export const getFormattedMonitaryValue = (currency: string, monitaryValue: number): string => {
  return `${getCurrencySymbol(currency)} ${numberWithCommas(monitaryValue)}`
}

export const getCardTypeImageUrl = (cardType: string, theme = 'light'): string => {
  if (cardType) {
    switch (cardType.toLowerCase()) {
      case 'amex':
        return `/images/card_types/${theme}/amex.png`
      case 'diners':
        return `/images/card_types/${theme}/diners.png`
      case 'discover':
        return `/images/card_types/${theme}/discover.png`
      case 'jcb':
        return `/images/card_types/${theme}/jcb.png`
      case 'mastercard':
        return `/images/card_types/${theme}/mastercard.png`
      case 'unionpay':
        return `/images/card_types/${theme}/unionpay.png`
      case 'visa':
        return `/images/card_types/${theme}/visa.png`
      default:
        return `/images/card_types/${theme}/visa.png`
    }
  } else return `/images/card_types/${theme}/visa.png`
}
