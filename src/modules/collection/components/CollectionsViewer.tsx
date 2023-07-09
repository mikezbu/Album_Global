import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { TrackCollectionStore } from 'src/common/store'
import { Operation } from 'src/common/store/util/SearchCriteria'
import CollectionCard from 'src/modules/collection/components/CollectionCard'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
interface ICollectionsViewer {
  trackCollectionStore?: TrackCollectionStore
  artistId?: number
  self?: boolean
}

const CollectionsViewer = inject('trackCollectionStore')(
  observer(
    class CollectionsViewer extends React.Component<ICollectionsViewer> {
      public state = {}

      private readonly _trackCollectionStore: TrackCollectionStore

      constructor(props: ICollectionsViewer) {
        super(props)

        this._trackCollectionStore = props.trackCollectionStore
      }

      public componentDidMount() {
        this._trackCollectionStore.setPageSize(48)

        this.fetchCollections()
      }

      public componentDidUpdate(previousProps: ICollectionsViewer) {
        if (
          (this.props.artistId && previousProps.artistId !== this.props.artistId) ||
          this.props.self !== previousProps.self
        ) {
          this.fetchCollections()
        }
      }

      public render() {
        const collections = []

        this._trackCollectionStore.trackCollections.forEach((collection: CollectionModel) => {
          collections.push(
            <CollectionCard
              collection={collection}
              key={collection.id}
              handleClick={this.handleClick}
              modifying={this.props.self}
            />
          )
        })

        return (
          <div className="flex w-full flex-wrap justify-center gap-6 py-4 after:flex-auto sm:justify-start sm:after:content-['']">
            {this._trackCollectionStore.loading ? (
              <SkeletonLoader count={12} type="card" />
            ) : (
              collections
            )}
          </div>
        )
      }

      private handleClick = (collectionId: number) => {
        Router.push('/collection/[collectionId]', `/collection/${collectionId}`)
      }

      private fetchCollections = () => {
        const filterCriteria = {
          columns: [],
          joins: [],
        }

        if (this.props.artistId && !this.props.self) {
          filterCriteria.joins.push({
            key: 'artistIds',
            operation: Operation.In,
            value: [this.props.artistId],
          })
          this._trackCollectionStore.searchCollections(filterCriteria)
        } else if (this.props.artistId && this.props.self) {
          this._trackCollectionStore.fetchCollectionByArtist(this.props.artistId)
        } else {
          this._trackCollectionStore.searchCollections(filterCriteria)
        }
      }
    }
  )
)

export default CollectionsViewer
