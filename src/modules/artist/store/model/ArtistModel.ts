import { action, computed, observable, makeObservable } from 'mobx'
import CollectionModel, { CollectionType } from 'src/modules/collection/store/model/CollectionModel'

export default class ArtistModel {
  public id = 0

  public name = ''

  public urlAlias = ''

  public website = ''

  public heroImageUrl = ''

  public heroImageFileCatalogId = 0

  public profileImageUrl = ''

  public profileImageFileCatalogId = 0

  public city = ''

  public state = ''

  public country = ''

  public bio = ''

  public facebookLink = ''

  public twitterLink = ''

  public soundCloud = ''

  public instagram = ''

  public verified = false

  public profileLocked = false

  public userId = 0

  public createdDate: Date = null

  public updatedDate: Date = null

  public collections = observable.map<number, CollectionModel>()

  public trackCollections = observable.map<number, CollectionModel>()

  public samplePacks = observable.map<number, CollectionModel>()

  constructor(initialData: ArtistModel = null) {
    makeObservable(this, {
      id: observable,
      name: observable,
      urlAlias: observable,
      website: observable,
      heroImageUrl: observable,
      heroImageFileCatalogId: observable,
      profileImageUrl: observable,
      profileImageFileCatalogId: observable,
      city: observable,
      state: observable,
      country: observable,
      bio: observable,
      facebookLink: observable,
      twitterLink: observable,
      soundCloud: observable,
      instagram: observable,
      verified: observable,
      profileLocked: observable,
      userId: observable,
      createdDate: observable,
      updatedDate: observable,
      collections: observable,
      trackCollections: observable,
      samplePacks: observable,
      updateProperty: action,
      setId: action,
      setName: action,
      setUrlAlias: action,
      setWebsite: action,
      setHeroImageUrl: action,
      setHeroImageFileCatalogId: action,
      setProfileImageUrl: action,
      setProfileImageFileCatalogId: action,
      setCity: action,
      setState: action,
      setCountry: action,
      setBio: action,
      setFacebookLink: action,
      setTwitterLink: action,
      setSoundCloud: action,
      setInstagram: action,
      setVerified: action,
      nameInitial: computed,
      location: computed,
      asJson: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.name = initialData.name
      this.urlAlias = initialData.urlAlias
      this.website = initialData.website
      this.heroImageUrl = initialData.heroImageUrl
      this.heroImageFileCatalogId = initialData.heroImageFileCatalogId
      this.profileImageUrl = initialData.profileImageUrl
      this.profileImageFileCatalogId = initialData.profileImageFileCatalogId
      this.city = initialData.city
      this.state = initialData.state
      this.country = initialData.country
      this.bio = initialData.bio
      this.facebookLink = initialData.facebookLink
      this.twitterLink = initialData.twitterLink
      this.soundCloud = initialData.soundCloud
      this.instagram = initialData.instagram
      this.verified = initialData.verified
      this.profileLocked = initialData.profileLocked
      this.userId = initialData.userId
      this.createdDate = new Date(initialData.createdDate)
      this.updatedDate = new Date(initialData.updatedDate)

      if (initialData.collections) {
        const collections = observable.map<number, CollectionModel>()
        const samplePacks = observable.map<number, CollectionModel>()
        const trackCollections = observable.map<number, CollectionModel>()

        if (initialData.collections) {
          Object.values(initialData.collections).forEach((element: any) => {
            if (element && element.id) {
              collections.set(element.id, new CollectionModel(element))

              if (element.type === CollectionType.Sample) {
                samplePacks.set(element.id, new CollectionModel(element))
              } else if (element.type === CollectionType.Track) {
                trackCollections.set(element.id, new CollectionModel(element))
              }
            } else if (element && element[1] && element[1].id) {
              collections.set(element[1].id, new CollectionModel(element[1]))

              if (element && element[1].type === CollectionType.Sample) {
                samplePacks.set(element[1].id, new CollectionModel(element[1]))
              } else if (element[1].type === CollectionType.Track) {
                trackCollections.set(element[1].id, new CollectionModel(element[1]))
              }
            }
          })
        }

        this.collections = collections
        this.trackCollections = trackCollections
        this.samplePacks = samplePacks
      }
    }
  }

  public fromAPIModel(initialData: any) {
    this.id = initialData.id
    this.name = initialData.name
    this.urlAlias = initialData.urlAlias
    this.website = initialData.website
    this.heroImageUrl = initialData.heroImageUrl
    this.heroImageFileCatalogId = initialData.heroImageFileCatalogId
    this.profileImageUrl = initialData.profileImageUrl
    this.profileImageFileCatalogId = initialData.profileImageFileCatalogId
    this.city = initialData.city
    this.state = initialData.state
    this.country = initialData.country
    this.bio = initialData.bio
    this.facebookLink = initialData.facebookLink
    this.twitterLink = initialData.twitterLink
    this.soundCloud = initialData.soundCloud
    this.instagram = initialData.instagram
    this.verified = initialData.verified
    this.profileLocked = initialData.profileLocked
    this.userId = initialData.userId
    this.createdDate = new Date(initialData.createdDate)
    this.updatedDate = new Date(initialData.updatedDate)

    if (initialData.collections && initialData.collections.length > 0) {
      const collections = observable.map<number, CollectionModel>()
      const samplePacks = observable.map<number, CollectionModel>()
      const trackCollections = observable.map<number, CollectionModel>()

      initialData.collections.forEach((element: any) => {
        if (element && element[1] && element[1].id) {
          collections.set(element[1].id, new CollectionModel(element[1]))

          if (element[1].type === CollectionType.Sample) {
            samplePacks.set(element[1].id, new CollectionModel(element[1]))
          } else if (element[1].type === CollectionType.Track) {
            trackCollections.set(element[1].id, new CollectionModel(element[1]))
          }
        } else if (element && element.id) {
          collections.set(element.id, new CollectionModel(element))

          if (element.type === CollectionType.Sample) {
            samplePacks.set(element.id, new CollectionModel(element))
          } else if (element.type === CollectionType.Track) {
            trackCollections.set(element.id, new CollectionModel(element))
          }
        }
      })

      this.collections = collections
      this.trackCollections = trackCollections
      this.samplePacks = samplePacks
    }
  }

  public updateProperty = (field: string, value: string) => {
    this[field] = value
  }

  public setId = (id: number) => {
    this.id = id
  }

  public setName = (name: string) => {
    this.name = name
  }

  public setUrlAlias = (urlAlias: string) => {
    this.urlAlias = urlAlias
  }

  public setWebsite = (website: string) => {
    this.website = website
  }

  public setHeroImageUrl = (heroImageUrl: string) => {
    this.heroImageUrl = heroImageUrl
  }

  public setHeroImageFileCatalogId = (heroImageFileCatalogId: number) => {
    this.heroImageFileCatalogId = heroImageFileCatalogId
  }

  public setProfileImageUrl = (profileImageUrl: string) => {
    this.profileImageUrl = profileImageUrl
  }

  public setProfileImageFileCatalogId = (profileImageFileCatalogId: number) => {
    this.profileImageFileCatalogId = profileImageFileCatalogId
  }

  public setCity = (city: string) => {
    this.city = city
  }

  public setState = (state: string) => {
    this.state = state
  }

  public setCountry = (country: string) => {
    this.country = country
  }

  public setBio = (bio: string) => {
    this.bio = bio
  }

  public setFacebookLink = (facebookLink: string) => {
    this.facebookLink = facebookLink
  }

  public setTwitterLink = (twitterLink: string) => {
    this.twitterLink = twitterLink
  }

  public setSoundCloud = (soundCloud: string) => {
    this.soundCloud = soundCloud
  }

  public setInstagram = (instagram: string) => {
    this.instagram = instagram
  }

  public setVerified = (verified: boolean) => {
    this.verified = verified
  }

  get nameInitial(): string {
    return this.name?.substring(0, 1)
  }

  get location(): string {
    let location = ''

    if (this.city && this.city.length > 0) {
      location = this.city
    }

    if (this.state && this.state.length > 0) {
      location += location.length > 0 ? ', ' : ''
      location += this.state
    }

    if (this.country && this.country.length > 0 && this.country !== 'United States') {
      location += location.length > 0 ? ', ' : ''
      location += this.country
    }

    return location
  }

  get asJson() {
    return {
      id: this.id,
      name: this.name,
      urlAlias: this.urlAlias,
      website: this.website,
      heroImageUrl: this.heroImageUrl,
      profileImageUrl: this.profileImageUrl,
      city: this.city,
      state: this.state,
      country: this.country,
      bio: this.bio,
      facebookLink: this.facebookLink,
      twitterLink: this.twitterLink,
      soundCloud: this.soundCloud,
      instagram: this.instagram,
      profileImageFileCatalogId: this.profileImageFileCatalogId,
      heroImageFileCatalogId: this.heroImageFileCatalogId,
    }
  }
}
