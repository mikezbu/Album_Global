import { Chip, IconButton } from '@mui/material'
import { observer } from 'mobx-react'
import React from 'react'
import ShareIcon from '@mui/icons-material/Share'
import { generateRandomColor } from 'src/common/styles/SharedStyles'

import CollectionModel, {
  CollectionStatus,
} from 'src/modules/collection/store/model/CollectionModel'

interface ICollectionCard {
  collection: CollectionModel
  handleClick: (collectionId: number, type: number) => void
  onOpenShareModal?: (id: number) => void
  modifying?: boolean
}

export const CollectionCard: React.FunctionComponent<ICollectionCard> = observer(
  (props: ICollectionCard) => {
    const onOpenShareModal = e => {
      e.stopPropagation()

      if (props.onOpenShareModal) {
        props.onOpenShareModal(props.collection.id)
      }
    }

    const collection = props.collection

    const getStatusColor = (status: number) => {
      switch (status) {
        case CollectionStatus.Unpublished:
          return 'bg-yellow-600'
        case CollectionStatus.Published:
          return 'bg-green-600'
        case CollectionStatus.Archived:
          return 'bg-red-600'
        default:
          return 'N/A'
      }
    }

    return (
      <div
        className="group flex w-full min-w-[100px] max-w-[250px] cursor-pointer flex-col overflow-hidden rounded-sm bg-background-dark hover:shadow-sm hover:shadow-background-light"
        onClick={() => props.handleClick(collection.id, collection.type)}
      >
        <div className="relative">
          <div className="absolute bottom-0 hidden w-full justify-between p-2.5 transition duration-500 ease-in group-hover:flex">
            {props.onOpenShareModal && (
              <IconButton
                aria-label="share"
                onClick={onOpenShareModal}
                size="small"
                className="h-full bg-slate-700/[.6] pr-[7px] hover:bg-slate-700/[.8]"
              >
                <ShareIcon />
              </IconButton>
            )}
          </div>
          <div className="absolute bottom-0 flex w-full justify-end p-2.5">
            {props.modifying && (
              <Chip
                label={collection.statusLabel}
                size="small"
                className={`mr-3 text-xs font-bold ${getStatusColor(collection.status)}`}
              />
            )}
          </div>
          {collection.albumArtUrl ? (
            <div
              className="h-0 bg-cover bg-center bg-no-repeat pt-16/9"
              style={{ backgroundImage: `url(${collection.albumArtUrl})` }}
            />
          ) : (
            <div
              className="h-0 pt-16/9"
              style={{ background: generateRandomColor(collection.id) }}
            />
          )}
        </div>
        <div className="flex h-full flex-col justify-center p-4">
          <div className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-medium hover:text-primary-main">
            {collection.name}
          </div>
          <div className="cursor-pointer text-sm opacity-60 hover:underline">
            {collection.tracks.size} Track{collection.tracks.size > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    )
  }
)

export default CollectionCard
