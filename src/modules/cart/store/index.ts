import { action, computed, observable, makeObservable } from 'mobx'
import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import {
  checkout,
  createCart,
  getCartById,
  getCartByRequestorId,
  initializeCheckout,
  updateCart,
} from 'src/modules/cart/api'
import CartModel from 'src/modules/cart/store/model/CartModel'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
import { TrackModel } from 'src/modules/track/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export enum CartItemType {
  NA = 0,
  Collection = 1,
  Track = 2,
}

const isServer = typeof window === 'undefined'

export default class CartStore {
  public cart = new CartModel()

  public cartToMerge: CartModel = null

  public shouldMerge = false

  public billingFirstName = ''

  public billingLastName = ''

  public email = ''

  public loading = false

  public saveCard = false

  public initializingCheckout = false

  public paymentInProgress = false

  public paymentLoaded = false

  public paymentError = false

  public paymentSuccess = false

  public error = false

  public errorMsg = ''

  public stripeClientSecret = ''

  public paymentRequired = true

  public reset = () => {
    this.paymentInProgress = false
    this.paymentLoaded = false
    this.paymentError = false
    this.error = false
    this.errorMsg = ''
    this.stripeClientSecret = ''
    this.paymentRequired = true
    this.shouldMerge = false
    this.cartToMerge = null
  }

  public resetAll = () => {
    this.reset()
    this.cart = new CartModel()
  }

  public setPaymentInProgress = (paymentInProgress: boolean) => {
    this.paymentInProgress = paymentInProgress
  }

  public setPaymentSuccess = (paymentSuccess: boolean) => {
    this.paymentSuccess = paymentSuccess
  }

  // Tracks
  public addTrack = (track: TrackModel) => {
    if (this.cart) {
      this.cart.addTrack(track)

      getStore().appState.setMessage('Track added to cart')
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Info)

      this.createOrUpdateCart()
    }
  }

  public setBillingFirstName = (billingFirstName: string) => {
    this.billingFirstName = billingFirstName
  }

  public updateProperty = (property: string, value: string) => {
    this[property] = value
  }

  public setBillingLastName = (billingLastName: string) => {
    this.billingLastName = billingLastName
  }

  public setEmail = (email: string) => {
    this.email = email
  }

  public removeTrack = (idToRemove: number) => {
    if (this.cart) {
      this.cart.removeTrack(idToRemove)
      this.createOrUpdateCart()
    }
  }

  public toggleSaveCard = (saveCard: boolean) => {
    this.saveCard = saveCard
  }

  // Collections
  public addCollection = (collection: CollectionModel) => {
    if (this.cart) {
      this.cart.addCollection(collection)

      getStore().appState.setMessage('Collection added to cart')
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Info)

      this.createOrUpdateCart()
    }
  }

  public removeCollection = (idToRemove: number) => {
    if (this.cart) {
      this.cart.removeCollection(idToRemove)

      this.createOrUpdateCart()
    }
  }

  public initializeCart = () => {
    if (getStore().authenticationStore.authenticated) {
      if (this.cart != null && this.cart.id !== 0) {
        this.shouldMerge = localStorage.getItem('cart_id') !== null
        this.cartToMerge = new CartModel(this.cart)
      }
      localStorage.removeItem('cart_id')
      this.fetchCart()
    } else {
      const cartId = parseInt(localStorage.getItem('cart_id'), 10)
      if (cartId && cartId !== 0) {
        this.fetchCartById(cartId)
      }
    }
  }

  public reInitializeCart = (forceMerge = false) => {
    if (!isServer && (!this.shouldMerge || forceMerge)) {
      this.loading = true
      if (getStore().authenticationStore.authenticated) {
        getCartByRequestorId(this.reFetchCartCallback)
      } else {
        const cartId = parseInt(localStorage.getItem('cart_id'), 10)
        if (cartId && cartId !== 0) {
          getCartById(
            cartId,
            getStore().authenticationStore.authenticated,
            this.reFetchCartCallback
          )
        } else {
          this.loading = false
        }
      }
    }
  }

  public initializeCheckout = () => {
    if (this.cart.id !== 0) {
      this.initializingCheckout = true
      initializeCheckout(
        this.cart.id,
        getStore().authenticationStore.authenticated,
        this.initializeCheckoutCallback
      )
    }
  }

  public initializeCheckoutCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.stripeClientSecret = response.data.stripClientSecret
      this.paymentRequired = response.data.paymentRequired
      this.paymentError = false
      this.paymentLoaded = true
    } else {
      this.paymentError = true
      this.paymentLoaded = false
      getStore().appState.setMessage('Something went wrong while trying loading this page')
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
    }

    this.initializingCheckout = false
    this.loading = false
  }

  public createOrUpdateCart = () => {
    if (this.cart.id === 0) {
      this.createCart()
    } else {
      this.updateCart()
    }
  }

  public fetchCartById = (id: number) => {
    this.loading = true
    getCartById(id, getStore().authenticationStore.authenticated, this.fetchCartCallback)
  }

  private fetchCart = () => {
    this.loading = true
    getCartByRequestorId(this.fetchCartCallback)
  }

  public fetchCartCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.cart = new CartModel(response.data)

      if (this.shouldMerge && this.cartToMerge != null) {
        const updateModel: any = this.cartToMerge.getUpdateJson
        updateModel.collectionIds = [...updateModel.collectionIds, ...this.cart.collectionIds]
        updateModel.trackIds = [...updateModel.trackIds, ...this.cart.trackIds]

        updateCart(
          this.cart.id,
          updateModel,
          getStore().authenticationStore.authenticated,
          this.updateCallback
        )
      } else {
        this.loading = false
      }
    } else if (response.status === 404 && this.cart.id !== 0) {
      this.createCart()
    } else {
      localStorage.removeItem('cart_id')
      this.resetAll()
      this.loading = false
    }
  }

  public reFetchCartCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.cart = new CartModel(response.data)
    } else {
      localStorage.removeItem('cart_id')
      this.resetAll()
    }

    if (this.cart.totalItemCount > 0) {
      this.initializeCheckout()
    }

    this.loading = false
  }

  public updateCart = () => {
    updateCart(
      this.cart.id,
      this.cart.getUpdateJson,
      getStore().authenticationStore.authenticated,
      this.updateCallback
    )
  }

  public updateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.cart = new CartModel(response.data)

      if (this.shouldMerge) {
        this.reInitializeCart(true)
      }
    } else {
      this.resetAll()
    }

    this.shouldMerge = false
    this.cartToMerge = null

    this.loading = false
  }

  public createCart = () => {
    createCart(
      this.cart.getCreateJson,
      getStore().authenticationStore.authenticated,
      this.createCartCallback
    )
  }

  public createCartCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.cart = new CartModel(response.data)
      if (!getStore().authenticationStore.authenticated) {
        localStorage.setItem('cart_id', this.cart.id.toString())
      }

      if (this.shouldMerge) {
        this.reInitializeCart(true)
      }
    }

    this.shouldMerge = false
    this.cartToMerge = null

    this.loading = false
  }

  public checkout = () => {
    checkout(
      this.cart.id,
      this.checkoutJson,
      getStore().authenticationStore.authenticated,
      this.checkoutCallback
    )
  }

  public checkoutCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      localStorage.removeItem('cart_id')
      this.paymentSuccess = true
    } else {
      this.error = true
      this.errorMsg = response.data.message
    }

    this.paymentInProgress = false
  }

  constructor() {
    makeObservable<CartStore, 'fetchCart'>(this, {
      cart: observable,
      cartToMerge: observable,
      shouldMerge: observable,
      billingFirstName: observable,
      billingLastName: observable,
      email: observable,
      loading: observable,
      saveCard: observable,
      initializingCheckout: observable,
      paymentInProgress: observable,
      paymentLoaded: observable,
      paymentError: observable,
      paymentSuccess: observable,
      error: observable,
      errorMsg: observable,
      stripeClientSecret: observable,
      paymentRequired: observable,
      reset: action,
      resetAll: action,
      setPaymentInProgress: action,
      setPaymentSuccess: action,
      addTrack: action,
      setBillingFirstName: action,
      updateProperty: action,
      setBillingLastName: action,
      setEmail: action,
      removeTrack: action,
      toggleSaveCard: action,
      addCollection: action,
      removeCollection: action,
      initializeCart: action,
      reInitializeCart: action,
      initializeCheckout: action,
      initializeCheckoutCallback: action,
      fetchCartById: action,
      fetchCart: action,
      fetchCartCallback: action,
      reFetchCartCallback: action,
      updateCallback: action,
      createCartCallback: action,
      checkout: action,
      checkoutCallback: action,
      checkoutJson: computed,
    })
  }

  get checkoutJson() {
    return {
      billingFirstName: this.billingFirstName,
      billingLastName: this.billingLastName,
      email: this.email,
    }
  }
}
