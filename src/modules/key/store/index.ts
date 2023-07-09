import { action, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import { createKey, deleteKey, getKeys, updateKey } from 'src/modules/key/api'
import KeyModel from 'src/modules/key/store/model/KeyModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class KeyStore {
  public keys = observable.map<number, KeyModel>()

  public keyToCreateOrModify = new KeyModel()

  public selectedKeyId = -1

  public loading = false

  public loaded = false

  public modifying = false

  public updatedSuccessfully = false

  public createdSuccessfully = false

  constructor(initialData: KeyStore = null) {
    makeObservable(this, {
      keys: observable,
      keyToCreateOrModify: observable,
      selectedKeyId: observable,
      loading: observable,
      loaded: observable,
      modifying: observable,
      updatedSuccessfully: observable,
      createdSuccessfully: observable,
      resetCreateOrUpdate: action,
      resetFlags: action,
      updateKeyToCreateOrModifyProperty: action,
      setKeyToCreateOrModify: action,
      fetchKeys: action,
      fetchKeysCallback: action,
      createKey: action,
      createKeyCallback: action,
      updateKey: action,
      updateKeyCallback: action,
      deleteKey: action,
      deleteKeyCallback: action,
    })

    if (initialData && initialData.keys) {
      Object.values(initialData.keys).forEach((element: any) => {
        if (element && element[1] && element[1].id) {
          this.keys.set(element[1].id, new KeyModel(element[1]))
        } else if (element && element.id) {
          this.keys.set(element.id, new KeyModel(element))
        }
      })
    }
  }

  public resetCreateOrUpdate = () => {
    this.resetFlags()
    this.keyToCreateOrModify = new KeyModel()
    this.selectedKeyId = -1
  }

  public resetFlags = () => {
    this.loading = false
    this.createdSuccessfully = false
    this.updatedSuccessfully = false
    this.modifying = false
  }

  public fetchKeys = () => {
    this.loading = true
    getKeys(this.fetchKeysCallback)
  }

  public fetchKeysCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.keys.clear()

      response.data.forEach((key: KeyModel) => {
        this.keys.set(key.id, new KeyModel(key))
      })

      this.loaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Keys not found')
    }

    this.loading = false
  }

  public updateKeyToCreateOrModifyProperty = (property: string, value: string) => {
    this.keyToCreateOrModify.updateProperty(property, value)
  }

  public setKeyToCreateOrModify = (id: number) => {
    if (this.keys.has(id)) {
      this.keyToCreateOrModify = new KeyModel(this.keys.get(id))
      this.selectedKeyId = id
    }
  }

  public createKey = () => {
    this.modifying = true
    createKey(this.keyToCreateOrModify.getCreateJson, this.createKeyCallback)
  }

  public createKeyCallback = response => {
    if (isSuccessResponse(response)) {
      const key = new KeyModel()
      key.id = response.data.id
      key.name = response.data.name
      this.keys.set(response.data.id, key)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Key Created')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error Creating Key. ${response.data.message}`)
    }

    this.createdSuccessfully = true
    this.modifying = false
  }

  public updateKey = () => {
    this.modifying = true
    updateKey(
      this.keyToCreateOrModify.id,
      this.keyToCreateOrModify.getUpdateJson,
      this.updateKeyCallback
    )
  }

  public updateKeyCallback = response => {
    if (isSuccessResponse(response)) {
      const key = new KeyModel()
      key.id = response.data.id
      key.name = response.data.name
      this.keys.set(response.data.id, key)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Key Updated')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error Updating Key. ${response.data.message}`)
    }

    this.modifying = false
    this.updatedSuccessfully = true
  }

  public deleteKey = () => {
    this.modifying = true
    deleteKey(this.selectedKeyId, this.deleteKeyCallback)
  }

  public deleteKeyCallback = response => {
    if (isSuccessResponse(response)) {
      this.keys.delete(this.selectedKeyId)
      this.resetCreateOrUpdate()
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error while deleting key: ${response.data.message}`)
    }

    this.updatedSuccessfully = true
    this.modifying = false
  }
}
