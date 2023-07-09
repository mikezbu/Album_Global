import { action, computed, observable, runInAction, makeObservable } from 'mobx'

import jwt_decode from 'jwt-decode'
import { getStore } from 'src/common/store'
import { getUserFromRequestContext, impersonateUser } from 'src/common/store/api/user'
import { MessageVariant } from 'src/common/store/AppState'
import { checkToken, login, reAuthenticate } from 'src/modules/login/api/Authentication'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

const isServer = typeof window === 'undefined'

export enum Role {
  User = 'ROLE_USER',
  Admin = 'ROLE_ADMIN',
  SuperAdmin = 'ROLE_SUPER_ADMIN',
}

export default class Authentication {
  public authorities: string[] = []

  public inImpersonation: boolean = false

  public authenticated = false

  public authenticationInProgress = false

  public reAuthenticationAttempted = false

  public refreshTokenAttempted = false

  public redirectUrl = '/'

  public email = ''

  public password = ''

  public errorMsg = ''

  public error = false

  public emailError = false

  public disableLoginButton = false

  public passwordConfirmation = ''

  public passwordError = false

  public passwordConfirmationError = false

  public passwordsDoNotMatch = false

  public passwordNotLongEnough = false

  public passwordResetToken = ''

  public emailVerificationToken = ''

  constructor(initialData = null) {
    makeObservable(this, {
      inImpersonation: observable,
      authorities: observable,
      authenticated: observable,
      authenticationInProgress: observable,
      reAuthenticationAttempted: observable,
      refreshTokenAttempted: observable,
      redirectUrl: observable,
      email: observable,
      password: observable,
      errorMsg: observable,
      error: observable,
      emailError: observable,
      disableLoginButton: observable,
      passwordConfirmation: observable,
      passwordError: observable,
      passwordConfirmationError: observable,
      passwordsDoNotMatch: observable,
      passwordNotLongEnough: observable,
      passwordResetToken: observable,
      emailVerificationToken: observable,
      reset: action,
      resetFlags: action,
      setRedirectUrl: action,
      setEmailVerificationToken: action,
      setValue: action,
      setPasswordResetToken: action,
      updateError: action,
      isEmailEmpty: computed,
      isPasswordEmpty: computed,
      submissionHasErrors: action,
      isAdmin: action,
      login: action,
      loginCallback: action,
      checkTokenAccess: action,
      checkTokenAccessCallback: action,
      reAuthenticate: action,
      reAuthenticationCallback: action,
      forgotPassword: action,
      logout: action,
      getCredentialsAsJson: computed,
      setReAuthenticationAttempted: action,
      setRefreshTokenAttempted: action,
      setAuthenticated: action,
      impersonateUser: action,
      impersonateUserCallback: action,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
      })
    }

    if (!isServer) {
      this.inImpersonation = localStorage.getItem('in_impersonation') === 'true'
    }
  }

  public reset = (): void => {
    this.email = ''
    this.password = ''
    this.passwordResetToken = ''
    this.emailVerificationToken = ''

    this.resetFlags()
  }

  public resetFlags = (): void => {
    this.errorMsg = ''
    this.error = false
    this.emailError = false
    this.passwordError = false
    this.passwordConfirmationError = false
    this.passwordsDoNotMatch = false
    this.passwordNotLongEnough = false
    this.disableLoginButton = true
  }

  public setRedirectUrl = (redirectUrl: string): void => {
    this.redirectUrl = redirectUrl
  }

  public setEmailVerificationToken = (emailVerificationToken: string): void => {
    this.emailVerificationToken = emailVerificationToken
  }

  public setValue = (name: string, value: string): void => {
    this[name] = value
    this.updateError(name)
  }

  public setPasswordResetToken = (passwordResetToken: string): void => {
    this.passwordResetToken = passwordResetToken
  }

  public updateError = (field: string): void => {
    if (this[`${field}Error`]) {
      this[`${field}Error`] = false
    }

    if (!this.isEmailEmpty && !this.isPasswordEmpty) {
      this.disableLoginButton = false
    }
  }

  get isEmailEmpty(): boolean {
    return this.email === ''
  }

  get isPasswordEmpty(): boolean {
    return this.password === ''
  }

  public submissionHasErrors = (): boolean => {
    this.resetFlags()

    let error = false

    if (this.isPasswordEmpty) {
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
    }

    return error
  }

  public isAdmin = (): boolean => {
    return this.authorities.indexOf(Role.Admin) >= 0
  }

  public isSuperAdmin = (): boolean => {
    return this.authorities.indexOf(Role.SuperAdmin) >= 0
  }

  public hasRole = (role: string): boolean => {
    return this.authorities.indexOf(role) >= 0
  }

  public login = (): Promise<any> => {
    if (!this.isEmailEmpty && !this.isPasswordEmpty) {
      this.authenticationInProgress = true
      return login(this.getCredentialsAsJson, this.loginCallback)
    } else {
      this.error = true
      this.errorMsg = 'Type in your email and password'

      return Promise.reject()
    }
  }

  public loginCallback = async (response: any): Promise<void> => {
    if (isSuccessResponse(response)) {
      this.authenticated = true

      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('access_token', response.data.access_token)
      const decodedJwt = jwt_decode(response.data.access_token) as any
      runInAction(() => {
        this.authorities = decodedJwt.authorities
      })
      this.reset()

      await getUserFromRequestContext(getStore().userStore.getUserInformationCallback)
    } else {
      this.error = true
      this.errorMsg = 'Email or password is incorrect'
      this.disableLoginButton = true
    }

    this.authenticationInProgress = false
  }

  public checkTokenAccess = (): void => {
    if (
      !this.authenticationInProgress &&
      !this.reAuthenticationAttempted &&
      !this.authenticated &&
      this.getAccessToken() &&
      this.getRefreshToken()
    ) {
      this.authenticationInProgress = true

      checkToken(this.getAccessToken(), this.checkTokenAccessCallback)
    }
  }

  public checkTokenAccessCallback = async (response: any): Promise<void> => {
    if (isSuccessResponse(response)) {
      this.authenticated = true
      this.reAuthenticationAttempted = false
      this.error = false
      this.authorities = response.data.authorities
      if (!isServer) {
        this.inImpersonation = localStorage.getItem('in_impersonation') === 'true'
      }
      await getUserFromRequestContext(getStore().userStore.getUserInformationCallback)
      runInAction(() => {
        this.authenticationInProgress = false
      })
    } else {
      this.reAuthenticate()
    }
  }

  public impersonateUser = (userId: number): void => {
    this.authenticationInProgress = true
    impersonateUser(userId, this.impersonateUserCallback)
  }

  public reAuthenticate = (forceReauthentication = false): void => {
    if (
      !this.reAuthenticationAttempted &&
      (!this.authenticated || forceReauthentication) &&
      this.getRefreshToken()
    ) {
      this.reAuthenticationAttempted = true
      this.authenticationInProgress = true

      reAuthenticate(this.getRefreshTokenAsJson(), this.reAuthenticationCallback)
    }
  }

  public reAuthenticationCallback = async (response: any) => {
    if (isSuccessResponse(response)) {
      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('access_token', response.data.access_token)
      const decodedJwt = jwt_decode(response.data.access_token) as any
      runInAction(() => {
        this.authorities = decodedJwt.authorities
      })
      this.authenticated = true
      this.reAuthenticationAttempted = false
      this.error = false
      await getUserFromRequestContext(getStore().userStore.getUserInformationCallback)
      runInAction(() => {
        this.authenticationInProgress = false
      })
    } else {
      this.authenticationInProgress = false
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('access_token')
    }
  }

  public impersonateUserCallback = async (response: any) => {
    if (isSuccessResponse(response)) {
      localStorage.setItem('previous_refresh_token', this.getRefreshToken())
      localStorage.setItem('previous_access_token', this.getAccessToken())
      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('in_impersonation', 'true')
      this.inImpersonation = true

      const decodedJwt = jwt_decode(response.data.access_token) as any
      runInAction(() => {
        this.authorities = decodedJwt.authorities
      })
      this.authenticated = true
      this.reAuthenticationAttempted = false
      this.error = false
      await getUserFromRequestContext(getStore().userStore.getUserInformationCallback)
      runInAction(() => {
        this.authenticationInProgress = false
      })
    } else {
      getStore().appState.setMessage('An error occurred while trying to impersonate user')
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
    }
  }

  public forgotPassword = (): void => {
    if (!this.isEmailEmpty) {
      getStore().userStore.forgotPassword(this.email)
    } else {
      this.error = true
      this.emailError = true
      this.errorMsg = 'Email is a required field'
    }
  }

  public resetPassword = (): void => {
    getStore().userStore.resetPassword(this.passwordResetToken, this.password)
  }

  public logout = (): void => {
    if (this.inImpersonation) {
      localStorage.setItem('refresh_token', this.getPreviousRefreshToken())
      localStorage.setItem('access_token', this.getPreviousAccessToken())
      localStorage.removeItem('previous_refresh_token')
      localStorage.removeItem('previous_access_token')
      localStorage.removeItem('in_impersonation')
      this.inImpersonation = false
      this.reAuthenticate(true)
      getStore().appState.setMessage('Returning back from impersonation')
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Info)
    } else {
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('access_token')
      this.authenticated = false
      this.reset()
      getStore().userStore.reset()
      getStore().cartStore.resetAll()
      this.reAuthenticationAttempted = false
      this.refreshTokenAttempted = false

      getStore().appState.setMessage('Logged out successfully')
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Info)
    }
  }

  get getCredentialsAsJson() {
    return {
      grant_type: 'password',
      username: encodeURI(this.email),
      password: encodeURI(this.password),
    }
  }

  public getRefreshToken = (): string => {
    return localStorage.getItem('refresh_token')
  }

  public getAccessToken = (): string => {
    return localStorage.getItem('access_token')
  }

  public getPreviousRefreshToken = (): string => {
    return localStorage.getItem('previous_refresh_token')
  }

  public getPreviousAccessToken = (): string => {
    return localStorage.getItem('previous_access_token')
  }

  public getRefreshTokenAsJson = () => ({
    grant_type: 'refresh_token',
    refresh_token: this.getRefreshToken(),
  })

  public setReAuthenticationAttempted = (reAuthenticationAttempted: boolean): void => {
    this.reAuthenticationAttempted = reAuthenticationAttempted
  }

  public setRefreshTokenAttempted = (refreshTokenAttempted: boolean): void => {
    this.refreshTokenAttempted = refreshTokenAttempted
  }

  public setAuthenticated = (authenticated: boolean): void => {
    this.authenticated = authenticated
  }
}
