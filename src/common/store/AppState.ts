import axios from 'axios'
import { action, computed, observable, makeObservable, runInAction } from 'mobx'
import { getExchangeRates } from 'src/modules/price/api'
import ExchangeRateModel from 'src/modules/price/store/model/ExchangeRateModel'
import { Currency } from 'src/modules/price/store/model/PriceModel'
import { TrackModel } from 'src/modules/track/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export enum MessageVariant {
  Info = 'info',
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
}

export default class AppState {
  public exchangeRates = observable.map<string, ExchangeRateModel>()

  public refreshToken = ''

  public errorMsg = ''

  public error = false

  public showMessage = false

  public message = ''

  public messageVariant: string = MessageVariant.Info

  public apiServerUnreachable = false

  public apiLoading = false

  public openSignUpModal = false

  public openLoginModal = false

  public track: TrackModel = null

  public isTrackPlaying = false

  public drawerOpen = false

  public isDrawerVisible = true

  public userLocationLoaded = false

  public userCountry = 'United States'

  public region = 'United States'

  public countryCode = 'US'

  public onPlay: () => void = null

  public onPause: () => void = null

  public onStop: () => void = null

  public onNext: () => void = null

  public onPrevious: () => void = null

  public incrementAndUpdatePlayCount: () => void = null

  public isSamplePlaying = false

  public exchangeRatesLoaded = false

  constructor(initialData: AppState = null) {
    makeObservable<AppState, 'loadUserLocation'>(this, {
      exchangeRates: observable,
      refreshToken: observable,
      errorMsg: observable,
      error: observable,
      showMessage: observable,
      message: observable,
      messageVariant: observable,
      apiServerUnreachable: observable,
      apiLoading: observable,
      openSignUpModal: observable,
      openLoginModal: observable,
      track: observable,
      isTrackPlaying: observable,
      drawerOpen: observable,
      isDrawerVisible: observable,
      userLocationLoaded: observable,
      userCountry: observable,
      region: observable,
      countryCode: observable,
      onPlay: observable,
      onPause: observable,
      onStop: observable,
      onNext: observable,
      onPrevious: observable,
      incrementAndUpdatePlayCount: observable,
      isSamplePlaying: observable,
      exchangeRatesLoaded: observable,
      setApiLoading: action,
      setShowMessage: action,
      setMessage: action,
      setMessageVariant: action,
      setOpenSignupModal: action,
      setOpenLoginModal: action,
      showAPIServerUnreachableMessage: action,
      hideAPIServerUnreachableMessage: action,
      setTrack: action,
      setIsTrackPlaying: action,
      setOnPlay: action,
      setOnPause: action,
      setOnStop: action,
      setOnNext: action,
      setOnPrevious: action,
      setIncrementAndUpdatePlayCount: action,
      setisSamplePlaying: action,
      handleDrawerToggle: action,
      hideDrawer: action,
      showDrawer: action,
      getExchangeRatesCallback: action,
      loadUserLocation: action,
      localCurrency: computed,
    })

    if (initialData) {
      this.isDrawerVisible = initialData.isDrawerVisible
      if (initialData.exchangeRates) {
        const exchangeRates = observable.map<string, ExchangeRateModel>()
        Object.values(initialData.exchangeRates).forEach((element: any) => {
          if (element) {
            this.exchangeRates.set(
              `${element.sourceCurrency}-${element.targetCurrency}`,
              new ExchangeRateModel(element)
            )
          }
        })
        this.exchangeRates = exchangeRates
        this.exchangeRatesLoaded = true
      }
    } else {
      if (!this.exchangeRatesLoaded) {
        this.getExchangeRates()
      }
    }

    if (!this.userLocationLoaded) {
      this.loadUserLocation()
    }
  }

  public setApiLoading(apiLoading: boolean) {
    this.apiLoading = apiLoading
  }

  public setShowMessage = (showMessage: boolean): void => {
    this.showMessage = showMessage
  }

  public setMessage = (message: string): void => {
    this.message = message
  }

  public setMessageVariant = (messageVariant: MessageVariant): void => {
    this.messageVariant = messageVariant
  }

  public setOpenSignupModal = (openSignUpModal: boolean) => {
    this.openSignUpModal = openSignUpModal
  }

  public setOpenLoginModal = (openLoginModal: boolean) => {
    this.openLoginModal = openLoginModal
  }

  public showError = (message: string) => {
    this.message = message
    this.messageVariant = MessageVariant.Error
    this.showMessage = true
  }

  public showSuccess = (message: string) => {
    this.message = message
    this.messageVariant = MessageVariant.Info
    this.showMessage = true
  }

  public showInfo = (message: string) => {
    this.message = message
    this.messageVariant = MessageVariant.Info
    this.showMessage = true
  }

  public showWarning = (message: string) => {
    this.message = message
    this.messageVariant = MessageVariant.Warning
    this.showMessage = true
  }

  public showAPIServerUnreachableMessage = () => {
    this.apiServerUnreachable = true
    this.showMessage = true
    this.errorMsg = 'Unable to reach our servers. Please try again later'
  }

  public hideAPIServerUnreachableMessage = () => {
    this.apiServerUnreachable = false
  }

  public setTrack = (track: TrackModel) => {
    this.track = track
  }

  public setIsTrackPlaying = (isTrackPlaying: boolean) => {
    this.isTrackPlaying = isTrackPlaying
  }

  public setOnPlay = (onPlay: () => void) => {
    this.onPlay = onPlay
  }

  public setOnPause = (onPause: () => void) => {
    this.onPause = onPause
  }

  public setOnStop = (onStop: () => void) => {
    this.onStop = onStop
  }

  public setOnNext = (onNext: () => void) => {
    this.onNext = onNext
  }

  public setOnPrevious = (onPrevious: () => void) => {
    this.onPrevious = onPrevious
  }

  public setIncrementAndUpdatePlayCount = (incrementAndUpdatePlayCount: () => void) => {
    this.incrementAndUpdatePlayCount = incrementAndUpdatePlayCount
  }

  public setisSamplePlaying = (isSamplePlaying: boolean) => {
    this.isSamplePlaying = isSamplePlaying
  }

  public handleDrawerToggle = () => {
    this.drawerOpen = !this.drawerOpen
  }

  public hideDrawer = () => {
    this.isDrawerVisible = false
  }

  public showDrawer = () => {
    this.isDrawerVisible = true
  }

  public getExchangeRates = () => {
    getExchangeRates(this.getExchangeRatesCallback)
  }

  public getExchangeRatesCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.exchangeRates.clear()
      response.data.forEach((exchangeRate: ExchangeRateModel) => {
        this.exchangeRates.set(this.getKey(exchangeRate), new ExchangeRateModel(exchangeRate))
      })

      this.exchangeRatesLoaded = true
    }
  }

  private getKey = (exchangeRate: ExchangeRateModel) => {
    return `${exchangeRate.sourceCurrency}-${exchangeRate.targetCurrency}`
  }

  private loadUserLocation = () => {
    axios.get('http://ip-api.com/json').then((response: any) => {
      if (isSuccessResponse(response)) {
        runInAction(() => {
          this.userCountry = response.data.country
          this.countryCode = response.data.countryCode
          this.region = response.data.region
          this.userLocationLoaded = true
        })
      }
    })
  }

  get localCurrency(): Currency {
    switch (this.countryCode) {
      case 'ET':
        return Currency.ETB
      case 'US':
        return Currency.USD
      case 'UK':
        return Currency.GBP
      case 'EU':
        return Currency.EUR
      default:
        return Currency.USD
    }
  }
}
