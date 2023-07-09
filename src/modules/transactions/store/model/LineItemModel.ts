import { observable, makeObservable } from 'mobx'

export default class LineItemModel {
  public id = 0

  public description = ''

  public totalCost = 0

  public discountedAmount = 0

  public amountPaid = 0

  public type = 0

  public trackId = 0

  public sampleId = 0

  public artistId = 0

  public transactionId = 0

  constructor(initialData: LineItemModel = null) {
    makeObservable(this, {
      id: observable,
      description: observable,
      totalCost: observable,
      discountedAmount: observable,
      amountPaid: observable,
      type: observable,
      trackId: observable,
      sampleId: observable,
      artistId: observable,
      transactionId: observable,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
      })
    }
  }
}
