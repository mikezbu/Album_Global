import { action, observable, makeObservable } from 'mobx'

import { createUser } from 'src/common/store/api/user'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class SignupStore {
  public email = ''

  public password = ''

  public passwordConfirmation = ''

  public firstName = ''

  public lastName = ''

  public phoneNumber = ''

  public timezone = ''

  public error = false

  public errorMsg = ''

  public accountCreated = false

  public firstNameError = false

  public lastNameError = false

  public emailError = false

  public passwordError = false

  public passwordConfirmationError = false

  public internalServerError = false

  public emailExists = false

  public passwordsDoNotMatch = false

  public passwordNotLongEnough = false

  public fieldChanged = false

  public accountCreationInProgress = false

  constructor(initialData = null) {
    makeObservable(this, {
      email: observable,
      password: observable,
      passwordConfirmation: observable,
      firstName: observable,
      lastName: observable,
      phoneNumber: observable,
      timezone: observable,
      error: observable,
      errorMsg: observable,
      accountCreated: observable,
      firstNameError: observable,
      lastNameError: observable,
      emailError: observable,
      passwordError: observable,
      passwordConfirmationError: observable,
      internalServerError: observable,
      emailExists: observable,
      passwordsDoNotMatch: observable,
      passwordNotLongEnough: observable,
      fieldChanged: observable,
      accountCreationInProgress: observable,
      reset: action,
      resetErrors: action,
      setValue: action,
      updateError: action,
      signup: action,
      signupCallback: action,
      submissionHasErrors: action,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
      })
    }
  }

  public reset = () => {
    this.firstName = ''
    this.lastName = ''
    this.email = ''
    this.password = ''
    this.passwordConfirmation = ''
    this.accountCreated = false
    this.accountCreationInProgress = false
  }

  public resetErrors = () => {
    this.error = false
    this.errorMsg = ''
    this.firstNameError = false
    this.lastNameError = false
    this.emailError = false
    this.passwordError = false
    this.passwordConfirmationError = false
    this.internalServerError = false
    this.emailExists = false
    this.passwordsDoNotMatch = false
    this.passwordNotLongEnough = false
    this.fieldChanged = false
  }

  public setValue = (name: string, value: string) => {
    this[name] = value
    this.updateError(name)
    this.fieldChanged = true
  }

  public updateError = (field: string) => {
    if (this[`${field}Error`]) {
      this[`${field}Error`] = false
    }
  }

  public signup = () => {
    this.accountCreationInProgress = true
    const body = this.getAsJson()
    createUser(body, this.signupCallback)
  }

  public signupCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.resetErrors()
      this.accountCreated = true
    } else {
      this.error = true
      this.errorMsg = response.data.message
    }

    this.accountCreationInProgress = false
  }

  public submissionHasErrors = (): boolean => {
    this.resetErrors()

    let error = false

    if (this.firstName === '') {
      this.firstNameError = true
      error = true
    }

    if (this.lastName === '') {
      this.lastNameError = true
      error = true
    }

    if (this.email === '') {
      this.emailError = true
      error = true
    }

    if (this.password === '') {
      this.passwordError = true
      error = true
    }

    if (this.passwordConfirmation === '') {
      this.passwordConfirmationError = true
      error = true
    }

    if (
      !this.passwordError &&
      !this.passwordConfirmationError &&
      this.password !== this.passwordConfirmation
    ) {
      this.passwordsDoNotMatch = true
      this.passwordConfirmationError = true
      this.passwordError = true
      error = true
    }

    if (
      !this.passwordError &&
      !this.passwordConfirmationError &&
      !this.passwordsDoNotMatch &&
      this.password.length < 6
    ) {
      this.passwordNotLongEnough = true
      this.passwordConfirmationError = true
      this.passwordError = true
      error = true
    }

    if (error) {
      this.error = true
      this.errorMsg = 'The following fields are required.'
    }

    return error
  }

  public getAsJson = () => ({
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    email: this.email,
    password: this.password,
    timezone: this.timezone,
  })
}
