import { Button, Divider, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'
import Head from 'next/head'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import withAuth from 'src/common/components/withAuth'
import { InstrumentStore } from 'src/common/store'
import InstrumentModifyModal from 'src/modules/instrument/components/InstrumentModifyModal'
import InstrumentTable from 'src/modules/instrument/components/InstrumentTable'
import { Role } from 'src/modules/login/store'

interface IIndex {
  instrumentStore?: InstrumentStore
}

const Index = inject('instrumentStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public state = {
        modalOpen: false,
        createInstrument: false,
      }

      private readonly _instrumentStore: InstrumentStore

      constructor(props: IIndex) {
        super(props)

        this._instrumentStore = props.instrumentStore
      }

      public componentDidMount() {
        this._instrumentStore.fetchInstruments()
      }

      public render() {
        return (
          <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
            <Head>
              <title key="title">Manage Instrument</title>
            </Head>
            <div className="pb-4 text-xl font-medium text-primary-light">Manage Instrument</div>

            <Divider style={{ marginBottom: '2em' }} />
            <Button
              aria-label="Create instrument"
              variant="contained"
              color="primary"
              onClick={this.openCreateModal}
              className="mb-8 self-end"
              size="small"
            >
              Create an Instrument
            </Button>
            {this._instrumentStore.loading ? (
              <div className="flex flex-wrap justify-center">
                <SkeletonLoader count={3} type="table" />
              </div>
            ) : (
              <>
                {this.state.modalOpen && (
                  <InstrumentModifyModal
                    open={this.state.modalOpen}
                    onClose={this.closeModal}
                    createInstrument={this.state.createInstrument}
                  />
                )}

                {this._instrumentStore.instruments.size > 0 ? (
                  <InstrumentTable
                    onInstrumentSelect={this.openEditModal}
                    selectedInstrumentId={this._instrumentStore.selectedInstrumentId}
                    data={this._instrumentStore.instruments}
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
                      No instruments found. Go ahead and create some
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
        this._instrumentStore.resetCreateOrUpdate()
        this.setState({ modalOpen: false })
      }

      private openCreateModal = () => {
        this._instrumentStore.setInstrumentToCreateOrModify(-1)
        this.setState({ createInstrument: true })
        this.openModal()
      }

      private openEditModal = (instrumentId: number) => {
        this._instrumentStore.setInstrumentToCreateOrModify(instrumentId)
        this.setState({ createInstrument: false })
        this.openModal()
      }
    }
  )
)

export default withAuth(Index, Role.SuperAdmin)
