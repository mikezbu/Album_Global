import { action, computed, observable, makeObservable } from 'mobx'

export default class TagModel {
  public id = 0

  public name = ''

  public newToCreate = false

  constructor(initialData: TagModel = null) {
    makeObservable(this, {
      id: observable,
      name: observable,
      setId: action,
      setName: action,
      setNewToCreate: action,
      updateProperty: action,
      getCreateJson: computed,
      getUpdateJson: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.name = initialData.name
    }
  }

  public setNewToCreate = (newToCreate: boolean) => {
    this.newToCreate = newToCreate
  }

  public setId = (id: number) => {
    this.id = id
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
