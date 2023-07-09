import { action, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import { getSamples, getSamplesByArtistId, updateSamplePlayCount } from 'src/modules/sample/api'
import { SampleModel } from 'src/modules/sample/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class ExploreSamples extends Paginator {
  public samples = observable.map<number, SampleModel>()

  public sampleIds = new Array<number>()

  public selectedSample: SampleModel = null

  public selectedSampleIdIndex = -1

  public selectedSampleId = -1

  public loading = false

  public paging = false

  constructor(initialData: ExploreSamples = null) {
    super()

    makeObservable(this, {
      samples: observable,
      sampleIds: observable,
      selectedSample: observable,
      selectedSampleIdIndex: observable,
      selectedSampleId: observable,
      loading: observable,
      paging: observable,
      selectSampleById: action,
      selectNextSample: action,
      selectPreviousSample: action,
      fetchSamples: action,
      fetchSamplesByArtistId: action,
      fetchSamplesCallback: action,
      incrementAndUpdatePlayCount: action,
    })

    if (initialData) {
      if (initialData.samples) {
        Object.values(initialData.samples).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.samples.set(element[1].id, new SampleModel(element[1]))
            this.sampleIds.push(element[1].id)
          } else if (element && element.id) {
            this.samples.set(element.id, new SampleModel(element))
            this.sampleIds.push(element.id)
          }
        })
      }
    }
  }

  public selectSampleById = (id: number) => {
    this.selectedSampleIdIndex = this.sampleIds.indexOf(id)
    if (this.selectedSampleIdIndex >= 0) {
      this.selectedSample = this.samples.get(id)
      this.selectedSampleId = this.selectedSample.id
    } else {
      this.selectedSample = null
      this.selectedSampleId = -1
    }
  }

  public selectNextSample = () => {
    if (this.selectedSample) {
      if (
        this.sampleIds.length &&
        this.selectedSampleIdIndex + 1 < this.sampleIds.length &&
        this.selectedSampleIdIndex + 1 >= 0
      ) {
        this.selectedSampleIdIndex += 1
        this.selectedSample = this.samples.get(this.sampleIds[this.selectedSampleIdIndex])
        this.selectedSampleId = this.selectedSample.id
      } else {
        this.selectedSampleIdIndex = -1
        this.selectedSample = null
        this.selectedSampleId = -1
      }
    }
  }

  public selectPreviousSample = () => {
    if (this.selectedSample) {
      if (
        this.sampleIds.length &&
        this.selectedSampleIdIndex - 1 < this.sampleIds.length &&
        this.selectedSampleIdIndex - 1 >= 0
      ) {
        this.selectedSampleIdIndex -= 1
        this.selectedSample = this.samples.get(this.sampleIds[this.selectedSampleIdIndex])
        this.selectedSampleId = this.selectedSample.id
      } else {
        this.selectedSampleIdIndex = -1
        this.selectedSample = null
        this.selectedSampleId = -1
      }
    }
  }

  public fetchSamples = (silent = false) => {
    if (!silent) {
      this.loading = true
    } else {
      this.paging = true
    }

    getSamples(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchSamplesCallback
    )
  }

  public fetchSamplesByArtistId = (artistId: number, silent = false) => {
    if (!silent) {
      this.loading = true
    }

    getSamplesByArtistId(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      artistId,
      this.fetchSamplesCallback
    )
  }

  public fetchSamplesCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.samples.clear()
      const sampleIds = new Array<number>()
      response.data.content.forEach(element => {
        this.samples.set(element.id, new SampleModel(element))
        sampleIds.push(element.id)
      })

      this.totalCount = response.data.totalElements
      this.sampleIds = sampleIds
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('No samples found')
    }

    this.loading = false
    this.paging = false
  }

  public incrementAndUpdatePlayCount = (sampleId: number) => {
    updateSamplePlayCount(sampleId, () => {})
  }
}
