import { action, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import { getCollectionsByType } from 'src/modules/collection/api'
import CollectionModel, { CollectionType } from 'src/modules/collection/store/model/CollectionModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class SamplePackStore extends Paginator {
  public samplePacks = new Map<number, CollectionModel>()

  public loading = false

  constructor(initialData: SamplePackStore = null) {
    super()

    makeObservable(this, {
      samplePacks: observable,
      loading: observable,
      setSamplePacks: action,
      fetchSamplePacks: action,
      fetchSamplePacksCallback: action,
    })

    if (initialData) {
      if (initialData.samplePacks) {
        Object.values(initialData.samplePacks).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.samplePacks.set(element[1].id, new CollectionModel(element[1]))
          } else if (element && element.id) {
            this.samplePacks.set(element.id, new CollectionModel(element))
          }
        })
      }
    }
  }

  public setSamplePacks = (samplePacks: Map<number, CollectionModel>) => {
    this.samplePacks = samplePacks
  }

  public fetchSamplePacks = () => {
    this.loading = true

    getCollectionsByType(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      CollectionType.Sample,
      this.fetchSamplePacksCallback
    )
  }

  public fetchSamplePacksCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      const samplePacks = new Map<number, CollectionModel>()

      response.data.content.forEach((element: any) => {
        samplePacks.set(element.id, new CollectionModel(element))
      })

      this.setSamplePacks(samplePacks)
      this.totalCount = response.data.totalElements
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('No sample packs found')
    }

    this.loading = false
  }
}
