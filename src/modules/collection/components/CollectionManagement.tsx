import { Button, Typography } from '@mui/material'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { CollectionStore, UserStore } from 'src/common/store'
import CollectionCard from 'src/modules/collection/components/CollectionCard'
import CollectionModifyModal from 'src/modules/collection/components/CollectionModifyModal'
import CollectionModel, { CollectionType } from 'src/modules/collection/store/model/CollectionModel'
interface ICollectionManagement {
  collectionStore?: CollectionStore
  userStore?: UserStore
}

const CollectionManagement = inject(
  'collectionStore',
  'userStore'
)(
  observer(
    class CollectionManagement extends React.Component<ICollectionManagement> {
      public state = {
        modalOpen: false,
        createCollection: false,
      }

      private readonly _collectionStore: CollectionStore
      private readonly _userStore: UserStore

      constructor(props: ICollectionManagement) {
        super(props)

        this._collectionStore = props.collectionStore
        this._userStore = props.userStore
      }

      public componentDidMount() {
        this._collectionStore.resetPagination()
        this._collectionStore.setSortColumn('name')
        this._collectionStore.setSortDirection('asc')
        this._collectionStore.setPageSize(48)
        this._collectionStore.fetchCollectionByArtistId(
          this._userStore.user.artistId,
          CollectionType.Track
        )
      }

      public render() {
        const collectionValues = values(this._collectionStore.trackCollections)

        return (
          <div className="relative flex w-full flex-col p-6 pb-28 pt-0 sm:p-8 sm:pt-0">
            <Button
              aria-label="Create collection"
              variant="contained"
              onClick={this.openCreateModal}
              className="mt-4 self-end"
              size="small"
            >
              Create collection
            </Button>
            {this._collectionStore.loading ? (
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                <SkeletonLoader count={12} type="card" />
              </div>
            ) : (
              <>
                {this.state.modalOpen && (
                  <CollectionModifyModal
                    type={CollectionType.Track}
                    open={this.state.modalOpen}
                    onClose={this.closeModal}
                    createCollection={this.state.createCollection}
                  />
                )}

                {this._collectionStore.trackCollections &&
                this._collectionStore.trackCollections.size > 0 ? (
                  <div className="flex flex-wrap gap-6 pt-6">
                    {collectionValues.map((collection: CollectionModel) => (
                      <CollectionCard
                        collection={collection}
                        key={collection.id}
                        handleClick={this.openEditModal}
                        modifying
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '4em 0' }}>
                    <Typography variant="h6" align="center">
                      No collections found
                    </Typography>
                  </div>
                )}
              </>
            )}
          </div>
        )
      }

      private openModal = () => {
        this._collectionStore.handleCollectionToCreateOrModifyInputChange(
          'type',
          CollectionType.Track
        )
        this.setState({ modalOpen: true })
      }

      private closeModal = () => {
        this.setState({ modalOpen: false })
      }

      private openCreateModal = () => {
        this._collectionStore.handleCollectionToCreateOrModifyInputChange(
          'type',
          CollectionType.Track
        )
        this.setState({ createCollection: true })
        this.openModal()
      }

      private openEditModal = (collectionId: number) => {
        this._collectionStore.setCollectionToCreateOrModify(collectionId)
        this.setState({ createCollection: false })
        this.openModal()
      }
    }
  )
)

export default CollectionManagement
