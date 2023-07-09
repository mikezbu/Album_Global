import { Button, Divider, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { CollectionStore, UserStore } from 'src/common/store'
import CollectionCard from 'src/modules/collection/components/CollectionCard'
import CollectionModifyModal from 'src/modules/collection/components/CollectionModifyModal'
import CollectionModel, { CollectionType } from 'src/modules/collection/store/model/CollectionModel'

const PREFIX = 'SamplePackManagement'

const classes = {
  container: `${PREFIX}-container`,
  header: `${PREFIX}-header`,
  addNewButton: `${PREFIX}-addNewButton`,
  collectionContainer: `${PREFIX}-collectionContainer`,
}

const Root = styled('div')(() => ({
  [`&.${classes.container}`]: {
    position: 'relative',
    width: '100%',
    padding: '2em',
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.header}`]: {
    paddingBottom: '1em',
  },

  [`& .${classes.addNewButton}`]: {
    alignSelf: 'flex-end',
    marginBottom: '1em',
  },

  [`& .${classes.collectionContainer}`]: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
}))

interface ISamplePackManagement {
  collectionStore?: CollectionStore
  userStore?: UserStore
}

const SamplePackManagement = inject(
  'collectionStore',
  'userStore'
)(
  observer(
    class SamplePackManagement extends React.Component<ISamplePackManagement> {
      public state = {
        modalOpen: false,
        createCollection: false,
      }

      private readonly _collectionStore: CollectionStore
      private readonly _userStore: UserStore

      constructor(props: ISamplePackManagement) {
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
          CollectionType.Sample
        )
      }

      public render() {
        const collectionValues = values(this._collectionStore.samplePacks)

        return (
          <Root className={classes.container}>
            <Typography variant="h6" gutterBottom>
              Manage samples packs
            </Typography>
            <Divider style={{ marginBottom: '1em' }} />
            <Button
              aria-label="Create sample pack"
              variant="contained"
              color="primary"
              onClick={this.openCreateModal}
              className={classes.addNewButton}
            >
              Create sample pack
            </Button>
            {this._collectionStore.loading ? (
              <div className={classes.collectionContainer}>
                <SkeletonLoader count={3} type="track" />
              </div>
            ) : (
              <>
                {this.state.modalOpen && (
                  <CollectionModifyModal
                    type={CollectionType.Sample}
                    open={this.state.modalOpen}
                    onClose={this.closeModal}
                    createCollection={this.state.createCollection}
                  />
                )}

                {this._collectionStore.samplePacks && this._collectionStore.samplePacks.size > 0 ? (
                  <div className={classes.collectionContainer}>
                    {collectionValues.map((collection: CollectionModel) => (
                      <CollectionCard
                        collection={collection}
                        key={collection.id}
                        handleClick={this.openEditModal}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '4em 0' }}>
                    <Typography variant="h6" align="center">
                      You have no samples packs, why don`&apos;`t you create one
                    </Typography>
                  </div>
                )}
              </>
            )}
          </Root>
        )
      }

      private openModal = () => {
        this._collectionStore.handleCollectionToCreateOrModifyInputChange(
          'type',
          CollectionType.Sample
        )
        this.setState({ modalOpen: true })
      }

      private closeModal = () => {
        this.setState({ modalOpen: false })
      }

      private openCreateModal = () => {
        this._collectionStore.handleCollectionToCreateOrModifyInputChange(
          'type',
          CollectionType.Sample
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

export default SamplePackManagement
