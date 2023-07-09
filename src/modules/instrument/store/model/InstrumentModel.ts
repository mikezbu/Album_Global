import { action, computed, observable, makeObservable } from 'mobx'

export default class InstrumentModel {
  public id = 0

  public name = ''

  public description = ''

  public artworkFileCatalogId = 0

  public artworkUrl = ''

  constructor(initialData: InstrumentModel = null) {
    makeObservable(this, {
      id: observable,
      name: observable,
      description: observable,
      artworkUrl: observable,
      artworkFileCatalogId: observable,
      setName: action,
      setDescription: action,
      setArtworkFileCatalogId: action,
      setArtworkUrl: action,
      updateProperty: action,
      getCreateJson: computed,
      getUpdateJson: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.name = initialData.name
      this.description = initialData.description
      this.artworkFileCatalogId = initialData.artworkFileCatalogId
      this.artworkUrl = initialData.artworkUrl
    }
  }

  public setName = (name: string) => {
    this.name = name
  }

  public setDescription = (description: string) => {
    this.description = description
  }

  public setArtworkFileCatalogId = (artworkFileCatalogId: number) => {
    this.artworkFileCatalogId = artworkFileCatalogId
  }

  public setArtworkUrl = (artworkUrl: string) => {
    this.artworkUrl = artworkUrl
  }

  public updateProperty = (property: string, name: string) => {
    this[property] = name
  }

  get getCreateJson() {
    return {
      name: this.name,
      description: this.description,
      artworkFileCatalogId: this.artworkFileCatalogId,
    }
  }

  get getUpdateJson() {
    return {
      name: this.name,
      description: this.description,
      artworkFileCatalogId: this.artworkFileCatalogId,
    }
  }
}
