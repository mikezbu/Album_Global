import { Button, Divider, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'
import Head from 'next/head'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import withAuth from 'src/common/components/withAuth'
import { GenreStore } from 'src/common/store'
import GenreModifyModal from 'src/modules/genre/components/GenreModifyModal'
import GenreTable from 'src/modules/genre/components/GenreTable'
import { Role } from 'src/modules/login/store'

interface IIndex {
  genreStore?: GenreStore
}

const Index = inject('genreStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public state = {
        modalOpen: false,
        createGenre: false,
      }

      private readonly _genreStore: GenreStore

      constructor(props: IIndex) {
        super(props)

        this._genreStore = props.genreStore
      }

      public componentDidMount() {
        this._genreStore.fetchGenres()
      }

      public render() {
        return (
          <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
            <Head>
              <title key="title">Manage Genres</title>
            </Head>
            <div className="pb-4 text-xl font-medium text-primary-light">Manage Genres</div>
            <Divider style={{ marginBottom: '2em' }} />
            <Button
              aria-label="Create genre"
              variant="contained"
              color="primary"
              onClick={this.openCreateModal}
              className="mb-8 self-end"
              size="small"
            >
              Create a Genre
            </Button>
            {this._genreStore.loading ? (
              <div className="flex flex-wrap justify-center">
                <SkeletonLoader count={3} type="table" />
              </div>
            ) : (
              <>
                {this.state.modalOpen && (
                  <GenreModifyModal
                    open={this.state.modalOpen}
                    onClose={this.closeModal}
                    createGenre={this.state.createGenre}
                  />
                )}

                {this._genreStore.genres.size > 0 ? (
                  <GenreTable
                    onGenreSelect={this.openEditModal}
                    selectedGenreId={this._genreStore.selectedGenreId}
                    data={this._genreStore.genres}
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
                      No genres found. Go ahead and create some
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
        this._genreStore.resetCreateOrUpdate()
        this.setState({ modalOpen: false })
      }

      private openCreateModal = () => {
        this._genreStore.setGenreToCreateOrModify(-1)
        this.setState({ createGenre: true })
        this.openModal()
      }

      private openEditModal = (genreId: number) => {
        this._genreStore.setGenreToCreateOrModify(genreId)
        this.setState({ createGenre: false })
        this.openModal()
      }
    }
  )
)

export default withAuth(Index, Role.SuperAdmin)
