import { Button, Divider, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'
import Head from 'next/head'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import withAuth from 'src/common/components/withAuth'
import { KeyStore } from 'src/common/store'
import KeyModifyModal from 'src/modules/key/components/KeyModifyModal'
import KeyTable from 'src/modules/key/components/KeyTable'
import { Role } from 'src/modules/login/store'

interface IIndex {
  keyStore?: KeyStore
}

const Index = inject('keyStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public state = {
        modalOpen: false,
        createKey: false,
      }

      private readonly _keyStore: KeyStore

      constructor(props: IIndex) {
        super(props)

        this._keyStore = props.keyStore
      }

      public componentDidMount() {
        this._keyStore.fetchKeys()
      }

      public render() {
        return (
          <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
            <Head>
              <title key="title">Manage Keys</title>
            </Head>
            <div className="pb-4 text-xl font-medium text-primary-light">Manage Keys</div>

            <Divider style={{ marginBottom: '2em' }} />
            <Button
              aria-label="Create key"
              variant="contained"
              color="primary"
              onClick={this.openCreateModal}
              className="mb-8 self-end"
              size="small"
            >
              Create a Key
            </Button>
            {this._keyStore.loading ? (
              <div className="flex flex-wrap justify-center">
                <SkeletonLoader count={3} type="table" />
              </div>
            ) : (
              <>
                {this.state.modalOpen && (
                  <KeyModifyModal
                    open={this.state.modalOpen}
                    onClose={this.closeModal}
                    createKey={this.state.createKey}
                  />
                )}

                {this._keyStore.keys.size > 0 ? (
                  <KeyTable
                    onKeySelect={this.openEditModal}
                    selectedKeyId={this._keyStore.selectedKeyId}
                    data={this._keyStore.keys}
                    rowsPerPage={0}
                    totalCount={0}
                    setRowsPerPage={null}
                    setPageNumber={null}
                    setSort={null}
                    pageNumber={0}
                    sortColumn={null}
                    sortDirection={null}
                    showPagination={false}
                    disableSorting={true}
                  />
                ) : (
                  <div style={{ padding: '4em 0' }}>
                    <Typography variant="h6" align="center">
                      No keys found. Go ahead and create some
                    </Typography>
                  </div>
                )}
              </>
            )}
          </div>
        )
      }

      private openModal = () => {
        this.setState({ modalOpen: true })
      }

      private closeModal = () => {
        this.setState({ modalOpen: false })
        this._keyStore.resetCreateOrUpdate()
      }

      private openCreateModal = () => {
        this._keyStore.setKeyToCreateOrModify(-1)
        this.setState({ createKey: true })
        this.openModal()
      }

      private openEditModal = (keyId: number) => {
        this._keyStore.setKeyToCreateOrModify(keyId)
        this.setState({ createKey: false })
        this.openModal()
      }
    }
  )
)

export default withAuth(Index, Role.SuperAdmin)
