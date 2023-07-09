import { Button, TextField } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React, { ChangeEvent } from 'react'

import Loading from 'src/common/components/layout/Loading'
import Modal from 'src/common/components/modal/Modal'
import { KeyStore } from 'src/common/store'
import confirm from 'src/util/ConfirmationDialog'
interface IKeyModifyModal {
  keyStore?: KeyStore
  createKey?: boolean
  open: boolean
  onClose: () => void
}

const KeyModifyModal = inject('keyStore')(
  observer(
    class KeyModifyModal extends React.Component<IKeyModifyModal> {
      static defaultProps = {
        createKey: false,
      }

      private readonly _keyStore: KeyStore

      constructor(props: IKeyModifyModal) {
        super(props)

        this._keyStore = props.keyStore
      }

      public componentDidUpdate() {
        if (this._keyStore.updatedSuccessfully || this._keyStore.createdSuccessfully) {
          this.onCloseModal()
        }
      }

      public render() {
        const { open } = this.props
        const key = this._keyStore.keyToCreateOrModify

        return (
          <Modal
            title={`${this.getLabel()} Key`}
            onClose={this.onCloseModal}
            open={open}
            fullWidth
            maxWidth="sm"
            content={
              <form onSubmit={this.onSubmit}>
                <div className="w-full p-3">
                  {this._keyStore.modifying && <Loading size={40} />}
                  <TextField
                    autoFocus
                    name="name"
                    fullWidth
                    required
                    type="text"
                    label="Key Name"
                    onChange={this.handleInputChange('name')}
                    value={key.name}
                    variant="filled"
                  />
                </div>
              </form>
            }
            actions={
              <div className="flex w-full justify-between">
                {!this.props.createKey && (
                  <>
                    <Button aria-label="Delete Key" onClick={this.confirmDelete} size="small">
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

                {this.props.createKey && (
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
          title: 'Delete Key?',
          message: 'Are you want to permanently delete this key?',
          onAnswer: answer => this.handleDelete(answer),
          confirmActionText: 'Delete',
        })
      }

      private handleDelete = (answer: boolean) => {
        if (answer) {
          this._keyStore.deleteKey()
        }
      }

      private onSubmit = e => {
        e.preventDefault()
        if (this.props.createKey) {
          this._keyStore.createKey()
        } else {
          this._keyStore.updateKey()
        }
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._keyStore.updateKeyToCreateOrModifyProperty(name, e.currentTarget.value)
      }

      private onCloseModal = () => {
        this._keyStore.resetCreateOrUpdate()
        this.props.onClose()

        setTimeout(() => {
          this.setState({ createKey: false })
          this._keyStore.resetCreateOrUpdate()
        }, 200)
      }

      private getLabel = (): string => {
        if (this.props.createKey) return 'Create'
        else return 'Edit'
      }
    }
  )
)

export default KeyModifyModal
