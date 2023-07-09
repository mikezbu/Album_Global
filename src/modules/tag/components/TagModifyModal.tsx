import { Button, TextField } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React, { ChangeEvent } from 'react'

import Loading from 'src/common/components/layout/Loading'
import Modal from 'src/common/components/modal/Modal'
import { TagStore } from 'src/common/store'
import confirm from 'src/util/ConfirmationDialog'
interface ITagModifyModal {
  tagStore?: TagStore
  createTag?: boolean
  open: boolean
  onClose: () => void
}

const TagModifyModal = inject('tagStore')(
  observer(
    class TagModifyModal extends React.Component<ITagModifyModal> {
      static defaultProps = {
        createTag: false,
      }

      private readonly _tagStore: TagStore

      constructor(props: ITagModifyModal) {
        super(props)

        this._tagStore = props.tagStore
      }

      public componentDidUpdate() {
        if (this._tagStore.updatedSuccessfully || this._tagStore.createdSuccessfully) {
          this.onCloseModal()
        }
      }

      public render() {
        const { open } = this.props
        const tag = this._tagStore.tagToCreateOrModify

        return (
          <Modal
            title={`${this.getLabel()} Tag`}
            onClose={this.onCloseModal}
            open={open}
            fullWidth
            maxWidth="sm"
            content={
              <form onSubmit={this.onSubmit}>
                <div className="w-full p-3">
                  {this._tagStore.modifying && <Loading size={40} />}
                  <TextField
                    autoFocus
                    name="name"
                    fullWidth
                    required
                    type="text"
                    label="Tag Name"
                    onChange={this.handleInputChange('name')}
                    value={tag.name}
                    variant="filled"
                  />
                </div>
              </form>
            }
            actions={
              <div className="flex w-full justify-between">
                {!this.props.createTag && (
                  <>
                    <Button aria-label="Delete Tag" onClick={this.confirmDelete} size="small">
                      Delete
                    </Button>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <Button aria-label="Close" onClick={this.onCloseModal} size="small">
                          Close
                        </Button>
                      </div>
                      <Button
                        aria-label="Save"
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="small"
                        onClick={this.onSubmit}
                      >
                        Save
                      </Button>
                    </div>
                  </>
                )}

                {this.props.createTag && (
                  <>
                    <div className="mr-4">
                      <Button aria-label="Close" onClick={this.onCloseModal} size="small">
                        Close
                      </Button>
                    </div>
                    <Button
                      aria-label="Save"
                      variant="contained"
                      color="primary"
                      type="submit"
                      size="small"
                      onClick={this.onSubmit}
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            }
          />
        )
      }

      private confirmDelete = () => {
        confirm({
          title: 'Delete Tag?',
          message: 'Are you want to permanently delete this tag?',
          onAnswer: answer => this.handleDelete(answer),
          confirmActionText: 'Delete',
        })
      }

      private handleDelete = (answer: boolean) => {
        if (answer) {
          this._tagStore.deleteTag()
        }
      }

      private onSubmit = e => {
        e.preventDefault()
        if (this.props.createTag) {
          this._tagStore.createTag()
        } else {
          this._tagStore.updateTag()
        }
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._tagStore.updateTagToCreateOrModifyProperty(name, e.currentTarget.value)
      }

      private onCloseModal = () => {
        this._tagStore.resetCreateOrUpdate()
        this.props.onClose()

        setTimeout(() => {
          this.setState({ createTag: false })
          this._tagStore.resetCreateOrUpdate()
        }, 200)
      }

      private getLabel = (): string => {
        if (this.props.createTag) return 'Create'
        else return 'Edit'
      }
    }
  )
)

export default TagModifyModal
