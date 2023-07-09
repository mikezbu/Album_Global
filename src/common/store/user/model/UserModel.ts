import LogRocket from 'logrocket'
import { action, computed, observable, makeObservable } from 'mobx'
import Bugsnag from 'src/util/Bugsnag'

export default class UserModel {
  public id = 0

  public firstName = ''

  public lastName = ''

  public phoneNumber = ''

  public email = ''

  public hasArtistProfile = false

  public enabled = false

  public accountLocked = false

  public accountExpired = false

  public artistId = 0

  public profilePictureFileCatalogId = 0

  public profilePictureUrl = ''

  public authorities = ''

  public emailVerified = false

  public artistSignUpOnBoardingStep = 0

  public timezone: string = null

  public updatedDate: Date = null

  public createdDate: Date = null

  public lastActivityDate: Date = null

  constructor(initialData: UserModel = null) {
    makeObservable(this, {
      id: observable,
      firstName: observable,
      lastName: observable,
      phoneNumber: observable,
      email: observable,
      authorities: observable,
      hasArtistProfile: observable,
      enabled: observable,
      accountLocked: observable,
      accountExpired: observable,
      artistId: observable,
      profilePictureFileCatalogId: observable,
      profilePictureUrl: observable,
      emailVerified: observable,
      updatedDate: observable,
      createdDate: observable,
      timezone: observable,
      lastActivityDate: observable,
      artistSignUpOnBoardingStep: observable,
      fullName: computed,
      nameInitials: computed,
      setValue: action,
      setId: action,
      setPhoneNumber: action,
      setFirstName: action,
      setLastName: action,
      setEmail: action,
      setHasArtistProfile: action,
      setEnabled: action,
      setAccountLocked: action,
      setAccountExpired: action,
      setArtistId: action,
      setTimezone: action,
      setProfilePictureUrl: action,
      setProfilePictureFileCatalogId: action,
      setArtistSignUpOnBoardingStep: action,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
      })

      this.updatedDate = new Date(initialData.updatedDate)
      this.createdDate = new Date(initialData.createdDate)

      Bugsnag.setUser(this.id.toString(), this.email, this.fullName)
      LogRocket.identify(this.id.toString(), {
        name: this.fullName,
        email: this.email,
        isArtist: this.artistId !== 0,
      })
    }
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get nameInitials(): string {
    return `${this.firstName.substring(0, 1)}${this.lastName.substring(0, 1)}`
  }

  public setValue = (name: string, value: string): void => {
    this[name] = value
  }

  public setId = (id: number) => {
    this.id = id
  }

  public setPhoneNumber = (phoneNumber: string) => {
    this.phoneNumber = phoneNumber
  }

  public setFirstName = (firstName: string) => {
    this.firstName = firstName
  }

  public setLastName = (lastName: string) => {
    this.lastName = lastName
  }

  public setEmail = (email: string) => {
    this.email = email
  }

  public setHasArtistProfile = (hasArtistProfile: boolean) => {
    this.hasArtistProfile = hasArtistProfile
  }

  public setEnabled = (enabled: boolean) => {
    this.enabled = enabled
  }

  public setAccountLocked = (accountLocked: boolean) => {
    this.accountLocked = accountLocked
  }

  public setAccountExpired = (accountExpired: boolean) => {
    this.accountExpired = accountExpired
  }

  public setArtistId = (artistId: number) => {
    this.artistId = artistId
  }

  public setTimezone = (timezone: string) => {
    this.timezone = timezone
  }

  public setProfilePictureUrl = (profilePictureUrl: string) => {
    this.profilePictureUrl = profilePictureUrl
  }

  public setProfilePictureFileCatalogId = (profilePictureFileCatalogId: number) => {
    this.profilePictureFileCatalogId = profilePictureFileCatalogId
  }

  public setArtistSignUpOnBoardingStep = (artistSignUpOnBoardingStep: number) => {
    this.artistSignUpOnBoardingStep = artistSignUpOnBoardingStep
  }

  public getAsUpdateJson = () => ({
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    profilePictureFileCatalogId: this.profilePictureFileCatalogId,
    email: this.email,
    timezone: this.timezone,
  })

  public getAsAdminUpdateJson = () => ({
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    profilePictureFileCatalogId: this.profilePictureFileCatalogId,
    email: this.email,
    enabled: this.enabled,
    accountLocked: this.accountLocked,
    accountExpired: this.accountExpired,
    authorities: this.authorities,
    timezone: this.timezone,
  })
}
