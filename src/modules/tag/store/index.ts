import { action, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import { createTag, deleteTag, getTag, getTags, updateTag } from 'src/modules/tag/api'
import TagModel from 'src/modules/tag/store/model/TagModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class TagStore extends Paginator {
  public tags = observable.map<number, TagModel>()

  public tag = new TagModel()

  public tagToCreateOrModify = new TagModel()

  public selectedTagId = -1

  public loading = false

  public loaded = false

  public modifying = false

  public updatedSuccessfully = false

  public createdSuccessfully = false

  constructor(initialData: TagStore = null) {
    super()

    makeObservable(this, {
      tags: observable,
      tag: observable,
      tagToCreateOrModify: observable,
      selectedTagId: observable,
      loading: observable,
      loaded: observable,
      modifying: observable,
      updatedSuccessfully: observable,
      createdSuccessfully: observable,
      addTag: action,
      resetCreateOrUpdate: action,
      resetFlags: action,
      updateTagToCreateOrModifyProperty: action,
      setTagToCreateOrModify: action,
      fetchTag: action,
      fetchTagCallback: action,
      fetchTags: action,
      fetchTagsCallback: action,
      createTag: action,
      createTagCallback: action,
      updateTag: action,
      updateTagCallback: action,
      deleteTag: action,
      deleteTagCallback: action,
    })

    if (initialData) {
      if (initialData.tags) {
        Object.values(initialData.tags).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.tags.set(element[1].id, new TagModel(element[1]))
          } else if (element && element.id) {
            this.tags.set(element.id, new TagModel(element))
          }
        })
      }

      this.tag = new TagModel(initialData.tag)
    }
  }

  public resetCreateOrUpdate = () => {
    this.resetFlags()
    this.tagToCreateOrModify = new TagModel()
    this.selectedTagId = -1
  }

  public resetFlags = () => {
    this.loading = false
    this.createdSuccessfully = false
    this.updatedSuccessfully = false
    this.modifying = false
  }

  public addTag = (tag: TagModel) => {
    this.tags.set(tag.id, tag)
  }

  public fetchTag = (id: number) => {
    this.loading = true
    getTag(id, this.fetchTagsCallback)
  }

  public fetchTagCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.tag = new TagModel(response.data)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Tag not found')
    }

    this.loading = false
  }

  public fetchTags = () => {
    this.loading = true
    getTags(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchTagsCallback
    )
  }

  public fetchTagsCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.tags.clear()

      response.data.content.forEach((tag: TagModel) => {
        this.tags.set(tag.id, new TagModel(tag))
      })

      this.totalCount = response.data.totalElements

      this.loaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Tags not found')
    }

    this.loading = false
  }

  public updateTagToCreateOrModifyProperty = (property: string, value: string) => {
    this.tagToCreateOrModify.updateProperty(property, value)
  }

  public setTagToCreateOrModify = (id: number) => {
    if (this.tags.has(id)) {
      this.tagToCreateOrModify = new TagModel(this.tags.get(id))
      this.selectedTagId = id
    }
  }

  public createTag = () => {
    this.modifying = true
    createTag(this.tagToCreateOrModify.getCreateJson, this.createTagCallback)
  }

  public createTagCallback = response => {
    if (isSuccessResponse(response)) {
      const tag = new TagModel()
      tag.id = response.data.id
      tag.name = response.data.name
      this.tags.set(response.data.id, tag)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Tag Created')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error creating Tag. ${response.data.message}`)
    }

    this.createdSuccessfully = true
    this.modifying = false
  }

  public updateTag = () => {
    this.modifying = true
    updateTag(
      this.tagToCreateOrModify.id,
      this.tagToCreateOrModify.getUpdateJson,
      this.updateTagCallback
    )
  }

  public updateTagCallback = response => {
    if (isSuccessResponse(response)) {
      const tag = new TagModel()
      tag.id = response.data.id
      tag.name = response.data.name
      this.tags.set(response.data.id, tag)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Tag Updated')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error updating Tag. ${response.data.message}`)
    }

    this.modifying = false
    this.updatedSuccessfully = true
  }

  public deleteTag = () => {
    this.modifying = true
    deleteTag(this.selectedTagId, this.deleteTagCallback)
  }

  public deleteTagCallback = response => {
    if (isSuccessResponse(response)) {
      this.tags.delete(this.selectedTagId)
      this.resetCreateOrUpdate()
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error while deleting tag: ${response.data.message}`)
    }

    this.updatedSuccessfully = true
    this.modifying = false
  }
}
