import { Button, Divider, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'
import Head from 'next/head'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import withAuth from 'src/common/components/withAuth'
import { TagStore } from 'src/common/store'
import TagModifyModal from 'src/modules/tag/components/TagModifyModal'
import TagTable from 'src/modules/tag/components/TagTable'
import { Order } from 'src/common/store/util/Paginator'
import { Role } from 'src/modules/login/store'

interface IIndex {
  tagStore?: TagStore
}

const Index = inject('tagStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public state = {
        modalOpen: false,
        createTag: false,
      }

      private readonly _tagStore: TagStore

      constructor(props: IIndex) {
        super(props)

        this._tagStore = props.tagStore
      }

      public componentDidMount() {
        this._tagStore.resetPagination()
        this._tagStore.fetchTags()
      }

      public render() {
        return (
          <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
            <Head>
              <title key="title">Manage Tags</title>
            </Head>
            <div className="pb-4 text-xl font-medium text-primary-light">Manage Tags</div>
            <Divider style={{ marginBottom: '2em' }} />
            <Button
              aria-label="Create tag"
              variant="contained"
              color="primary"
              onClick={this.openCreateModal}
              className="mb-8 self-end"
              size="small"
            >
              Create a Tag
            </Button>
            {this._tagStore.loading ? (
              <div className="flex flex-wrap justify-center">
                <SkeletonLoader count={3} type="table" />
              </div>
            ) : (
              <>
                {this.state.modalOpen && (
                  <TagModifyModal
                    open={this.state.modalOpen}
                    onClose={this.closeModal}
                    createTag={this.state.createTag}
                  />
                )}

                {this._tagStore.tags.size > 0 ? (
                  <TagTable
                    onTagSelect={this.openEditModal}
                    selectedTagId={this._tagStore.selectedTagId}
                    data={this._tagStore.tags}
                    rowsPerPage={this._tagStore.pageSize}
                    totalCount={this._tagStore.totalCount}
                    setRowsPerPage={this.setPageSize}
                    setPageNumber={this.setPageNumber}
                    setSort={this.setSort}
                    pageNumber={this._tagStore.pageNumber}
                    sortColumn={this._tagStore.sortColumn}
                    sortDirection={this._tagStore.sortDirection}
                  />
                ) : (
                  <div style={{ padding: '4em 0' }}>
                    <Typography variant="h6" align="center">
                      No tags found. Go ahead and create some
                    </Typography>
                  </div>
                )}
              </>
            )}
          </div>
        )
      }

      private setPageSize = (pageSize: number) => {
        this._tagStore.setPageSize(pageSize)
        this._tagStore.fetchTags()
      }

      private setPageNumber = (pageNumber: number) => {
        this._tagStore.setPageNumber(pageNumber)
        this._tagStore.fetchTags()
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._tagStore.setSortDirection(sortDirection)
        this._tagStore.setSortColumn(sortColumn)
        this._tagStore.fetchTags()
      }

      private openModal = () => {
        this.setState({ modalOpen: true })
      }

      private closeModal = () => {
        this.setState({ modalOpen: false })
        this._tagStore.resetCreateOrUpdate()
      }

      private openCreateModal = () => {
        this._tagStore.setTagToCreateOrModify(-1)
        this.setState({ createTag: true })
        this.openModal()
      }

      private openEditModal = (tagId: number) => {
        this._tagStore.setTagToCreateOrModify(tagId)
        this.setState({ createTag: false })
        this.openModal()
      }
    }
  )
)

export default withAuth(Index, Role.SuperAdmin)
