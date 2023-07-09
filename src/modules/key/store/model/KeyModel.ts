import { action, computed, observable, makeObservable } from 'mobx'

export default class KeyModel {
  public id = 0

  public name = ''

  constructor(initialData: KeyModel = null) {
    makeObservable(this, {
      id: observable,
      name: observable,
      setName: action,
      updateProperty: action,
      getCreateJson: computed,
      getUpdateJson: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.name = initialData.name
    }
  }

  public setName = (name: string) => {
    this.name = name
  }

  public updateProperty = (property: string, name: string) => {
    this[property] = name
  }

  get getCreateJson() {
    return {
      name: this.name,
    }
  }

  get getUpdateJson() {
    return {
      name: this.name,
    }
  }
}
