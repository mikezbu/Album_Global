import { observable, makeObservable } from 'mobx'

import LineItemModel from 'src/modules/transactions/store/model/LineItemModel'

export default class TransactionModel {
  public id = 0

  public totalCost = 0.0

  public discountedAmount = 0.0

  public amountPaid = 0.0

  public purchaseDate: Date = new Date()

  public cardType = ''

  public last4 = ''

  public expireMonth = 0

  public expireYear = 0

  public currency = ''

  public billingFirstName = ''

  public billingLastName = ''

  public lineItems: LineItemModel[] = []

  constructor(initialData: TransactionModel = null) {
    makeObservable(this, {
      id: observable,
      totalCost: observable,
      discountedAmount: observable,
      amountPaid: observable,
      purchaseDate: observable,
      cardType: observable,
      last4: observable,
      expireMonth: observable,
      expireYear: observable,
      currency: observable,
      billingFirstName: observable,
      billingLastName: observable,
      lineItems: observable,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
      })

      this.purchaseDate = new Date(initialData.purchaseDate)
    }
  }
}
